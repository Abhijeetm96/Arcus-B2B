import { useState } from 'react';
import { toast } from 'sonner';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  read: boolean;
  priority: 'info' | 'warning' | 'critical';
  actionUrl?: string;
  actionLabel?: string;
  timestamp: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const stored = localStorage.getItem('arcus_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const saveNotifications = (items: NotificationItem[]) => {
    setNotifications(items);
    localStorage.setItem('arcus_notifications', JSON.stringify(items));
  };

  const addNotification = (item: Omit<NotificationItem, 'id' | 'read' | 'timestamp'>) => {
    const newItem: NotificationItem = {
      ...item,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      read: false,
      timestamp: new Date().toISOString(),
    };

    saveNotifications([newItem, ...notifications]);

    // Pushes dynamic toasts depending on priority
    if (item.priority === 'critical') {
      toast.error(item.title, { description: item.message });
    } else if (item.priority === 'warning') {
      toast.warning(item.title, { description: item.message });
    } else {
      toast.success(item.title, { description: item.message });
    }
  };

  const markAsRead = (id: string) => {
    saveNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    saveNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    saveNotifications(notifications.filter((n) => n.id !== id));
  };

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
  };
};
