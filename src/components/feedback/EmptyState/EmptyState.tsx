import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from '../../ui/Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onActionClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'There are no items to display right now.',
  icon,
  actionLabel,
  onActionClick
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800 rounded bg-slate-950/20 max-w-md mx-auto my-4 space-y-3">
      <div className="p-3 bg-slate-900 rounded-full text-slate-400">
        {icon || <Inbox className="h-6 w-6" />}
      </div>
      <div className="space-y-1">
        <h4 className="text-white text-xs font-bold font-sans uppercase tracking-wider">{title}</h4>
        <p className="text-slate-400 text-[10px] leading-relaxed max-w-xs">{description}</p>
      </div>
      {actionLabel && onActionClick && (
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onActionClick}
          className="text-[10px] h-8 font-bold px-3 rounded"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
