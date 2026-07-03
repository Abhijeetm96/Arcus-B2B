import { API_BASE } from '../config/api';

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
      return 'Invalid email or password.';
    case 403:
      return 'Access denied.';
    case 404:
      return 'Authentication service unavailable.';
    case 422:
      return 'Validation failed.';
    case 500:
      return 'Internal server error.';
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
  const { timeout = 30000, retries = 1, skipAuth = false, ...fetchOptions } = options;

  const url = endpoint.startsWith('http://') || endpoint.startsWith('https://')
    ? endpoint
    : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  // Headers setup
  const headers = new Headers(fetchOptions.headers);
  if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Token Injection
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
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(id);

      // JSON parsing safety checks
      let data: any = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = text ? { message: text } : {};
      }

      // Development Authentication & API Logging
      if (isDev && (url.includes('/api/auth') || url.includes('/api/admin'))) {
        console.group(`[API CLIENT LOG] ${fetchOptions.method || 'GET'} ${url}`);
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

        // Log redirect targets if login succeeded
        if (data && data.success && data.user) {
          const role = (data.user.role || '').toUpperCase();
          const target = role === 'ADMIN' ? '#/portal/admin' : '#/dashboard';
          console.log(`Redirect Destination: ${target}`);
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
    } catch (error: any) {
      clearTimeout(id);

      // Handle aborted/timed-out requests
      if (error.name === 'AbortError') {
        if (attempt < retries) {
          console.warn(`[API CLIENT] Timeout on ${url}. Retrying attempt ${attempt + 1}...`);
          continue;
        }
        throw new ApiError('Unable to connect to the server (Request Timed Out).', 0);
      }

      // Handle connection refusal/network offline errors
      if (error instanceof TypeError) {
        if (attempt < retries) {
          console.warn(`[API CLIENT] Network error on ${url}. Retrying attempt ${attempt + 1}...`);
          continue;
        }
        throw new ApiError('Unable to connect to the server.', 0, error);
      }

      throw error;
    }
  }
}

/**
 * A fetch-compatible client wrapper that handles:
 * - Prepends API_BASE
 * - Injects Authorization token
 * - Handles base error checking and mapping
 * - Compatible with existing .then() / res.json() patterns
 */
export async function apiFetch(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<Response> {
  const { timeout = 30000, skipAuth = false } = options;

  const url = endpoint.startsWith('http://') || endpoint.startsWith('https://')
    ? endpoint
    : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

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

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(id);

    // Development Logging
    if (isDev && (url.includes('/api/auth') || url.includes('/api/admin'))) {
      console.log(`[API FETCH LOG] ${options.method || 'GET'} ${url} Status: ${response.status}`);
    }

    // Intercept error responses to map status codes into standard fetch Response shape
    if (!response.ok) {
      // We wrap the response to return our user-friendly status message when .json() or text() is called
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
    
    // Convert fetch connection errors to user-friendly response mock
    console.error(`[API FETCH] Connection Error on ${url}:`, error);
    
    return {
      ok: false,
      status: 0,
      statusText: 'Network Error',
      json: async () => ({ error: 'Unable to connect to the server.' }),
      text: async () => 'Unable to connect to the server.'
    } as Response;
  }
}
