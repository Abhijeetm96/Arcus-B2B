import React from 'react';

interface Props {
  status: string;
  isSaving?: boolean;
  onSave?: () => void;
  onSubmitApproval?: () => void;
  onApprove?: () => void;
  onDecline?: () => void;
  onShare?: () => void;
  onDownloadPDF?: () => void;
  onConvertToOrder?: () => void;
  onCancel?: () => void;
  canApprove?: boolean;
}

export const ActionToolbar: React.FC<Props> = ({
  status,
  isSaving = false,
  onSave,
  onSubmitApproval,
  onApprove,
  onDecline,
  onShare,
  onDownloadPDF,
  onConvertToOrder,
  onCancel,
  canApprove = false
}) => {
  return (
    <div className="bg-slate-900 text-white rounded-lg p-4 shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase font-bold text-slate-400">Current Status:</span>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${status === 'APPROVED' ? 'bg-green-600 text-white' : status === 'PENDING_APPROVAL' ? 'bg-amber-500 text-white' : status === 'SENT' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
          {status}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold uppercase text-[10px] border-0 transition-colors"
          >
            Back
          </button>
        )}

        {status === 'DRAFT' && onSave && (
          <button
            type="button"
            disabled={isSaving}
            onClick={onSave}
            className="px-4 py-2 bg-indigo-650 hover:bg-indigo-750 text-white rounded font-bold uppercase text-[10px] border-0 transition-colors shadow-sm"
          >
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
        )}

        {status === 'DRAFT' && onSubmitApproval && (
          <button
            type="button"
            onClick={onSubmitApproval}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold uppercase text-[10px] border-0 transition-colors shadow-sm"
          >
            Request Manager Sign-Off
          </button>
        )}

        {status === 'PENDING_APPROVAL' && canApprove && onApprove && (
          <button
            type="button"
            onClick={onApprove}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold uppercase text-[10px] border-0 transition-colors shadow-sm flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[13px]">check_circle</span> Approve &amp; Sign
          </button>
        )}

        {status === 'PENDING_APPROVAL' && canApprove && onDecline && (
          <button
            type="button"
            onClick={onDecline}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold uppercase text-[10px] border-0 transition-colors shadow-sm flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[13px]">cancel</span> Reject
          </button>
        )}

        {(status === 'APPROVED' || status === 'SENT') && onShare && (
          <button
            type="button"
            onClick={onShare}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold uppercase text-[10px] border-0 transition-colors shadow-sm flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[13px]">share</span> Share Quote
          </button>
        )}

        {onDownloadPDF && (
          <button
            type="button"
            onClick={onDownloadPDF}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-bold uppercase text-[10px] border-0 transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[13px]">picture_as_pdf</span> PDF/Print
          </button>
        )}

        {(status === 'APPROVED' || status === 'SENT') && onConvertToOrder && (
          <button
            type="button"
            onClick={onConvertToOrder}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold uppercase text-[10px] border-0 transition-colors shadow-sm flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[13px]">shopping_cart</span> Convert to Order
          </button>
        )}
      </div>
    </div>
  );
};
