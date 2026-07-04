import { useState } from 'react';
import { DashboardKPIs } from './DashboardKPIs';
import { DashboardCharts } from './DashboardCharts';
import { DashboardRecentActivity } from './DashboardRecentActivity';
import { DashboardQuickActions } from './DashboardQuickActions';
import { DashboardAttentionCenter } from './DashboardAttentionCenter';
import { DashboardWorkQueue } from './DashboardWorkQueue';
import { RFQKanban } from './RFQKanban';
import type { RFQSummary, RFQTimelineEvent } from '../../types/rfqTypes';
import { LayoutDashboard, Kanban } from 'lucide-react';
import { cn } from '../../../../../components/ui/utils';

interface RFQDashboardProps {
  rfqs: RFQSummary[];
  activities: (RFQTimelineEvent & { rfqNumber: string; companyName: string })[];
  onSelectRFQ: (id: string) => void;
  onActionClick: (action: string) => void;
}

export function RFQDashboard({
  rfqs,
  activities,
  onSelectRFQ,
  onActionClick
}: RFQDashboardProps) {
  const [dashboardView, setDashboardView] = useState<'overview' | 'kanban'>('overview');

  return (
    <div className="space-y-6 text-left">
      {/* View Switcher Toggle Bar */}
      <div className="flex justify-between items-center bg-white border border-slate-100 rounded-xl p-3 shadow-xs">
        <h2 className="font-extrabold text-sm text-slate-800 uppercase tracking-widest font-mono">
          {dashboardView === 'overview' ? 'Operational Hub' : 'Visual Pipeline'}
        </h2>
        <div className="flex bg-slate-50 border border-slate-200/60 p-0.5 rounded-lg">
          <button
            onClick={() => setDashboardView('overview')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer",
              dashboardView === 'overview'
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Overview
          </button>
          <button
            onClick={() => setDashboardView('kanban')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer",
              dashboardView === 'kanban'
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            <Kanban className="h-3.5 w-3.5 text-amber-500" />
            Pipeline Kanban
          </button>
        </div>
      </div>

      {dashboardView === 'kanban' ? (
        <div className="w-full bg-white border border-slate-100 rounded-xl p-5 shadow-sm min-h-[480px]">
          <RFQKanban rfqs={rfqs} onSelectRFQ={onSelectRFQ} />
        </div>
      ) : (
        <>
          {/* 1. KPIs Cards Section */}
          <DashboardKPIs rfqs={rfqs} />

          {/* 2. Attention Center */}
          <DashboardAttentionCenter />

          {/* 3. Main Dashboard Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Column: Work Queue & Charts */}
            <div className="lg:col-span-2 space-y-6">
              <DashboardWorkQueue 
                rfqs={rfqs} 
                onSelectRFQ={onSelectRFQ} 
              />
              
              <DashboardCharts rfqs={rfqs} />
            </div>

            {/* Right Column: Quick Actions & Recent Activity Feed */}
            <div className="lg:col-span-1 space-y-6">
              <DashboardQuickActions onActionClick={onActionClick} />
              
              <DashboardRecentActivity activities={activities} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
