import { UserCheck } from 'lucide-react';
import type { RFQDetail } from '../../types/rfqTypes';

interface DrawerFooterProps {
  rfq: RFQDetail;
}

export function DrawerFooter({ rfq }: DrawerFooterProps) {
  return (
    <div className="px-6 py-3 border-t border-border bg-slate-50 flex items-center justify-between text-[11px] text-text-secondary select-none shrink-0 font-semibold text-left">
      <div className="flex items-center gap-1.5">
        <UserCheck className="h-3.5 w-3.5 text-text-secondary" />
        <span>Owner: <strong className="text-text-primary font-bold">{rfq.owner || 'Unassigned'}</strong></span>
      </div>
      <span>
        Updated: {new Date(rfq.lastUpdated).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
}
