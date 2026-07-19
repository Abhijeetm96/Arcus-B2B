import React, { useState } from 'react';
import { Bell, CheckCheck, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';
import { useNotifications } from './useNotifications';
import type { NotificationItem } from './useNotifications';

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markAsRead, markAllAsRead, removeNotification } = useNotifications();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getPriorityIcon = (priority: NotificationItem['priority']) => {
    switch (priority) {
      case 'critical':
        return <AlertOctagon size={16} className="text-red-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-yellow-500 shrink-0" />;
      default:
        return <Info size={16} className="text-blue-500 shrink-0" />;
    }
  };

  return (
    <div className="relative z-40">
      {/* Bell Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full text-[9px] font-bold w-4 h-4 flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover overlay */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-800">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-primary/20 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-1 transition-colors"
              >
                <CheckCheck size={12} />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <Bell size={24} className="mx-auto mb-2 text-slate-300" />
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 hover:bg-slate-50 transition-colors flex items-start gap-2.5 relative group ${
                    !n.read ? 'bg-primary/5 hover:bg-primary/10' : ''
                  }`}
                >
                  {getPriorityIcon(n.priority)}
                  <div className="flex-1 pr-4">
                    <h4 className="text-xs font-semibold text-slate-800 mb-0.5 leading-snug">
                      {n.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mb-1.5 leading-relaxed">{n.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-slate-400">
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {n.actionUrl && (
                        <a
                          href={n.actionUrl}
                          className="text-[10px] text-primary hover:underline font-semibold"
                          onClick={() => markAsRead(n.id)}
                        >
                          {n.actionLabel || 'View Detail'}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="absolute right-2.5 top-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.read && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors"
                        title="Mark as read"
                      >
                        <CheckCheck size={12} />
                      </button>
                    )}
                    <button
                      onClick={() => removeNotification(n.id)}
                      className="p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-red-500 transition-colors"
                      title="Delete notification"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
