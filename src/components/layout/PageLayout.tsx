import * as React from 'react';
import { Menu } from 'lucide-react';
import { cn } from '../ui/utils';
import { Breadcrumb, type BreadcrumbItem } from '../navigation/Breadcrumb';
import { PageHeader } from '../navigation/PageHeader';
import { Sheet, SheetContent } from '../ui/Drawer';

export interface PageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebar?: React.ReactNode;
  breadcrumbItems?: BreadcrumbItem[];
  title: string;
  description?: string;
  actions?: React.ReactNode;
  kpis?: React.ReactNode;
  filters?: React.ReactNode;
  pagination?: React.ReactNode;
  footer?: React.ReactNode;
}

const PageLayout = React.forwardRef<HTMLDivElement, PageLayoutProps>(
  ({ className, sidebar, breadcrumbItems, title, description, actions, kpis, filters, pagination, footer, children, ...props }, ref) => {
    const [isMobileOpen, setIsMobileOpen] = React.useState(false);

    return (
      <div ref={ref} className="flex min-h-screen bg-background text-text-primary flex-col md:flex-row" {...props}>
        {/* Desktop Left Sidebar */}
        {sidebar && (
          <aside className="w-64 border-r border-border bg-surface flex-shrink-0 hidden md:block">
            {sidebar}
          </aside>
        )}

        {/* Mobile Header Bar */}
        {sidebar && (
          <div className="flex h-16 items-center border-b border-border bg-surface px-6 md:hidden flex-shrink-0">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="mr-3 rounded border border-border p-2 text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-extrabold text-sm tracking-wider text-text-primary">PORTAL MENU</span>
          </div>
        )}

        {/* Mobile Sidebar Drawer */}
        {sidebar && (
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetContent side="left" className="p-0 w-64 bg-slate-900 border-r-0" showClose={false}>
              <div className="h-full flex flex-col" onClick={() => setIsMobileOpen(false)}>
                {sidebar}
              </div>
            </SheetContent>
          </Sheet>
        )}

        {/* Central Workspace Content Pane */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className={cn('flex-grow p-6 space-y-6 md:p-8', className)}>
            {/* 1. Breadcrumbs */}
            {breadcrumbItems && breadcrumbItems.length > 0 && (
              <Breadcrumb items={breadcrumbItems} />
            )}

            {/* 2. Page Header */}
            <PageHeader title={title} description={description} actions={actions} />

            {/* 3. KPI Summaries Grid */}
            {kpis && (
              <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {kpis}
              </div>
            )}

            {/* 4. Filters Bar */}
            {filters && (
              <div className="w-full">
                {filters}
              </div>
            )}

            {/* 5. Central Workspace Slot */}
            <div className="w-full">
              {children}
            </div>

            {/* 6. Pagination */}
            {pagination && (
              <div className="w-full">
                {pagination}
              </div>
            )}
          </div>

          {/* Footer */}
          {footer && (
            <footer className="p-6 border-t border-border bg-surface-secondary/20 flex-shrink-0">
              {footer}
            </footer>
          )}
        </div>
      </div>
    );
  }
);
PageLayout.displayName = 'PageLayout';

export { PageLayout };
