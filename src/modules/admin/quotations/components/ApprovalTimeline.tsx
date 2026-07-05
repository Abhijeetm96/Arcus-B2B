import React from 'react';

interface ApprovalRecord {
  id: string;
  approver_name: string;
  approver_role: string;
  approval_level: number;
  timestamp: string;
  notes?: string;
  signature_hash?: string;
  certificate_id?: string;
}

interface Props {
  approvals: ApprovalRecord[];
  status: string;
  requiredRole?: string | null;
  requiredLevels?: number;
}

export const ApprovalTimeline: React.FC<Props> = ({
  approvals,
  status,
  requiredRole,
  requiredLevels = 1
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-500 text-lg">verified_user</span>
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Multi-Level Approval Timeline</h3>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${status === 'APPROVED' ? 'bg-green-150 text-green-700' : status === 'PENDING_APPROVAL' ? 'bg-amber-150 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
          {status}
        </span>
      </div>

      <div className="text-xs space-y-3">
        {requiredRole && status === 'PENDING_APPROVAL' && (
          <div className="bg-amber-50/50 border border-amber-200/60 p-3 rounded-lg flex items-center gap-3 text-[11px] text-amber-800">
            <span className="material-symbols-outlined text-amber-600 text-lg">info</span>
            <div>
              <strong>Action Required:</strong> Approvals policy requires review by role: <span className="font-mono bg-amber-100 px-1 py-0.5 rounded font-bold">{requiredRole}</span> (Levels: {requiredLevels}) before dispatching to client.
            </div>
          </div>
        )}

        {approvals.length === 0 ? (
          <div className="text-center py-6 text-slate-400">
            No approval records logged. Quotation is currently in <span className="font-bold">{status}</span> status.
          </div>
        ) : (
          <div className="relative border-l border-slate-200 pl-4 ml-2 space-y-4 py-2">
            {approvals.map((app) => (
              <div key={app.id} className="relative">
                {/* dot indicator */}
                <div className="absolute -left-[21px] top-1 bg-green-500 rounded-full h-2.5 w-2.5 border-2 border-white"></div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{app.approver_name}</span>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1 py-0.5 rounded uppercase font-bold">{app.approver_role}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Sign-off level {app.approval_level} | Approved on {new Date(app.timestamp).toLocaleString()}
                  </div>
                  {app.notes && (
                    <div className="italic text-slate-500 bg-slate-50 p-2 rounded mt-1 text-[11px]">
                      "{app.notes}"
                    </div>
                  )}
                  {app.signature_hash && (
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-mono mt-1.5 bg-slate-50 p-1.5 rounded border border-slate-150">
                      <span className="material-symbols-outlined text-[12px] text-green-600">verified</span>
                      <span>Digital Signature Verified: {app.signature_hash.substring(0, 16)}... | Cert ID: {app.certificate_id || 'N/A'}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
