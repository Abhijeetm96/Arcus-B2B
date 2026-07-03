import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

interface OfflineIndicatorProps {
  isOffline: boolean;
  isReconnecting: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ isOffline, isReconnecting }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOffline) {
      setVisible(true);
    } else {
      // Keep it visible for 2 seconds after online to show "Connection Restored"
      const t = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(t);
    }
  }, [isOffline]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full border shadow-lg text-xs font-semibold ${
        isOffline 
          ? 'bg-[#0A0A0A] border-red-800 text-red-200' 
          : 'bg-[#0A0A0A] border-emerald-800 text-emerald-200'
      }`}>
        {isOffline ? (
          <>
            <WifiOff className="h-4 w-4 text-red-400" />
            <span>No internet connection.</span>
            {isReconnecting && (
              <RefreshCw className="h-3 w-3 animate-spin text-red-400" />
            )}
          </>
        ) : (
          <>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span>Connection restored!</span>
          </>
        )}
      </div>
    </div>
  );
};
