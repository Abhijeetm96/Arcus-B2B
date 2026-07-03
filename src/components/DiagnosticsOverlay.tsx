import { useEffect, useState } from 'react';
import { RecoveryManager } from '../lib/recoveryManager';
import type { ConnectionState, CircuitState, RecoveryLogEntry } from '../lib/recoveryManager';

export function DiagnosticsOverlay() {
  // Only render during development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [connState, setConnState] = useState<ConnectionState>(RecoveryManager.getConnectionState());
  const [circuitState, setCircuitState] = useState<CircuitState>(RecoveryManager.getCircuitState());
  const [queueLength, setQueueLength] = useState(RecoveryManager.getQueueLength());
  const [logs, setLogs] = useState<RecoveryLogEntry[]>([]);

  useEffect(() => {
    // Sync states and subscribe to changes
    const updateStates = () => {
      setConnState(RecoveryManager.getConnectionState());
      setCircuitState(RecoveryManager.getCircuitState());
      setQueueLength(RecoveryManager.getQueueLength());
      setLogs([...RecoveryManager.getLogs()]);
    };

    updateStates();
    const unsubscribe = RecoveryManager.subscribe(updateStates);
    return () => unsubscribe();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] select-none font-sans text-xs">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-full shadow-lg border border-slate-700 hover:bg-slate-800 transition-all duration-200"
        >
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              connState === 'ONLINE' ? 'bg-emerald-400' : connState === 'MAINTENANCE' ? 'bg-amber-400' : 'bg-red-400'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              connState === 'ONLINE' ? 'bg-emerald-500' : connState === 'MAINTENANCE' ? 'bg-amber-500' : 'bg-red-500'
            }`}></span>
          </span>
          <span className="font-bold tracking-wider text-[10px] uppercase font-mono">Resilience Console</span>
        </button>
      ) : (
        <div className="w-80 bg-slate-950 text-slate-100 rounded-[14px] shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[380px] animate-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-primary">healing</span>
              <span className="font-bold text-[10px] tracking-wider uppercase text-slate-300">Resilience Diagnostics</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="p-4 grid grid-cols-2 gap-3 border-b border-slate-900/60 bg-slate-950">
            <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/40">
              <div className="text-slate-500 text-[9px] uppercase tracking-wider mb-0.5">Connection</div>
              <div className={`font-bold font-mono text-[10px] ${
                connState === 'ONLINE' ? 'text-emerald-400' : connState === 'MAINTENANCE' ? 'text-amber-400' : 'text-red-400'
              }`}>
                {connState}
              </div>
            </div>
            
            <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/40">
              <div className="text-slate-500 text-[9px] uppercase tracking-wider mb-0.5">Circuit Breaker</div>
              <div className={`font-bold font-mono text-[10px] ${
                circuitState === 'CLOSED' ? 'text-emerald-400' : 'text-red-400 animate-pulse'
              }`}>
                {circuitState}
              </div>
            </div>

            <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/40">
              <div className="text-slate-500 text-[9px] uppercase tracking-wider mb-0.5">Buffered Queue</div>
              <div className="font-bold font-mono text-[10px] text-slate-200">
                {queueLength} requests
              </div>
            </div>

            <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/40">
              <div className="text-slate-500 text-[9px] uppercase tracking-wider mb-0.5">API Base</div>
              <div className="font-mono text-[9px] text-slate-400 truncate">
                http://localhost:5000
              </div>
            </div>
          </div>

          {/* Log Area */}
          <div className="flex-1 overflow-y-auto p-3 font-mono text-[9px] bg-black/40 min-h-[120px] max-h-[160px] border-b border-slate-900 space-y-1.5 scrollbar-thin">
            <div className="text-slate-500 font-bold uppercase tracking-wider text-[8px] mb-1">Live Recovery Log:</div>
            {logs.length === 0 ? (
              <div className="text-slate-600 text-center py-4">No events captured yet.</div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="flex gap-1.5 leading-normal">
                  <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                  <span className={
                    log.type === 'success' ? 'text-emerald-400' :
                    log.type === 'warn' ? 'text-amber-400' :
                    log.type === 'error' ? 'text-red-400' : 'text-slate-300'
                  }>
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Quick Manual Actions */}
          <div className="px-4 py-2 bg-slate-900/80 flex justify-between items-center text-[10px]">
            <span className="text-slate-500 font-mono">v2.0 (Self-Healing)</span>
            <button
              onClick={() => RecoveryManager.checkHealthNow()}
              className="px-2 py-0.5 bg-slate-850 hover:bg-slate-750 text-slate-200 rounded border border-slate-700 transition-colors font-mono"
            >
              Verify Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
