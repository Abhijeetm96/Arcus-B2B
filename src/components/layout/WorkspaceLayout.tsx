import * as React from 'react';
import { cn } from '../ui/utils';

export interface WorkspaceLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Optional top toolbar/action bar for controls, search, and primary actions.
   */
  toolbar?: React.ReactNode;
  /**
   * Optional secondary left-hand navigation/list panel inside the workspace (e.g. RFQ list, CRM folders).
   */
  workspaceSidebar?: React.ReactNode;
  /**
   * Optional right-hand detail pane when splitPane layout is enabled.
   */
  workspaceDetails?: React.ReactNode;
  /**
   * Enable split-pane (list-detail) layout. If true, workspaceSidebar and workspaceDetails will be displayed side-by-side.
   */
  splitPane?: boolean;
  /**
   * Whether to make the toolbar/filters section sticky to the top of the workspace.
   */
  stickyHeader?: boolean;
  /**
   * Active view for responsive mobile layouts when split pane is enabled.
   * 'list' shows the sidebar list, 'detail' shows the details pane.
   */
  activeMobileView?: 'list' | 'detail';
}

const WorkspaceLayout = React.forwardRef<HTMLDivElement, WorkspaceLayoutProps>(
  (
    {
      className,
      toolbar,
      workspaceSidebar,
      workspaceDetails,
      splitPane = false,
      stickyHeader = false,
      activeMobileView = 'list',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col w-full bg-surface border border-border rounded shadow-sm overflow-hidden min-h-[500px]',
          className
        )}
        {...props}
      >
        {/* 1. Workspace Toolbar Header */}
        {toolbar && (
          <div
            className={cn(
              'flex flex-col gap-4 p-4 md:p-6 border-b border-border bg-surface-secondary/10 md:flex-row md:items-center md:justify-between flex-shrink-0',
              stickyHeader && 'sticky top-0 z-20 backdrop-blur bg-surface/90'
            )}
          >
            {toolbar}
          </div>
        )}

        {/* 2. Workspace Body (Split Pane or Standard Content) */}
        {splitPane ? (
          <div className="flex flex-1 flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border min-h-0 overflow-hidden">
            {/* Sidebar list view */}
            {workspaceSidebar && (
              <div
                className={cn(
                  'w-full md:w-80 flex-shrink-0 overflow-y-auto bg-surface-secondary/5',
                  activeMobileView === 'detail' ? 'hidden md:block' : 'block'
                )}
              >
                {workspaceSidebar}
              </div>
            )}

            {/* Details content view */}
            {workspaceDetails && (
              <div
                className={cn(
                  'flex-1 overflow-y-auto bg-surface',
                  activeMobileView === 'list' ? 'hidden md:block' : 'block'
                )}
              >
                {workspaceDetails}
              </div>
            )}
          </div>
        ) : (
          // Standard Single Pane Workspace
          <div className="flex-grow p-4 md:p-6 overflow-y-auto">
            {children}
          </div>
        )}
      </div>
    );
  }
);

WorkspaceLayout.displayName = 'WorkspaceLayout';

export { WorkspaceLayout };
