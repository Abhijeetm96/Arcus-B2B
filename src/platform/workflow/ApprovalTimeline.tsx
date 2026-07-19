/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Calendar, User, MessageSquare, ArrowRight } from 'lucide-react';
import type { TransitionRecord } from './WorkflowStateMachine';

interface ApprovalTimelineProps {
  history: TransitionRecord<any>[];
}

const STATE_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700 border-slate-200',
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  APPROVED: 'bg-green-100 text-green-700 border-green-200',
  REJECTED: 'bg-red-100 text-red-700 border-red-200',
  CANCELLED: 'bg-slate-100 text-slate-500 border-slate-200',
  DRAFT_REJECTED: 'bg-red-50 text-red-600 border-red-100',
};

export const ApprovalTimeline: React.FC<ApprovalTimelineProps> = ({ history }) => {
  const getBadgeColor = (state: string) => {
    return STATE_COLORS[state.toUpperCase()] || 'bg-blue-100 text-blue-700 border-blue-200';
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-slate-400 italic">
        No workflow actions recorded yet.
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-slate-200 ml-3 pl-5 space-y-5">
      {history.map((record, i) => (
        <div key={i} className="relative group">
          {/* Timeline Node dot */}
          <div className="absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full bg-slate-300 border-2 border-white group-hover:bg-primary transition-colors" />

          {/* Card Wrapper */}
          <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs hover:shadow-xs transition-shadow">
            {/* Header info */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeColor(record.from)}`}>
                {record.from}
              </span>
              <ArrowRight size={10} className="text-slate-400" />
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeColor(record.to)}`}>
                {record.to}
              </span>
              <span className="text-[10px] text-slate-400 font-mono ml-auto">
                {record.event}
              </span>
            </div>

            {/* Content info */}
            <div className="space-y-1.5">
              {record.notes && (
                <p className="text-xs text-slate-600 flex items-start gap-1.5 bg-slate-50 p-2 rounded-md border border-slate-100">
                  <MessageSquare size={13} className="text-slate-400 shrink-0 mt-0.5" />
                  <span>{record.notes}</span>
                </p>
              )}

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <User size={12} />
                  By {record.performedBy}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(record.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
