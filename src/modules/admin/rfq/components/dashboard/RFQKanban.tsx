import { ArrowRight } from 'lucide-react';
import type { RFQSummary } from '../../types/rfqTypes';
import { RFQStatus } from '../../constants/status';
import { cn } from '../../../../../components/ui/utils';

interface RFQKanbanProps {
  rfqs: RFQSummary[];
  onSelectRFQ: (id: string) => void;
}

export function RFQKanban({ rfqs, onSelectRFQ }: RFQKanbanProps) {
  // Define columns in the pipeline
  const columns = [
    { id: RFQStatus.DRAFT, title: 'Draft', color: 'bg-slate-500', headerBg: 'bg-slate-100/60 border-slate-200/50' },
    { id: RFQStatus.SUBMITTED, title: 'Submitted', color: 'bg-blue-500', headerBg: 'bg-blue-50/40 border-blue-200/40' },
    { id: RFQStatus.UNDER_REVIEW, title: 'In Review', color: 'bg-purple-500', headerBg: 'bg-purple-50/40 border-purple-200/40' },
    { id: RFQStatus.NEGOTIATION, title: 'Negotiation', color: 'bg-amber-500', headerBg: 'bg-amber-50/40 border-amber-200/40' },
    { id: RFQStatus.APPROVED, title: 'Approved', color: 'bg-emerald-500', headerBg: 'bg-emerald-50/40 border-emerald-200/40' },
    { id: RFQStatus.CONVERTED, title: 'Converted', color: 'bg-cyan-500', headerBg: 'bg-cyan-50/40 border-cyan-200/40' },
    { id: RFQStatus.REJECTED, title: 'Rejected', color: 'bg-rose-500', headerBg: 'bg-rose-50/40 border-rose-200/40' }
  ];

  // Helper to map initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Progress score map
  const progressMap: Record<string, number> = {
    [RFQStatus.DRAFT]: 15,
    [RFQStatus.SUBMITTED]: 30,
    [RFQStatus.UNDER_REVIEW]: 50,
    [RFQStatus.NEGOTIATION]: 70,
    [RFQStatus.APPROVED]: 90,
    [RFQStatus.CONVERTED]: 100,
    [RFQStatus.REJECTED]: 100
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none w-full select-none text-left items-start">
      {columns.map((col) => {
        const colRfqs = rfqs.filter(r => r.status.toUpperCase() === col.id.toUpperCase());
        const totalVal = colRfqs.reduce((sum, r) => sum + r.value, 0);

        return (
          <div 
            key={col.id} 
            className="w-72 flex-shrink-0 flex flex-col max-h-[600px] bg-slate-50/50 border border-slate-100 rounded-xl p-3"
          >
            {/* Column Header */}
            <div className={cn("flex justify-between items-center px-2 py-1.5 border rounded-lg mb-3 shadow-xs bg-white", col.headerBg)}>
              <div className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", col.color)} />
                <span className="font-extrabold text-xs text-slate-800">{col.title}</span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100/80 px-1.5 py-0.5 rounded-full">
                  {colRfqs.length}
                </span>
              </div>
              <span className="text-[10px] font-black text-slate-500">
                ₹{(totalVal / 1000).toFixed(0)}k
              </span>
            </div>

            {/* Cards Container */}
            <div className="flex-1 overflow-y-auto scrollbar-none space-y-3 pr-0.5 min-h-[150px]">
              {colRfqs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-100 rounded-xl text-slate-350 text-[10px]">
                  <span>No RFQs in {col.title}</span>
                </div>
              ) : (
                colRfqs.map((r) => {
                  const progress = progressMap[r.status] || 10;
                  
                  return (
                    <div 
                      key={r.id}
                      onClick={() => onSelectRFQ(r.id)}
                      className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-150 cursor-pointer flex flex-col gap-2.5 group"
                    >
                      {/* Top detail */}
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-[10px] font-bold text-slate-500 tracking-wider">
                          {r.rfqNumber}
                        </span>
                        {r.priority === 'CRITICAL' || r.priority === 'HIGH' ? (
                          <span className="text-[8px] font-black uppercase text-rose-700 bg-rose-50 border border-rose-100/50 px-1.5 py-0.5 rounded">
                            Urgent
                          </span>
                        ) : null}
                      </div>

                      {/* Title & value */}
                      <div>
                        <h4 className="font-bold text-xs text-slate-800 leading-snug truncate group-hover:text-slate-900">
                          {r.companyName}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">Contact: {r.contactName}</p>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-50 h-1 rounded-full overflow-hidden border border-slate-100/50">
                        <div className={cn("h-full rounded-full", col.color)} style={{ width: `${progress}%` }} />
                      </div>

                      {/* Divider */}
                      <div className="border-t border-slate-100/50 my-0.5" />

                      {/* Footer Row: Value, Owner Initials, Action */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col text-left">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Expected Value</span>
                          <span className="font-black text-slate-800 text-xs mt-0.5">
                            ₹{r.value.toLocaleString('en-IN')}
                          </span>
                        </div>

                        {/* Owner Initials badge */}
                        <div className="flex items-center gap-1.5">
                          <div 
                            className="w-5.5 h-5.5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[9px] border border-slate-200"
                            title={`Owner: ${r.owner}`}
                          >
                            {getInitials(r.owner)}
                          </div>
                          <button
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-slate-50 hover:bg-slate-100 rounded text-slate-500"
                            title="Open detail worksheet"
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
