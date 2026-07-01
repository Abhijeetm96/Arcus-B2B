import { DashboardKPIs } from './DashboardKPIs';
import { DashboardRecentActivity } from './DashboardRecentActivity';
import { DashboardRecentRFQs } from './DashboardRecentRFQs';
import { DashboardQuickActions } from './DashboardQuickActions';
import type { RFQSummary, RFQTimelineEvent } from '../../types/rfqTypes';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../../components/ui/Card';
import { User } from 'lucide-react';
import { StatusBadge } from '../../../../../components/ui/StatusBadge';

interface RFQDashboardProps {
  rfqs: RFQSummary[];
  activities: (RFQTimelineEvent & { rfqNumber: string; companyName: string })[];
  onSelectRFQ: (id: string) => void;
  onViewAll: () => void;
  onActionClick: (action: string) => void;
}

export function RFQDashboard({
  rfqs,
  activities,
  onSelectRFQ,
  onViewAll,
  onActionClick
}: RFQDashboardProps) {
  // Filter RFQs assigned to the active user in the dashboard (e.g. Vikram Sharma)
  const assignedRFQs = rfqs.filter(r => r.owner === 'Vikram Sharma').slice(0, 4);

  return (
    <div className="space-y-6 text-left">
      {/* 1. KPIs Cards Section */}
      <DashboardKPIs rfqs={rfqs} />

      {/* 2. Main Dashboard Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent RFQs & Assigned List */}
        <div className="lg:col-span-2 space-y-6">
          <DashboardRecentRFQs
            rfqs={rfqs}
            onSelectRFQ={onSelectRFQ}
            onViewAll={onViewAll}
          />

          {/* Assigned to Me Section */}
          <Card className="text-left">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Assigned to Me (My RFQs)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {assignedRFQs.length === 0 ? (
                  <div className="col-span-2 text-center py-6 text-xs text-text-secondary">
                    No active RFQs assigned to you.
                  </div>
                ) : (
                  assignedRFQs.map(r => (
                    <div
                      key={r.id}
                      onClick={() => onSelectRFQ(r.id)}
                      className="p-4 border border-border rounded bg-surface hover:border-primary/50 hover:bg-slate-50/20 cursor-pointer flex flex-col justify-between transition-all duration-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-mono text-xs font-bold text-text-primary">
                          {r.rfqNumber}
                        </span>
                        <StatusBadge status={r.status} />
                      </div>
                      <h4 className="font-bold text-xs text-text-primary mb-1 truncate">
                        {r.companyName}
                      </h4>
                      <p className="text-[10px] text-text-secondary font-semibold mb-4">
                        Contact: {r.contactName}
                      </p>
                      <div className="flex justify-between items-center text-[10px] font-bold text-text-primary mt-auto border-t border-border/40 pt-2">
                        <span>Val: ₹{r.value.toLocaleString('en-IN')}</span>
                        <span className="text-text-secondary text-[9px] font-semibold">
                          Due: {new Date(r.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Quick Actions & Recent Activity Feed */}
        <div className="lg:col-span-1 space-y-6">
          <DashboardQuickActions onActionClick={onActionClick} />
          
          <DashboardRecentActivity activities={activities} />
        </div>
      </div>
    </div>
  );
}
