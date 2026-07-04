import type { RFQDetail } from '../../types/rfqTypes';
import { PRIORITY_COLORS } from '../../constants/priority';
import { cn } from '../../../../../components/ui/utils';
import { Check, ChevronRight, MoreHorizontal, FileEdit, ShieldCheck, UserCheck, Download, Printer } from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../../../../components/ui/DropdownMenu';

interface DrawerHeaderProps {
  rfq: RFQDetail;
  onAction: (actionKey: string) => void;
}

const STAGES = [
  { key: 'DRAFT', label: 'Draft' },
  { key: 'SUBMITTED', label: 'Submitted' },
  { key: 'UNDER_REVIEW', label: 'In Review' },
  { key: 'NEGOTIATION', label: 'Negotiation' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'CONVERTED', label: 'Ordered' }
];

const getStageIndex = (status: string) => {
  const norm = (status || '').toUpperCase();
  if (norm === 'DRAFT') return 0;
  if (norm === 'SUBMITTED' || norm === 'ASSIGNED') return 1;
  if (norm === 'UNDER_REVIEW') return 2;
  if (norm === 'NEGOTIATION') return 3;
  if (norm === 'APPROVED') return 4;
  if (norm === 'CONVERTED') return 5;
  return 1; // Default fallback
};

export function DrawerHeader({ rfq, onAction }: DrawerHeaderProps) {
  const currentStatus = (rfq.status || 'DRAFT').toUpperCase();
  const activeIndex = getStageIndex(currentStatus);

  const isApproved = currentStatus === 'APPROVED';
  const isConverted = currentStatus === 'CONVERTED';

  return (
    <div className="flex flex-col gap-3 pb-4 border-b border-border text-left select-none w-full">
      {/* 1. Zoho Chevron Status Flow Tracker */}
      <div className="w-full overflow-x-auto scrollbar-none pb-1">
        <div className="flex items-center gap-1 min-w-[500px]">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < activeIndex;
            const isActive = idx === activeIndex;
            return (
              <div key={stage.key} className="flex items-center gap-1">
                <div
                  className={cn(
                    "text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-all duration-200 border shrink-0",
                    isCompleted && "bg-emerald-50 text-emerald-600 border-emerald-100",
                    isActive && "bg-indigo-600 text-white border-indigo-600 shadow-sm",
                    (!isCompleted && !isActive) && "bg-slate-50 text-slate-400 border-slate-100"
                  )}
                >
                  {isCompleted && <Check className="h-3 w-3 shrink-0 stroke-[3px]" />}
                  <span>{stage.label}</span>
                </div>
                {idx < STAGES.length - 1 && (
                  <ChevronRight className="h-3 w-3 text-slate-300 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Main Title Row & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-base text-text-primary tracking-tight">
              RFQ Workspace: {rfq.rfqNumber}
            </h3>
            <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase', PRIORITY_COLORS[rfq.priority as keyof typeof PRIORITY_COLORS])}>
              {rfq.priority}
            </span>
          </div>
          <p className="text-xs text-text-secondary font-semibold">
            {rfq.companyName} • {rfq.projectType || 'Standard Brief'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {!isConverted && !isApproved && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onAction('CREATE_QUOTATION')}
              className="h-8.5 text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 rounded shadow-sm"
            >
              <FileEdit className="h-3.5 w-3.5" />
              Prepare Proposal
            </Button>
          )}

          {isApproved && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onAction('CONVERT_TO_ORDER')}
              className="h-8.5 text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 rounded shadow-sm"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Convert to Order
            </Button>
          )}

          {isConverted && (
            <Button
              variant="outline"
              size="sm"
              disabled
              className="h-8.5 text-xs font-bold text-emerald-600 border-emerald-200 bg-emerald-50/50 flex items-center justify-center gap-1.5 rounded"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Converted to Order
            </Button>
          )}

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8.5 w-8.5 hover:bg-slate-50 border-slate-200 rounded"
              >
                <MoreHorizontal className="h-4 w-4 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-100 shadow-lg rounded p-1 text-xs">
              <DropdownMenuItem 
                onClick={() => onAction('ASSIGN')}
                className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer text-slate-700 font-medium"
              >
                <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                Assign to Me
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  if (rfq.attachments && rfq.attachments.length > 0) {
                    const fname = rfq.attachments[0].filename;
                    const token = localStorage.getItem('arcus_token') || '';
                    window.open(`/api/attachments/download/${encodeURIComponent(fname)}?token=${encodeURIComponent(token)}`, '_blank');
                  }
                }}
                className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer text-slate-700 font-medium"
              >
                <Download className="h-3.5 w-3.5 text-slate-400" />
                Download Spec Sheets
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => window.print()}
                className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer text-slate-700 font-medium"
              >
                <Printer className="h-3.5 w-3.5 text-slate-400" />
                Print RFQ Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
