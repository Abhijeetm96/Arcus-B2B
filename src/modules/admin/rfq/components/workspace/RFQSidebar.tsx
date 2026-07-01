import { Folder, Inbox, UserCheck, Eye, RefreshCw, CheckCircle2, XCircle, Clock, CheckSquare, FileEdit } from 'lucide-react';
import { cn } from '../../../../../components/ui/utils';
import { RFQStatus } from '../../constants/status';

interface RFQSidebarProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  counts: Record<string, number>;
}

export function RFQSidebar({ selectedStatus, onStatusChange, counts }: RFQSidebarProps) {
  const items = [
    { id: 'all', label: 'All RFQs', icon: Folder },
    { id: RFQStatus.DRAFT, label: 'Draft', icon: FileEdit },
    { id: RFQStatus.SUBMITTED, label: 'Submitted', icon: Inbox },
    { id: RFQStatus.ASSIGNED, label: 'Assigned', icon: UserCheck },
    { id: RFQStatus.UNDER_REVIEW, label: 'Under Review', icon: Eye },
    { id: RFQStatus.NEGOTIATION, label: 'Negotiation', icon: RefreshCw },
    { id: RFQStatus.APPROVED, label: 'Approved', icon: CheckCircle2 },
    { id: RFQStatus.REJECTED, label: 'Rejected', icon: XCircle },
    { id: RFQStatus.EXPIRED, label: 'Expired', icon: Clock },
    { id: RFQStatus.CONVERTED, label: 'Converted', icon: CheckSquare }
  ];

  return (
    <div className="w-full h-full flex flex-col bg-surface-secondary/10 border-r border-border p-4 text-left select-none animate-in fade-in duration-300">
      <div className="mb-4 px-2">
        <h3 className="font-extrabold text-xs text-text-secondary uppercase tracking-wider">
          RFQ CATEGORIES
        </h3>
      </div>
      <nav className="space-y-1 flex-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = selectedStatus === item.id;
          const count = counts[item.id] || 0;

          return (
            <button
              key={item.id}
              onClick={() => onStatusChange(item.id)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded transition-all duration-150',
                isActive
                  ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-slate-100/50'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              <span
                className={cn(
                  'px-1.5 py-0.5 text-[10px] font-bold rounded-full border',
                  isActive
                    ? 'bg-primary-foreground/15 text-primary-foreground border-primary-foreground/20'
                    : 'bg-slate-100 text-text-secondary border-border'
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
