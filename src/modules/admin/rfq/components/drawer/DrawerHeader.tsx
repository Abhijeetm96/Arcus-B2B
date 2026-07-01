import type { RFQDetail } from '../../types/rfqTypes';
import { StatusBadge } from '../../../../../components/ui/StatusBadge';
import { PRIORITY_COLORS } from '../../constants/priority';
import { cn } from '../../../../../components/ui/utils';

interface DrawerHeaderProps {
  rfq: RFQDetail;
}

export function DrawerHeader({ rfq }: DrawerHeaderProps) {
  return (
    <div className="flex flex-col gap-1 pb-4 border-b border-border text-left select-none">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="font-extrabold text-base text-text-primary tracking-tight">
            RFQ Workspace: {rfq.rfqNumber}
          </h3>
          <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase', PRIORITY_COLORS[rfq.priority as keyof typeof PRIORITY_COLORS])}>
            {rfq.priority}
          </span>
        </div>
        <div className="mr-6">
          <StatusBadge status={rfq.status} />
        </div>
      </div>
      <p className="text-xs text-text-secondary font-semibold">
        {rfq.companyName} • {rfq.projectType || 'Standard Brief'}
      </p>
    </div>
  );
}
