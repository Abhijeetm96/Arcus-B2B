import { RecoveryManager } from './recoveryManager';
import { apiClient, apiFetch } from './api';

export const ApplicationRuntime = {
  // 1. RecoveryManager Core
  recovery: RecoveryManager,

  // 2. ApiManager
  api: {
    client: apiClient,
    fetch: apiFetch
  },

  // 3. HealthManager
  health: {
    check: () => RecoveryManager.checkHealthNow(),
    getLatency: () => RecoveryManager.getHealthLatency(),
    getDbLatency: () => RecoveryManager.getDbLatency()
  },

  // 4. Auth & SessionManager
  auth: {
    getToken: () => localStorage.getItem('arcus_token'),
    getCachedUser: () => {
      const val = localStorage.getItem('arcus_cached_user');
      return val ? JSON.parse(val) : null;
    },
    logout: () => {
      localStorage.removeItem('arcus_token');
      localStorage.removeItem('arcus_cached_user');
      window.location.reload();
    },
    refresh: () => RecoveryManager.refreshSession()
  },

  // 5. DiagnosticsManager
  diagnostics: {
    getLogs: () => RecoveryManager.getLogs(),
    getMemory: () => RecoveryManager.getMemoryRss(),
    getBuildHash: () => RecoveryManager.getBuildHash(),
    getVersion: () => RecoveryManager.getApiVersion()
  },

  // 6. QueueManager
  queue: {
    getLength: () => RecoveryManager.getQueueLength(),
    getQueue: () => RecoveryManager.getQueue()
  },

  // 7. StartupManager
  startup: {
    isReady: () => RecoveryManager.isReady(),
    getConnectionState: () => RecoveryManager.getConnectionState(),
    getCircuitState: () => RecoveryManager.getCircuitState()
  }
};
export type ApplicationRuntimeType = typeof ApplicationRuntime;
