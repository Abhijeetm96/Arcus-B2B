import * as React from 'react';
import { cn } from '../ui/utils';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded border border-border bg-surface text-text-primary shadow-sm overflow-hidden', className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6 border-b border-border bg-surface-secondary/20', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-bold leading-none tracking-tight text-text-primary', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-xs text-text-secondary', className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-6', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0 border-t border-border mt-6', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

// Metric Card / KPI Summary Card
interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string | number;
    isPositive: boolean;
  };
}

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ className, title, value, description, icon, trend, ...props }, ref) => {
    return (
      <Card ref={ref} className={cn('hover:border-primary/50 transition-all duration-200', className)} {...props}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{title}</p>
            {icon && <div className="text-text-secondary h-4 w-4">{icon}</div>}
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <div className="text-2xl font-bold tracking-tight text-text-primary">{value}</div>
            {trend && (
              <div
                className={cn(
                  'flex items-center text-xs font-semibold',
                  trend.isPositive ? 'text-success' : 'text-danger'
                )}
              >
                <span>{trend.isPositive ? '↑' : '↓'} {trend.value}</span>
              </div>
            )}
          </div>
          {description && <p className="text-xs text-text-secondary mt-2">{description}</p>}
        </CardContent>
      </Card>
    );
  }
);
MetricCard.displayName = 'MetricCard';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, MetricCard };
