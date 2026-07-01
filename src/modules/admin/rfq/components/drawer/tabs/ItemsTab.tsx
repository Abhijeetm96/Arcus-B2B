import { Layers } from 'lucide-react';
import type { RFQDetail } from '../../../types/rfqTypes';
import { EmptyStateContainer } from '../../shared/EmptyStateContainer';

interface ItemsTabProps {
  rfq: RFQDetail;
}

export function ItemsTab({ rfq }: ItemsTabProps) {
  const items = rfq.items || [];

  return (
    <div className="space-y-4 text-left select-none animate-in fade-in duration-200">
      {items.length === 0 ? (
        <EmptyStateContainer
          title="No Items Found"
          description="This RFQ does not contain any requested materials or items list."
          icon={Layers}
        />
      ) : (
        <div className="border border-border rounded overflow-hidden bg-surface">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-border text-text-secondary font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Item / Material</th>
                <th className="py-2.5 px-3">Specification</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">Target Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {items.map((it) => (
                <tr key={it.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-text-primary">{it.itemName}</div>
                  </td>
                  <td className="py-3 px-3 text-text-secondary font-medium">
                    {it.description || 'N/A'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-text-primary">
                    {it.quantity} <span className="text-[10px] text-text-secondary font-semibold">{it.unit}</span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-text-primary">
                    {it.targetPrice ? `₹${it.targetPrice.toLocaleString('en-IN')}` : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
