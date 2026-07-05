import { useContext } from 'react';
import { NotificationContext } from '../providers/NotificationProvider';
import { notification } from '../lib/notification';

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }

  return {
    ...context,
    // Provide toast triggers directly inside the hook
    success: notification.success,
    error: notification.error,
    warning: notification.warning,
    info: notification.info,
    loading: notification.loading,
    promise: notification.promise,
    dismiss: notification.dismiss,
    clearAll: notification.clearAll
  };
};
