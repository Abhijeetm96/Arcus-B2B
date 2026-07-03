import React from 'react';

interface Props {
  v1: any; // Old version object
  v2: any; // New version object
  onClose: () => void;
}

export const QuotationVersionCompare: React.FC<Props> = ({ v1, v2, onClose }) => {
  // Helpers to align items by product id or name
  const v1Items = v1.items || [];
  const v2Items = v2.items || [];

  // Group by name/id to find differences
  const allNames = Array.from(new Set([
    ...v1Items.map((it: any) => it.product_snapshot.name),
    ...v2Items.map((it: any) => it.product_snapshot.name)
  ]));

  const itemDiffs = allNames.map(name => {
    const item1 = v1Items.find((it: any) => it.product_snapshot.name === name);
    const item2 = v2Items.find((it: any) => it.product_snapshot.name === name);

    if (item1 && !item2) {
      return { name, status: 'REMOVED', rate1: item1.rate, qty1: item1.quantity, total1: item1.final_amount };
    } else if (!item1 && item2) {
      return { name, status: 'ADDED', rate2: item2.rate, qty2: item2.quantity, total2: item2.final_amount };
    } else {
      const isModified = item1.rate !== item2.rate || item1.quantity !== item2.quantity || item1.discount_percent !== item2.discount_percent;
      return {
        name,
        status: isModified ? 'MODIFIED' : 'UNCHANGED',
        rate1: item1.rate,
        qty1: item1.quantity,
        total1: item1.final_amount,
        rate2: item2.rate,
        qty2: item2.quantity,
        total2: item2.final_amount,
        diffRate: item2.rate - item1.rate,
        diffQty: item2.quantity - item1.quantity,
        diffTotal: item2.final_amount - item1.final_amount
      };
    }
  });

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-5 text-xs text-slate-700 select-none animate-in fade-in duration-200">
      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-indigo-600 text-lg">difference</span>
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
            Version Audit: V{v1.version} vs V{v2.version}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 flex items-center gap-0.5 bg-transparent border-0 font-bold uppercase text-[9px]"
        >
          <span className="material-symbols-outlined text-[14px]">close</span> Close Diff
        </button>
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded border border-slate-100">
        <div className="text-center space-y-1">
          <div className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">V{v1.version} Total Offer</div>
          <div className="font-mono text-slate-700 font-black text-sm">₹{Number(v1.grand_total || 0).toLocaleString('en-IN')}</div>
        </div>
        <div className="text-center space-y-1">
          <div className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Delta Deviation</div>
          <div className={`font-mono font-black text-sm ${Number(v2.grand_total) >= Number(v1.grand_total) ? 'text-green-600' : 'text-red-650'}`}>
            {Number(v2.grand_total) >= Number(v1.grand_total) ? '+' : ''}
            {Number(v2.grand_total - v1.grand_total).toLocaleString('en-IN')}
          </div>
        </div>
        <div className="text-center space-y-1">
          <div className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">V{v2.version} Total Offer</div>
          <div className="font-mono text-indigo-650 font-black text-sm">₹{Number(v2.grand_total || 0).toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* Items Diff Table */}
      <div className="space-y-2">
        <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[9px]">Line-item Changes Audit</h4>
        <div className="border border-slate-200/80 rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 font-bold uppercase text-[8px] border-b border-slate-200">
                <th className="p-3 w-[30%]">Material Name</th>
                <th className="p-3 w-[20%] text-center font-sans">V{v1.version} (Rate x Qty)</th>
                <th className="p-3 w-[20%] text-center font-sans">V{v2.version} (Rate x Qty)</th>
                <th className="p-3 w-[15%] text-right font-sans">Delta Deviation</th>
                <th className="p-3 w-[15%] text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {itemDiffs.map((diff, idx) => {
                const isAdded = diff.status === 'ADDED';
                const isRemoved = diff.status === 'REMOVED';
                const isMod = diff.status === 'MODIFIED';

                let rowBg = 'bg-white';
                let statusBadge = 'bg-slate-100 text-slate-600 border-slate-200';
                if (isAdded) {
                  rowBg = 'bg-green-50/10';
                  statusBadge = 'bg-green-100 text-green-700 border-green-200';
                } else if (isRemoved) {
                  rowBg = 'bg-red-50/10';
                  statusBadge = 'bg-red-100 text-red-700 border-red-250';
                } else if (isMod) {
                  rowBg = 'bg-amber-50/10';
                  statusBadge = 'bg-amber-100 text-amber-700 border-amber-250';
                }

                return (
                  <tr key={idx} className={`border-b border-slate-100 hover:bg-slate-50/30 transition-colors ${rowBg}`}>
                    <td className="p-3 font-semibold text-slate-800">{diff.name}</td>
                    
                    <td className="p-3 text-center font-mono">
                      {!isAdded ? `₹${diff.rate1} x ${diff.qty1}` : '-'}
                    </td>
                    
                    <td className="p-3 text-center font-mono">
                      {!isRemoved ? `₹${diff.rate2} x ${diff.qty2}` : '-'}
                    </td>
                    
                    <td className={`p-3 text-right font-mono font-bold ${diff.diffTotal !== undefined && diff.diffTotal >= 0 ? 'text-green-600' : diff.diffTotal !== undefined && diff.diffTotal < 0 ? 'text-red-650' : 'text-slate-500'}`}>
                      {isAdded && `+₹${diff.total2}`}
                      {isRemoved && `-₹${diff.total1}`}
                      {isMod && (diff.diffTotal !== undefined && diff.diffTotal !== 0 ? `${diff.diffTotal > 0 ? '+' : ''}₹${diff.diffTotal.toLocaleString('en-IN')}` : '0')}
                    </td>
                    
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase tracking-wider ${statusBadge}`}>
                        {diff.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
