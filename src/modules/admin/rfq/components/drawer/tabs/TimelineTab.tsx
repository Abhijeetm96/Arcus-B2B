import { Clock, Inbox, UserCheck, MessageSquare, FileText, History, CheckCircle2, XCircle, CheckSquare } from 'lucide-react';
import type { RFQDetail } from '../../../types/rfqTypes';

interface TimelineTabProps {
  rfq: RFQDetail;
}

export function TimelineTab({ rfq }: TimelineTabProps) {
  const events = rfq.timeline || [];

  const getEventIcon = (type: string) => {
    const normType = type.toUpperCase();
    if (normType.includes('SUBMITTED')) return Inbox;
    if (normType.includes('ASSIGNED')) return UserCheck;
    if (normType.includes('NOTE')) return MessageSquare;
    if (normType.includes('QUOTE')) return FileText;
    if (normType.includes('REVISION')) return History;
    if (normType.includes('APPROVED')) return CheckCircle2;
    if (normType.includes('REJECTED')) return XCircle;
    if (normType.includes('CONVERTED')) return CheckSquare;
    return Clock;
  };

  return (
    <div className="space-y-4 text-left select-none animate-in fade-in duration-200">
      {events.length === 0 ? (
        <div className="text-center py-8 text-xs text-text-secondary">
          No timeline records for this RFQ.
        </div>
      ) : (
        <div className="relative pl-6 border-l border-border space-y-6 ml-2">
          {events.map((evt) => {
            const IconComponent = getEventIcon(evt.eventType);
            const eventDate = new Date(evt.timestamp);

            return (
              <div key={evt.id} className="relative group">
                {/* Timeline Icon Node */}
                <span className="absolute -left-[37px] top-0 h-6 w-6 rounded-full border border-border bg-surface flex items-center justify-center text-text-secondary group-hover:border-primary group-hover:text-primary transition-colors">
                  <IconComponent className="h-3 w-3" />
                </span>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                    <h5 className="font-bold text-xs text-text-primary">
                      {evt.title}
                    </h5>
                    <span className="text-[10px] text-text-secondary font-medium">
                      {eventDate.toLocaleString('en-IN', {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    {evt.description}
                  </p>
                  <div className="text-[10px] text-text-secondary/70 flex items-center gap-1 font-semibold mt-1">
                    <span>by {evt.user}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-350" />
                    <span className="text-[9px] uppercase tracking-wide bg-slate-100 px-1 rounded">
                      {evt.userRole}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
