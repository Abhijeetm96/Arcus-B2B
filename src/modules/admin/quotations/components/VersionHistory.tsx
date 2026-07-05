import React from 'react';

interface VersionRecord {
  id: string;
  version: number;
  reason?: string;
  timestamp: string;
  creator_name: string;
}

interface Props {
  versions: VersionRecord[];
  activeVersion: number;
  onSelectVersion?: (v: VersionRecord) => void;
  onCompareVersions?: (v1: number, v2: number) => void;
}

export const VersionHistory: React.FC<Props> = ({
  versions,
  activeVersion,
  onSelectVersion,
  onCompareVersions
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-500 text-lg">history</span>
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Negotiation Version History</h3>
        </div>
      </div>

      {versions.length === 0 ? (
        <div className="text-center py-6 text-slate-400 text-xs">
          No revision history found. This is the initial version (V1).
        </div>
      ) : (
        <div className="space-y-2 text-xs">
          {versions.map((ver, idx) => (
            <div
              key={ver.id}
              onClick={() => onSelectVersion?.(ver)}
              className={`flex flex-col md:flex-row md:items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${ver.version === activeVersion ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-100 bg-slate-50/20 hover:border-slate-300'}`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ver.version === activeVersion ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    V{ver.version}
                  </span>
                  <span className="font-bold text-slate-800">
                    Reason: {ver.reason || 'Negotiation update'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  By {ver.creator_name} | {new Date(ver.timestamp).toLocaleString()}
                </div>
              </div>

              {idx < versions.length - 1 && onCompareVersions && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCompareVersions(versions[idx + 1].version, ver.version);
                  }}
                  className="mt-2 md:mt-0 flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-transparent border-0 py-1"
                >
                  <span className="material-symbols-outlined text-[13px]">difference</span>
                  Compare with V{versions[idx + 1].version}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
