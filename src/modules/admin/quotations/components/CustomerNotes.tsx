import React from 'react';

interface Props {
  notes: string;
  onChange?: (val: string) => void;
  isReadOnly?: boolean;
}

export const CustomerNotes: React.FC<Props> = ({ notes, onChange, isReadOnly = false }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <span className="material-symbols-outlined text-slate-500 text-lg">message</span>
        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Client-Facing Proposal Notes</h3>
      </div>

      <div className="text-xs">
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Message to Buyer</label>
        <textarea
          rows={3}
          disabled={isReadOnly}
          value={notes}
          onChange={e => onChange?.(e.target.value)}
          placeholder="Thank you for your business. Please see the detailed prices and tax breakdown..."
          className="w-full p-3 border border-slate-200 rounded text-slate-800 bg-slate-50/30 disabled:bg-slate-100/50 disabled:cursor-not-allowed resize-none font-semibold"
        />
      </div>
    </div>
  );
};
