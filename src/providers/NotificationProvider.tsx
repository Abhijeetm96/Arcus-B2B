import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Toaster } from 'sonner';
import { ConfirmDialog } from '../components/feedback/ConfirmDialog/ConfirmDialog';
import { OfflineIndicator } from '../components/feedback/OfflineIndicator/OfflineIndicator';
import { Banner } from '../components/feedback/Banner/Banner';

import { RecoveryManager } from '../lib/recoveryManager';
import type { ConnectionState } from '../lib/recoveryManager';

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
  const [connState, setConnState] = useState<ConnectionState>(RecoveryManager.getConnectionState());
  const [isDbDown, setIsDbDown] = useState(false);

  useEffect(() => {
    const syncState = () => {
      setConnState(RecoveryManager.getConnectionState());
      // Sync DB down state from log checks or backend status
      const lastLogs = RecoveryManager.getLogs();
      const hasDbErr = lastLogs.length > 0 && lastLogs[0].message.toLowerCase().includes('database ready: false');
      setIsDbDown(hasDbErr);
    };
    
    syncState();
    const unsubscribe = RecoveryManager.subscribe(syncState);
    return () => unsubscribe();
  }, []);

  const isOffline = connState === 'OFFLINE';
  const isBackendDown = connState === 'RECONNECTING' || connState === 'CIRCUIT_OPEN';
  const isMaintenanceMode = connState === 'MAINTENANCE';

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

  const triggerVerification = () => {
    RecoveryManager.checkHealthNow();
  };

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
            onActionClick={triggerVerification}
          />
        )}
        {!isOffline && !isBackendDown && isDbDown && (
          <Banner
            message="Database unavailable. System running in read-only mode."
            type="warning"
            iconType="database"
            actionLabel="Refresh Connection"
            onActionClick={triggerVerification}
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
      <OfflineIndicator isOffline={isOffline} isReconnecting={connState === 'RECONNECTING'} />

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
