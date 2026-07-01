import * as React from 'react';
import { cn } from '../../../../../components/ui/utils';

interface RFQLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function RFQLayout({ className, children, ...props }: RFQLayoutProps) {
  return (
    <div
      className={cn(
        'w-full flex flex-col space-y-6 text-left animate-in fade-in duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
