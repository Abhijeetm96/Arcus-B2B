import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Toaster } from 'sonner';
import { ConfirmDialog } from '../components/feedback/ConfirmDialog/ConfirmDialog';
import { OfflineIndicator } from '../components/feedback/OfflineIndicator/OfflineIndicator';
import { Banner } from '../components/feedback/Banner/Banner';

interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'primary' | 'danger' | 'warning' | 'info';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface NotificationContextType {
  isOffline: boolean;
  isBackendDown: boolean;
  isDbDown: boolean;
  isMaintenanceMode: boolean;
  confirm: (options: ConfirmOptions) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isBackendDown, setIsBackendDown] = useState(false);
  const [isDbDown, setIsDbDown] = useState(false);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [wasDown, setWasDown] = useState(false);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    type?: 'primary' | 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    onCancel: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
    onCancel: () => {}
  });

  const confirm = useCallback((options: ConfirmOptions) => {
    setConfirmDialog({
      isOpen: true,
      title: options.title,
      description: options.description,
      confirmLabel: options.confirmLabel,
      cancelLabel: options.cancelLabel,
      type: options.type,
      onConfirm: () => {
        options.onConfirm();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
      onCancel: () => {
        if (options.onCancel) options.onCancel();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  }, []);

  // Poll server health check
  const checkHealth = async () => {
    if (!navigator.onLine) {
      setIsOffline(true);
      return;
    }

    setIsReconnecting(true);
    try {
      const res = await fetch('/api/health');
      if (res.status === 503) {
        setIsMaintenanceMode(true);
        setIsBackendDown(false);
        setIsDbDown(false);
        setWasDown(true);
      } else if (res.ok) {
        const data = await res.json();
        setIsOffline(false);
        setIsBackendDown(false);
        setIsMaintenanceMode(false);
        setIsDbDown(!data.database); // Set dbDown if postgres database health check returned false

        if (wasDown) {
          // Dispatch reconnection event to trigger dashboard reloads
          window.dispatchEvent(new CustomEvent('arcus-reconnected'));
          setWasDown(false);
        }
      } else {
        setIsBackendDown(true);
        setWasDown(true);
      }
    } catch {
      setIsBackendDown(true);
      setWasDown(true);
    } finally {
      setIsReconnecting(false);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      checkHealth();
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    checkHealth();

    // 15 seconds polling interval
    const interval = setInterval(checkHealth, 15000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        isOffline,
        isBackendDown,
        isDbDown,
        isMaintenanceMode,
        confirm
      }}
    >
      <div className="flex flex-col min-h-screen">
        {/* Banner Overlays */}
        {isOffline && (
          <Banner
            message="Offline Mode: You are currently disconnected from the internet."
            type="error"
            iconType="offline"
          />
        )}
        {!isOffline && isBackendDown && (
          <Banner
            message="Backend server unreachable. Attempting reconnection..."
            type="error"
            iconType="offline"
            actionLabel="Retry Now"
            onActionClick={checkHealth}
          />
        )}
        {!isOffline && !isBackendDown && isDbDown && (
          <Banner
            message="Database unavailable. System running in read-only mode."
            type="warning"
            iconType="database"
            actionLabel="Refresh Connection"
            onActionClick={checkHealth}
          />
        )}
        {!isOffline && !isBackendDown && !isDbDown && isMaintenanceMode && (
          <Banner
            message="ARCUS is currently undergoing scheduled database optimization and maintenance."
            type="warning"
            iconType="maintenance"
          />
        )}

        {/* Core App View */}
        <div className="flex-grow flex flex-col">
          {children}
        </div>
      </div>

      {/* Global Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, isOpen: open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel={confirmDialog.confirmLabel}
        cancelLabel={confirmDialog.cancelLabel}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={confirmDialog.onCancel}
      />

      {/* Floating Offline Recovery Indicator */}
      <OfflineIndicator isOffline={isOffline} isReconnecting={isReconnecting} />

      {/* Global Toast Mount */}
      <Toaster 
        theme="dark" 
        position="top-right" 
        closeButton 
        expand={false} 
        richColors={false}
      />
    </NotificationContext.Provider>
  );
};
