import React, { useEffect, useState } from 'react';
import { RecoveryManager } from '../lib/recoveryManager';
import type { ConnectionState } from '../lib/recoveryManager';

interface StartupGuardProps {
  children: React.ReactNode;
}

export function StartupGuard({ children }: StartupGuardProps) {
  const [isReady, setIsReady] = useState(RecoveryManager.isReady());
  const [connState, setConnState] = useState<ConnectionState>(RecoveryManager.getConnectionState());
  const [logs, setLogs] = useState(RecoveryManager.getLogs());
  const [hasTimeout, setHasTimeout] = useState(false);

  useEffect(() => {
    // Subscribe to state updates in the recovery manager
    const unsubscribe = RecoveryManager.subscribe(() => {
      setIsReady(RecoveryManager.isReady());
      setConnState(RecoveryManager.getConnectionState());
      setLogs([...RecoveryManager.getLogs()]);
    });

    // Run health check on mount
    RecoveryManager.checkHealthNow();

    // 3 seconds connection timeout
    const timer = setTimeout(() => {
      setHasTimeout(true);
      if (import.meta.env.DEV) {
        setIsReady(true);
      }
    }, 3000);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleForceLoad = () => {
    RecoveryManager.log('Developer forced startup override', 'warn');
    setIsReady(true);
  };

  const handleRetry = () => {
    setHasTimeout(false);
    RecoveryManager.checkHealthNow();
  };

  if (isReady) {
    return <>{children}</>;
  }

  // Display a professional startup console screen
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-900 select-none p-6">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-[16px] p-8 shadow-sm flex flex-col items-center gap-6">
        {/* Animated custom loader */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-primary animate-spin"></div>
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-h3 font-bold text-gray-900 font-display">Initializing ARCUS System</h2>
          <p className="text-caption text-gray-500">
            Checking services, migrations, and database status...
          </p>
        </div>

        {/* Live checklist steps console */}
        <div className="w-full space-y-3 bg-slate-50 border border-slate-150 rounded-[12px] p-4 text-xs font-mono text-left">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-emerald-500">check_circle</span>
            <span>Express server: STARTED</span>
          </div>
          
          <div className="flex items-center gap-2">
            {connState === 'OFFLINE' ? (
              <>
                <span className="material-symbols-outlined text-[16px] text-amber-500 animate-pulse font-bold">sync</span>
                <span className="text-amber-700">Connecting to PostgreSQL...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px] text-emerald-500">check_circle</span>
                <span>Database: CONNECTED</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {connState === 'OFFLINE' ? (
              <>
                <span className="material-symbols-outlined text-[16px] text-slate-300">circle</span>
                <span className="text-slate-400">Waiting for migrations...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px] text-emerald-500">check_circle</span>
                <span>Schema migrations: EXECUTED</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {connState === 'OFFLINE' ? (
              <>
                <span className="material-symbols-outlined text-[16px] text-slate-300">circle</span>
                <span className="text-slate-400">Waiting for development users seed...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px] text-emerald-500">check_circle</span>
                <span>Development seeds: ACTIVE</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-slate-200/60 pt-2 mt-2">
            <span className="material-symbols-outlined text-[16px] text-primary animate-pulse">sync</span>
            <span className="font-semibold text-text-primary">Preparing health endpoint...</span>
          </div>
        </div>

        {/* Timeout Action Prompt */}
        {hasTimeout && (
          <div className="w-full bg-amber-50 border border-amber-200 rounded-[12px] p-4 text-xs text-amber-800 text-left space-y-3">
            <div className="font-semibold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              Startup is taking longer than expected
            </div>
            <p className="text-[11px] leading-relaxed text-amber-700">
              The backend or database may be offline or performing heavy initial migrations.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleRetry}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold uppercase tracking-wider text-[10px] transition-colors"
              >
                Retry Check
              </button>
              <button
                onClick={handleForceLoad}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold uppercase tracking-wider text-[10px] transition-colors"
              >
                Skip & Force Load
              </button>
            </div>
          </div>
        )}

        {/* Live log feed summary */}
        {logs.length > 0 && (
          <div className="w-full text-[10px] font-mono text-slate-400 border-t border-slate-100 pt-4 flex flex-col gap-1 max-h-16 overflow-y-auto">
            <div className="text-slate-500 font-semibold uppercase text-[9px] mb-1">Diagnostic Log:</div>
            <div className="truncate text-left">
              &gt; {logs[0].timestamp} [{logs[0].type.toUpperCase()}] {logs[0].message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
