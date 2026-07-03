import { API_BASE } from '../config/api';

export type ConnectionState = 'ONLINE' | 'OFFLINE' | 'RECONNECTING' | 'MAINTENANCE' | 'CIRCUIT_OPEN';
export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface RecoveryLogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'warn' | 'error' | 'success';
}

export interface QueuedRequest {
  id: string;
  fn: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  method: string;
  url: string;
  timestamp: number;
}

class RecoveryManagerService {
  private connectionState: ConnectionState = 'ONLINE';
  private circuitState: CircuitState = 'CLOSED';
  private failureCount = 0;
  private readonly failureThreshold = 5;
  private isSystemReady = false;
  private queue: QueuedRequest[] = [];
  private logs: RecoveryLogEntry[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
      this.startHealthMonitoring();
    }
  }

  // Register state change listeners
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // Logging utility
  public log(message: string, type: 'info' | 'warn' | 'error' | 'success' = 'info') {
    const entry: RecoveryLogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    this.logs.unshift(entry);
    if (this.logs.length > 50) {
      this.logs.pop();
    }
    if (import.meta.env.DEV) {
      console.log(`[RECOVERY MANAGER] [${type.toUpperCase()}] ${message}`);
    }
    this.notify();
  }

  private handleNetworkChange(online: boolean) {
    if (online) {
      this.log('Network interface restored online', 'success');
      this.checkHealthNow();
    } else {
      this.connectionState = 'OFFLINE';
      this.log('Network interface disconnected offline', 'error');
      this.notify();
    }
  }

  // Get current state values
  public isReady(): boolean {
    return this.isSystemReady;
  }

  public getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  public getCircuitState(): CircuitState {
    return this.circuitState;
  }

  public getQueueLength(): number {
    return this.queue.length;
  }

  public getLogs(): RecoveryLogEntry[] {
    return this.logs;
  }

  public getQueue(): QueuedRequest[] {
    return this.queue;
  }

  // Health checker loop
  private startHealthMonitoring() {
    this.checkHealthNow();
    setInterval(() => {
      this.checkHealthNow();
    }, 8000);
  }

  public async checkHealthNow(): Promise<boolean> {
    if (typeof window !== 'undefined' && !navigator.onLine) {
      this.connectionState = 'OFFLINE';
      this.notify();
      return false;
    }

    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.status === 503) {
        this.connectionState = 'MAINTENANCE';
        this.log('Server reports undergoing maintenance (503)', 'warn');
        this.notify();
        return false;
      }

      if (res.ok) {
        const data = await res.json();
        const dbReady = data.database;
        const systemStatus = data.status;

        if (systemStatus === 'healthy' && dbReady) {
          if (!this.isSystemReady) {
            this.isSystemReady = true;
            this.log('ARCUS Startup synchronization: Ready & Connected', 'success');
          }

          if (this.connectionState !== 'ONLINE') {
            this.connectionState = 'ONLINE';
            this.log('Server connection fully restored', 'success');
            window.dispatchEvent(new CustomEvent('arcus-reconnected'));
          }

          // Close circuit and flush request queue
          if (this.circuitState !== 'CLOSED') {
            this.circuitState = 'CLOSED';
            this.failureCount = 0;
            this.log('Circuit closed: Connection stable. Flushing queue.', 'success');
            this.flushQueue();
          }

          return true;
        } else {
          this.log(`Health check reports system status: ${systemStatus}, Database ready: ${dbReady}`, 'warn');
          return false;
        }
      } else {
        this.handleFailure();
        return false;
      }
    } catch (err: any) {
      this.handleFailure();
      return false;
    }
  }

  // Handle consecutive request failures for circuit breaker
  public recordFailure() {
    this.failureCount++;
    if (this.circuitState === 'CLOSED' && this.failureCount >= this.failureThreshold) {
      this.circuitState = 'OPEN';
      this.connectionState = 'CIRCUIT_OPEN';
      this.log(`Circuit opened after ${this.failureCount} consecutive failures. Request stream paused.`, 'error');
      this.notify();
    }
  }

  public recordSuccess() {
    if (this.failureCount > 0) {
      this.failureCount = 0;
      if (this.circuitState === 'HALF_OPEN') {
        this.circuitState = 'CLOSED';
        this.log('Circuit returned to CLOSED state after successful test request.', 'success');
        this.flushQueue();
      }
    }
  }

  private handleFailure() {
    this.recordFailure();
    if (this.connectionState !== 'OFFLINE' && this.connectionState !== 'CIRCUIT_OPEN') {
      this.connectionState = 'RECONNECTING';
      this.notify();
    }
  }

  // Queue and buffer outgoing fetch tasks
  public queueRequest<T = any>(
    fn: () => Promise<T>,
    method: string,
    url: string
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const request: QueuedRequest = {
        id,
        fn,
        resolve,
        reject,
        method,
        url,
        timestamp: Date.now()
      };

      // Deduplicate identical reads (GET requests)
      if (method === 'GET' && this.queue.some(r => r.method === 'GET' && r.url === url)) {
        this.log(`Deduplicated queued GET request: ${url}`, 'info');
        // Link resolution to the original request
        const original = this.queue.find(r => r.method === 'GET' && r.url === url);
        if (original) {
          const originalResolve = original.resolve;
          original.resolve = (val) => {
            originalResolve(val);
            resolve(val);
          };
          return;
        }
      }

      this.queue.push(request);
      this.log(`Queued request: [${method}] ${url.split('?')[0]} (${this.queue.length} in buffer)`, 'warn');
      this.notify();
    });
  }

  // Process queued requests once connection restored
  private async flushQueue() {
    if (this.queue.length === 0) return;
    this.log(`Resuming and executing ${this.queue.length} buffered requests...`, 'info');

    const tasks = [...this.queue];
    this.queue = [];
    this.notify();

    for (const task of tasks) {
      try {
        const result = await task.fn();
        task.resolve(result);
      } catch (err) {
        task.reject(err);
      }
    }
  }

  // Authenticated user revalidation helper
  public async refreshSession(): Promise<void> {
    const token = localStorage.getItem('arcus_token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401 || res.status === 403) {
        this.log('Session revalidation rejected. Access revoked.', 'error');
        localStorage.removeItem('arcus_token');
        localStorage.removeItem('arcus_cached_user');
        window.location.reload();
      } else if (res.ok) {
        const data = await res.json();
        localStorage.setItem('arcus_cached_user', JSON.stringify(data));
        this.log('Session successfully revalidated in background.', 'success');
      }
    } catch {
      this.log('Failed to revalidate session due to network issue. Retaining cached user.', 'warn');
    }
  }
}

export const RecoveryManager = new RecoveryManagerService();
