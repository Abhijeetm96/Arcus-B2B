import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../../../../components/ui/utils';

interface EmptyStateContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: React.ReactNode;
}

export function EmptyStateContainer({
  className,
  title,
  description,
  icon: Icon,
  action,
  ...props
}: EmptyStateContainerProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 md:p-12 border-2 border-dashed border-slate-200/80 rounded-2xl bg-slate-50/30 min-h-[300px] animate-in fade-in duration-200 text-left',
        className
      )}
      {...props}
    >
      {/* Premium Illustrated Background Grid for Icon */}
      <div className="relative flex items-center justify-center w-20 h-20 mb-5 shrink-0">
        {/* Outer radial lines */}
        <div className="absolute inset-0 rounded-full border border-slate-100/50 bg-slate-50/40 animate-pulse duration-3000" />
        <div className="absolute inset-2.5 rounded-full border border-slate-200/40 bg-white shadow-xs" />
        
        {/* Icon wrapper */}
        <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white shadow-md">
          <Icon className="h-5 w-5 text-amber-500" />
        </div>
      </div>

      <h3 className="font-extrabold text-slate-800 text-sm mb-1 uppercase tracking-wider">{title}</h3>
      <p className="text-xs text-slate-400 font-semibold max-w-xs mb-6 text-center leading-relaxed">
        {description}
      </p>
      
      {action && (
        <div className="flex items-center justify-center animate-in slide-in-from-bottom-2 duration-150">
          {action}
        </div>
      )}
    </div>
  );
}
