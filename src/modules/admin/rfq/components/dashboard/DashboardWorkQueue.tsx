import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../../components/ui/Card';
import { StatusBadge } from '../../../../../components/ui/StatusBadge';
import { Button } from '../../../../../components/ui/Button';
import { cn } from '../../../../../components/ui/utils';
import type { RFQSummary } from '../../types/rfqTypes';

interface DashboardWorkQueueProps {
  rfqs: RFQSummary[];
  onSelectRFQ: (id: string) => void;
}

type QueueTab = 'action' | 'customer' | 'vendor' | 'approval' | 'overdue';

export function DashboardWorkQueue({ rfqs, onSelectRFQ }: DashboardWorkQueueProps) {
  const [activeTab, setActiveTab] = useState<QueueTab>('action');

  // Filter items for each tab based on actual RFQs
  const requiresAction = rfqs.filter(r => r.status === 'SUBMITTED' || r.status === 'ASSIGNED');
  
  const waitingCustomer = rfqs.filter(r => r.status === 'NEGOTIATION' || r.status === 'APPROVED');
  
  const waitingVendor = rfqs.filter(r => r.status === 'UNDER_REVIEW');
  
  const needApproval = rfqs.filter(r => r.status === 'UNDER_REVIEW');
  
  const now = new Date();
  const overdueItems = rfqs.filter(r => 
    new Date(r.dueDate) < now && 
    r.status !== 'APPROVED' && 
    r.status !== 'CONVERTED'
  );

  const tabs = [
    { id: 'action' as QueueTab, label: 'Requires Action', count: requiresAction.length },
    { id: 'customer' as QueueTab, label: 'Waiting for Customer', count: waitingCustomer.length },
    { id: 'vendor' as QueueTab, label: 'Waiting for Vendor', count: waitingVendor.length },
    { id: 'approval' as QueueTab, label: 'Need Approval', count: needApproval.length },
    { id: 'overdue' as QueueTab, label: 'Overdue Pipeline', count: overdueItems.length }
  ];

  const getActiveList = () => {
    switch (activeTab) {
      case 'action': return requiresAction;
      case 'customer': return waitingCustomer;
      case 'vendor': return waitingVendor;
      case 'approval': return needApproval;
      case 'overdue': return overdueItems;
    }
  };

  const list = getActiveList().slice(0, 5); // display up to 5 items to keep it clean

  return (
    <Card className="border border-slate-100 bg-white shadow-sm rounded-xl text-left h-full flex flex-col justify-between">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold text-slate-800 flex items-center justify-between">
          <span>Priority Work Queue</span>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">My Actions</span>
        </CardTitle>
        {/* Tab Strip */}
        <div className="flex border-b border-slate-100 mt-2 overflow-x-auto scrollbar-none gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "pb-2 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer",
                activeTab === tab.id
                  ? "border-slate-900 text-slate-900 font-black"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              )}
            >
              {tab.label} <span className="ml-0.5 text-[10px] opacity-80">({tab.count})</span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0 flex-grow max-h-[380px] overflow-y-auto scrollbar-none">
        <div className="divide-y divide-slate-100 mt-2">
          {list.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 italic">
              No items in this queue tab.
            </div>
          ) : (
            list.map((r) => {
              const daysOpen = Math.max(1, Math.floor((new Date().getTime() - new Date(r.dueDate).getTime()) / (1000 * 60 * 60 * 24)));
              return (
                <div 
                  key={r.id}
                  className="py-3 flex justify-between items-center hover:bg-slate-50/50 px-2 rounded-lg transition-colors group"
                >
                  <div className="space-y-0.5 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-800">{r.rfqNumber}</span>
                      <StatusBadge status={r.status} />
                      {r.priority === 'HIGH' || r.priority === 'CRITICAL' ? (
                        <span className="text-[8px] font-black uppercase text-rose-600 bg-rose-50 border border-rose-100 px-1 rounded">
                          Urgent
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[11px] text-slate-700 font-bold truncate max-w-[180px]">{r.companyName}</p>
                    <div className="text-[9px] text-slate-400 font-semibold">
                      Owner: {r.owner} • Contact: {r.contactName}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div className="space-y-0.5">
                      <p className="text-xs font-extrabold text-slate-800">₹{r.value.toLocaleString('en-IN')}</p>
                      <p className="text-[9px] text-slate-400 font-bold">
                        {activeTab === 'overdue' ? `${daysOpen}d overdue` : `Due: ${new Date(r.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}`}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectRFQ(r.id)}
                      className="h-7 text-[10px] font-bold py-0.5 px-2.5 opacity-0 group-hover:opacity-100 transition-opacity border-slate-200 hover:border-slate-800"
                    >
                      Process
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
