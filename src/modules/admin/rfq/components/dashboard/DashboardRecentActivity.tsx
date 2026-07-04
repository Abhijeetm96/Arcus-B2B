import { Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../../components/ui/Card';
import type { RFQTimelineEvent } from '../../types/rfqTypes';

interface DashboardRecentActivityProps {
  activities: (RFQTimelineEvent & { rfqNumber: string; companyName: string })[];
}

export function DashboardRecentActivity({ activities }: DashboardRecentActivityProps) {
  // Limit to top 5 activities to align perfectly in height with the left column
  const list = activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <Card className="border border-slate-100 bg-white shadow-sm rounded-xl text-left flex flex-col justify-between">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Activity className="h-4 w-4 text-indigo-500" />
          Recent Activity Log
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0 flex-grow max-h-[380px] overflow-y-auto scrollbar-none">
        {list.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 italic">
            No recent activity recorded.
          </div>
        ) : (
          <div className="relative pl-3 border-l-2 border-slate-100 space-y-3.5 mt-2">
            {list.map((act) => {
              const date = new Date(act.timestamp);
              return (
                <div key={act.id} className="relative text-left group">
                  {/* Small timeline dot */}
                  <span className="absolute -left-[17px] top-1.5 h-2 w-2 rounded-full border-2 border-indigo-500 bg-white group-hover:bg-indigo-500 transition-colors duration-150" />
                  
                  <div className="space-y-0.5">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-extrabold text-xs text-slate-800">
                        {act.title}
                      </span>
                      <span className="text-[9px] text-slate-400 font-semibold shrink-0">
                        {date.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                      {act.description}
                    </p>
                    <div className="text-[9px] text-slate-400 font-bold flex justify-between pt-0.5">
                      <span>{act.rfqNumber} • {act.companyName}</span>
                      <span className="uppercase text-[8px] bg-slate-50 text-slate-500 px-1 py-0.5 rounded border border-slate-100/50">
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
