import { Activity, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../../components/ui/Card';
import type { RFQTimelineEvent } from '../../types/rfqTypes';

interface DashboardRecentActivityProps {
  activities: (RFQTimelineEvent & { rfqNumber: string; companyName: string })[];
}

export function DashboardRecentActivity({ activities }: DashboardRecentActivityProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Recent Activity Log
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 md:p-6 pt-0 max-h-[360px]">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-xs text-text-secondary">
            No recent activity recorded.
          </div>
        ) : (
          <div className="relative pl-4 border-l border-border space-y-4">
            {activities.map((act) => {
              const date = new Date(act.timestamp);
              return (
                <div key={act.id} className="relative group text-left">
                  {/* Timeline Dot */}
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-primary bg-surface group-hover:bg-primary transition-colors" />
                  
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                      <span className="font-bold text-xs text-text-primary">
                        {act.title}
                      </span>
                      <span className="flex items-center text-[10px] text-text-secondary font-medium">
                        <Clock className="h-3 w-3 mr-1" />
                        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {date.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary leading-relaxed">
                      {act.description}
                    </p>
                    <div className="text-[10px] text-text-secondary/80 flex justify-between font-semibold mt-1">
                      <span>{act.rfqNumber} • {act.companyName}</span>
                      <span className="text-[9px] bg-slate-100 text-slate-650 px-1.5 py-0.5 rounded uppercase">
                        {act.userRole}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
