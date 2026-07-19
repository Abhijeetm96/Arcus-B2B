import { API_BASE } from '../config/api';
import { notification } from './notification';
import { RecoveryManager } from './recoveryManager';

export interface ApiRequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  skipAuth?: boolean;
}

export class ApiError extends Error {
  status: number;
  originalError?: any;

  constructor(message: string, status: number, originalError?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.originalError = originalError;
  }
}

/**
 * Maps HTTP Status Codes to specific user-friendly error messages as required by the infrastructure spec.
 */
export const mapHttpStatusToErrorMessage = (status: number, customMessage?: string): string => {
  switch (status) {
    case 401:
      return 'Incorrect email or password';
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return "We couldn't find what you're looking for.";
    case 409:
      return 'This record already exists.';
    case 422:
      return 'Please correct the highlighted fields.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Something went wrong on our side. Please try again shortly.';
    case 503:
      return 'The service is temporarily unavailable.';
    default:
      return customMessage || 'An unexpected error occurred.';
  }
};

const isDev = import.meta.env.DEV;

// Helper to decode JWT payload safely (matching custom token structure)
const decodeTokenExpiry = (token: string): string => {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return 'Never / Unknown';
    const expiresAtMs = parseInt(parts[1], 10);
    if (isNaN(expiresAtMs)) return 'Never / Unknown';
    return new Date(expiresAtMs).toLocaleString();
  } catch {
    return 'Never / Unknown';
  }
};

/**
 * Robust, centralized fetch client for the ARCUS platform APIs.
 * Automatically handles authorization headers, JSON parsing, and detailed error mapping.
 */
export async function apiClient<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  // Call our self-healing, retrying apiFetch wrapper
  const response = await apiFetch(endpoint, options);

  // JSON parsing safety checks
  let data: any = null;
  const contentType = response.headers?.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else if (response.text) {
    const text = await response.text();
    data = text ? { message: text } : {};
  } else {
    data = {};
  }

  // Development Authentication & API Logging
  if (isDev && (endpoint.includes('/auth') || endpoint.includes('/admin'))) {
    console.group(`[API CLIENT LOG] ${fetchOptions.method || 'GET'} ${endpoint}`);
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    // Log authenticated user if payload returned
    if (data && (data.user || data.id)) {
      const userObj = data.user || data;
      console.log(`Authenticated User: ${userObj.email || 'None'} (Role: ${userObj.role || 'None'})`);
    }
    
    // Log token info
    const activeToken = localStorage.getItem('arcus_token') || data?.token;
    if (activeToken) {
      console.log(`Token Expiry: ${decodeTokenExpiry(activeToken)}`);
    }
    console.groupEnd();
  }

  if (!response.ok) {
    const mappedMsg = mapHttpStatusToErrorMessage(
      response.status,
      data?.error || data?.message
    );
    throw new ApiError(mappedMsg, response.status, data);
  }

  return data as T;
}

/**
 * A fetch-compatible client wrapper that handles:
 * - Prepends API_BASE
 * - Injects Authorization token
 * - Handles exponential backoff retries on transient errors (timeouts, TypeError/offline, 502/503/504)
 * - Automatically displays self-healing notifications to the user
 */
export async function apiFetch(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<Response> {
  const { timeout = 30000, retries = 3, skipAuth = false } = options;

  const url = endpoint.startsWith('http://') || endpoint.startsWith('https://')
    ? endpoint
    : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  // Check if circuit breaker is open or connection is down (bypass health checks to avoid loop)
  const connState = RecoveryManager.getConnectionState();
  const isCircuitActive = connState === 'CIRCUIT_OPEN' || connState === 'OFFLINE';
  const isHealthCheck = endpoint.includes('/health');

  if (isCircuitActive && !isHealthCheck) {
    // Queue the request and return its pending promise
    RecoveryManager.log(`Circuit is OPEN or OFFLINE. Queuing [${options.method || 'GET'}] ${endpoint.split('?')[0]}`, 'warn');
    return RecoveryManager.queueRequest(
      () => apiFetch(endpoint, { ...options, retries: 0 }),
      options.method || 'GET',
      url
    );
  }

  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (!skipAuth) {
    const token = localStorage.getItem('arcus_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  let attempt = 0;
  while (true) {
    attempt++;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(id);

      // Record success
      if (response.ok) {
        RecoveryManager.recordSuccess();
      }

      // Retry on server-side gateway or load balancing restarts (502, 503, 504)
      if ([502, 503, 504].includes(response.status) && attempt <= retries) {
        RecoveryManager.recordFailure();
        const delay = [1000, 2000, 5000, 10000][attempt - 1] || 10000;
        const isWrite = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method || 'GET');
        const msg = isWrite
          ? 'Unable to save because the server is temporarily unavailable. Retrying...'
          : 'Server is restarting. Reconnecting automatically...';
        notification.warning(msg, { url });
        
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // Success after self-healing reconnect attempt
      if (attempt > 1 && response.ok) {
        notification.success('Connection restored', { url });
      }

      // Intercept error responses to map status codes into standard fetch Response shape
      if (!response.ok) {
        const originalJson = response.json.bind(response);
        response.json = async () => {
          try {
            const originalData = await originalJson();
            const mappedMsg = mapHttpStatusToErrorMessage(response.status, originalData?.error || originalData?.message);
            return { ...originalData, error: mappedMsg };
          } catch {
            return { error: mapHttpStatusToErrorMessage(response.status) };
          }
        };
      }

      return response;
    } catch (error: any) {
      clearTimeout(id);

      // Record failure
      RecoveryManager.recordFailure();

      const isTimeout = error.name === 'AbortError';
      const isNetwork = error instanceof TypeError;

      if ((isTimeout || isNetwork) && attempt <= retries) {
        const delay = [1000, 2000, 5000, 10000][attempt - 1] || 10000;
        const isWrite = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method || 'GET');
        const msg = isWrite
          ? 'Unable to save because the server is temporarily unavailable. Retrying...'
          : 'Server is restarting. Reconnecting automatically...';
        notification.warning(msg, { url });

        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // Final failure report
      if (attempt > 1) {
        notification.error('Unable to connect to the server.', { url });
      }

      console.error(`[API FETCH] Connection Error on ${url}:`, error);

      const errorMsg = isTimeout ? 'Request timed out.' : 'Unable to connect to the server.';

      return {
        ok: false,
        status: 0,
        statusText: isTimeout ? 'Request Timeout' : 'Network Error',
        headers: new Headers(),
        json: async () => ({ error: errorMsg }),
        text: async () => errorMsg
      } as Response;
    }
  }
}
