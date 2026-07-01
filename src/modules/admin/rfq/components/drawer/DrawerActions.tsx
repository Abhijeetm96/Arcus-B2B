import { ShieldCheck, FileEdit, UserCheck, Mail, Ban, Archive } from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '../../../../../components/ui/DropdownMenu';
import type { RFQDetail } from '../../types/rfqTypes';
import { RFQStatus } from '../../constants/status';

interface DrawerActionsProps {
  rfq: RFQDetail;
  onAction: (actionKey: string) => void;
}

export function DrawerActions({ rfq, onAction }: DrawerActionsProps) {
  const isApproved = rfq.status === RFQStatus.APPROVED;
  const isConverted = rfq.status === RFQStatus.CONVERTED;
  const isDraftOrSub = rfq.status === RFQStatus.DRAFT || rfq.status === RFQStatus.SUBMITTED;

  return (
    <div className="flex items-center gap-2 w-full p-4 border-t border-border bg-surface-secondary/20 shrink-0 text-left select-none">
      {/* 1. Primary Action */}
      {!isConverted && !isApproved && (
        <Button
          variant="primary"
          size="sm"
          onClick={() => onAction('CREATE_QUOTATION')}
          className="flex-1 h-9 text-xs font-extrabold flex items-center justify-center gap-1.5"
        >
          <FileEdit className="h-4 w-4" />
          Prepare Proposal
        </Button>
      )}

      {isApproved && (
        <Button
          variant="primary"
          size="sm"
          onClick={() => onAction('CONVERT_TO_ORDER')}
          className="flex-1 h-9 text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5"
        >
          <ShieldCheck className="h-4 w-4" />
          Convert to Order
        </Button>
      )}

      {isConverted && (
        <Button
          variant="outline"
          size="sm"
          disabled
          className="flex-1 h-9 text-xs font-bold text-success border-success/30 bg-success/5 flex items-center justify-center gap-1.5"
        >
          <ShieldCheck className="h-4 w-4" />
          Order Confirmed
        </Button>
      )}

      {/* 2. Secondary Dropdown Workflow Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 px-3 text-xs font-bold border-border">
            Workflow Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 bg-white border border-border">
          <DropdownMenuLabel className="text-xs font-bold text-text-primary">Transition State</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border/60" />
          
          <DropdownMenuItem onClick={() => onAction('ASSIGN')} className="text-xs font-semibold flex items-center gap-2 cursor-pointer">
            <UserCheck className="h-3.5 w-3.5 text-text-secondary" />
            Assign Sales Rep
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => onAction('EMAIL_CUSTOMER')} className="text-xs font-semibold flex items-center gap-2 cursor-pointer">
            <Mail className="h-3.5 w-3.5 text-text-secondary" />
            Email Customer
          </DropdownMenuItem>

          {isDraftOrSub && (
            <DropdownMenuItem onClick={() => onAction('MARK_REVIEWED')} className="text-xs font-semibold flex items-center gap-2 cursor-pointer">
              <ShieldCheck className="h-3.5 w-3.5 text-text-secondary" />
              Mark Under Review
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator className="bg-border/60" />
          <DropdownMenuLabel className="text-xs font-bold text-text-primary">Danger Zone</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border/60" />

          <DropdownMenuItem onClick={() => onAction('REJECT')} className="text-xs font-semibold text-danger focus:text-danger flex items-center gap-2 cursor-pointer">
            <Ban className="h-3.5 w-3.5 text-danger" />
            Reject RFQ
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => onAction('ARCHIVE')} className="text-xs font-semibold text-text-secondary flex items-center gap-2 cursor-pointer">
            <Archive className="h-3.5 w-3.5 text-text-secondary" />
            Archive Record
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
