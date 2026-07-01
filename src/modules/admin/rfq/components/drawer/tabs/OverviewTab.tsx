import { Building, MapPin, DollarSign, Calendar, ShieldAlert } from 'lucide-react';
import type { RFQDetail } from '../../../types/rfqTypes';
import { PRIORITY_COLORS } from '../../../constants/priority';
import { cn } from '../../../../../../components/ui/utils';

interface OverviewTabProps {
  rfq: RFQDetail;
}

export function OverviewTab({ rfq }: OverviewTabProps) {
  const dates = [
    { label: 'Date Received', date: rfq.timeline[rfq.timeline.length - 1]?.timestamp },
    { label: 'Last Activity', date: rfq.lastUpdated },
    { label: 'Expiration / Response Due', date: rfq.dueDate }
  ];

  return (
    <div className="space-y-6 text-left select-none animate-in fade-in duration-200">
      {/* Title & Description Card */}
      <div className="p-4 border border-border rounded bg-surface">
        <h4 className="font-extrabold text-sm text-text-primary mb-2">Project Brief Summary</h4>
        <p className="text-xs text-text-secondary leading-relaxed bg-slate-50 p-3 border border-border rounded">
          {rfq.description || 'No project description was provided for this RFQ.'}
        </p>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 border border-border rounded bg-surface flex flex-col justify-between">
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1">
            <Building className="h-3.5 w-3.5" />
            Project Context
          </span>
          <div className="space-y-1">
            <div className="text-[10px] text-text-secondary">Type:</div>
            <div className="font-bold text-xs text-text-primary">{rfq.projectType || 'N/A'}</div>
            <div className="text-[10px] text-text-secondary mt-1">Industry:</div>
            <div className="font-semibold text-xs text-text-secondary truncate">{rfq.customer.industry || 'N/A'}</div>
          </div>
        </div>

        <div className="p-3 border border-border rounded bg-surface flex flex-col justify-between">
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            Delivery Location
          </span>
          <div className="space-y-1">
            <div className="text-[10px] text-text-secondary">Site Address:</div>
            <div className="font-bold text-xs text-text-primary leading-normal">{rfq.customer.location}</div>
          </div>
        </div>

        <div className="p-3 border border-border rounded bg-surface flex flex-col justify-between">
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1">
            <DollarSign className="h-3.5 w-3.5" />
            Target Value
          </span>
          <div className="space-y-1">
            <div className="text-[10px] text-text-secondary">Estimated Budget:</div>
            <div className="font-extrabold text-base text-text-primary">
              ₹{rfq.value.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="p-3 border border-border rounded bg-surface flex flex-col justify-between">
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1">
            <ShieldAlert className="h-3.5 w-3.5" />
            Priority Class
          </span>
          <div className="space-y-1">
            <div className="text-[10px] text-text-secondary">SLA Priority:</div>
            <div>
              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded border', PRIORITY_COLORS[rfq.priority as keyof typeof PRIORITY_COLORS])}>
                {rfq.priority}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Timestamps */}
      <div className="p-4 border border-border rounded bg-surface">
        <h4 className="font-extrabold text-xs text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          SLA Timelines
        </h4>
        <div className="space-y-2">
          {dates.map((d, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs border-b border-border/40 pb-1.5 last:border-b-0 last:pb-0">
              <span className="text-text-secondary font-semibold">{d.label}</span>
              <span className="font-bold text-text-primary">
                {d.date ? new Date(d.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
