import { toast } from 'sonner';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface HistoryEntry {
  id: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
  status: 'unread' | 'read' | 'dismissed';
  details?: {
    url?: string;
    status?: number;
    endpoint?: string;
    correlationId?: string;
  };
}

// In-memory notification history (capped at 100 entries)
export const notificationHistory: HistoryEntry[] = [];

const addToHistory = (
  id: string,
  message: string,
  type: NotificationType,
  details?: HistoryEntry['details']
) => {
  const entry: HistoryEntry = {
    id,
    message,
    type,
    timestamp: new Date(),
    status: 'unread',
    details
  };
  notificationHistory.unshift(entry);
  if (notificationHistory.length > 100) {
    notificationHistory.pop();
  }
  // Dispatch custom event for history updates
  window.dispatchEvent(new CustomEvent('arcus-notification-history-updated'));
};

// Cache for duplicate suppression
interface CachedToast {
  message: string;
  type: NotificationType;
  timestamp: number;
  count: number;
  toastId: string | number;
}

const cache = new Map<string, CachedToast>();
const CACHE_WINDOW_MS = 3000; // 3 seconds window for duplicates

const getCacheKey = (message: string, type: NotificationType) => `${type}:${message}`;

const isDev = import.meta.env?.DEV || false;

// Custom toast styling helpers matching ARCUS design system
const getToastStyles = (type: NotificationType) => {
  const base = 'flex items-center gap-3 p-4 rounded-lg border shadow-lg max-w-sm w-full font-sans text-xs transition-all duration-300';
  switch (type) {
    case 'success':
      return {
        className: `${base} bg-[#0A0A0A] border-emerald-500 text-emerald-400 font-semibold`,
        duration: 3000
      };
    case 'error':
      return {
        className: `${base} bg-[#0A0A0A] border-red-500 text-red-400 font-semibold`,
        duration: Infinity // persistent until manual dismiss
      };
    case 'warning':
      return {
        className: `${base} bg-[#0A0A0A] border-[#fabd00] text-[#fabd00] font-semibold`,
        duration: 6000
      };
    case 'info':
      return {
        className: `${base} bg-[#0A0A0A] border-sky-500 text-sky-400 font-semibold`,
        duration: 4000
      };
    case 'loading':
    default:
      return {
        className: `${base} bg-[#0A0A0A] border-slate-700 text-slate-300 font-semibold`,
        duration: Infinity
      };
  }
};

const handleDuplicateSuppression = (
  message: string,
  type: Exclude<NotificationType, 'loading'>,
  details?: HistoryEntry['details']
): string | number | null => {
  const key = getCacheKey(message, type);
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && now - cached.timestamp < CACHE_WINDOW_MS) {
    cached.count += 1;
    cached.timestamp = now;
    const styles = getToastStyles(type);
    
    // Format message with duplication counter
    const updatedMessage = `${message} (${cached.count} requests affected)`;
    
    // Update the existing toast
    toast(updatedMessage, {
      id: cached.toastId,
      ...styles
    });

    addToHistory(String(cached.toastId), message, type, details);
    return cached.toastId;
  }

  return null;
};

const createNewToast = (
  message: string,
  type: NotificationType,
  details?: HistoryEntry['details']
): string | number => {
  const id = Math.random().toString(36).substring(7);
  const styles = getToastStyles(type);

  // If in development mode, append technical details if available
  let displayMessage = message;
  if (isDev && details) {
    const techDetails = [];
    if (details.url) techDetails.push(`URL: ${details.url}`);
    if (details.status) techDetails.push(`Status: ${details.status}`);
    if (details.correlationId) techDetails.push(`CID: ${details.correlationId}`);
    if (techDetails.length > 0) {
      displayMessage = `${message} [Dev Mode: ${techDetails.join(' | ')}]`;
    }
  }

  const toastId = toast(displayMessage, {
    id,
    ...styles
  });

  // Add to duplicate suppression cache if it's not a loading toast
  if (type !== 'loading') {
    cache.set(getCacheKey(message, type), {
      message,
      type,
      timestamp: Date.now(),
      count: 1,
      toastId
    });
    // Expire cache after window passes
    setTimeout(() => {
      const currentCached = cache.get(getCacheKey(message, type));
      if (currentCached && currentCached.toastId === toastId) {
        cache.delete(getCacheKey(message, type));
      }
    }, CACHE_WINDOW_MS);
  }

  addToHistory(String(toastId), message, type, details);
  return toastId;
};

export const notification = {
  success: (message: string, details?: HistoryEntry['details']) => {
    const suppressedId = handleDuplicateSuppression(message, 'success', details);
    if (suppressedId !== null) return suppressedId;
    return createNewToast(message, 'success', details);
  },

  error: (message: string, details?: HistoryEntry['details']) => {
    const suppressedId = handleDuplicateSuppression(message, 'error', details);
    if (suppressedId !== null) return suppressedId;
    return createNewToast(message, 'error', details);
  },

  warning: (message: string, details?: HistoryEntry['details']) => {
    const suppressedId = handleDuplicateSuppression(message, 'warning', details);
    if (suppressedId !== null) return suppressedId;
    return createNewToast(message, 'warning', details);
  },

  info: (message: string, details?: HistoryEntry['details']) => {
    const suppressedId = handleDuplicateSuppression(message, 'info', details);
    if (suppressedId !== null) return suppressedId;
    return createNewToast(message, 'info', details);
  },

  loading: (message: string, details?: HistoryEntry['details']) => {
    return createNewToast(message, 'loading', details);
  },

  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string },
    details?: HistoryEntry['details']
  ): Promise<T> => {
    const loadingId = createNewToast(messages.loading, 'loading', details);
    
    return promise
      .then((res) => {
        toast.dismiss(loadingId);
        createNewToast(messages.success, 'success', details);
        return res;
      })
      .catch((err) => {
        toast.dismiss(loadingId);
        const errMsg = err instanceof Error ? err.message : String(err);
        createNewToast(`${messages.error}: ${errMsg}`, 'error', details);
        throw err;
      });
  },

  dismiss: (id?: string | number) => {
    toast.dismiss(id);
    if (id !== undefined) {
      const entry = notificationHistory.find(e => e.id === String(id));
      if (entry) {
        entry.status = 'dismissed';
      }
    }
  },

  clearAll: () => {
    toast.dismiss();
    notificationHistory.forEach(e => {
      e.status = 'dismissed';
    });
  }
};
