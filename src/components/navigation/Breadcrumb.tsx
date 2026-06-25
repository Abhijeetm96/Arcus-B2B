import * as React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../ui/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLDivElement> {
  items: BreadcrumbItem[];
}

const Breadcrumb = React.forwardRef<HTMLDivElement, BreadcrumbProps>(
  ({ className, items, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn('flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary', className)}
        {...props}
      >
        <a
          href="#/"
          className="flex items-center hover:text-text-primary transition-colors duration-200"
        >
          <Home className="h-3.5 w-3.5" />
        </a>
        
        {items.map((item, idx) => (
          <React.Fragment key={idx}>
            <ChevronRight className="h-3.5 w-3.5 text-muted flex-shrink-0" />
            {item.href ? (
              <a
                href={item.href}
                className="hover:text-text-primary transition-colors duration-200 truncate max-w-[120px] md:max-w-none"
              >
                {item.label}
              </a>
            ) : (
              <span className="text-text-primary truncate max-w-[120px] md:max-w-none font-bold" aria-current="page">
                {item.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>
    );
  }
);
Breadcrumb.displayName = 'Breadcrumb';

export { Breadcrumb };
