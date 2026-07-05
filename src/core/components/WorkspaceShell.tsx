import * as React from 'react';

export interface WorkspaceShellProps {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  toolbar: React.ReactNode;
  metrics?: React.ReactNode;
  grid: React.ReactNode;
  detailWorkspace?: React.ReactNode;
  statusBar: React.ReactNode;
  isSplitActive: boolean;
}

export function WorkspaceShell({
  sidebar,
  header,
  toolbar,
  metrics,
  grid,
  detailWorkspace,
  statusBar,
  isSplitActive
}: WorkspaceShellProps) {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Top Navbar Header */}
      <div className="h-12 border-b border-slate-200 bg-white flex items-center justify-between px-4 z-50 shrink-0 select-none">
        {header}
      </div>

      {/* Main Operating Container */}
      <div className="flex flex-1 overflow-hidden min-h-0 relative">
        {/* Left Navigation Sidebar */}
        <div className="h-full shrink-0 flex">
          {sidebar}
        </div>

        {/* Content Console */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
          {/* Optional Metrics Summary Deck */}
          {metrics && (
            <div className="shrink-0 bg-white border-b border-slate-200 py-1.5 px-4 z-30 select-none">
              {metrics}
            </div>
          )}

          {/* Sourcing Toolbar / Filters Bar */}
          <div className="shrink-0 bg-white border-b border-slate-200 py-1.5 px-4 z-20 select-none">
            {toolbar}
          </div>

          {/* Data Grid Split Layout Container */}
          <div className="flex-1 flex overflow-hidden min-h-0 relative">
            {/* Main Table Grid */}
            <div 
              className={`h-full overflow-y-auto transition-all duration-200 ease-in-out ${
                isSplitActive ? 'w-[40%] border-r border-slate-200 bg-white' : 'w-full'
              }`}
            >
              {grid}
            </div>

            {/* Reusable Split Pane Detail Workspace */}
            {isSplitActive && detailWorkspace && (
              <div 
                className="w-[60%] h-full overflow-y-auto bg-white flex flex-col animate-slide-in relative"
                style={{ contentVisibility: 'auto' }}
              >
                {detailWorkspace}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="h-7 border-t border-slate-200 bg-white px-4 flex items-center shrink-0 z-50 select-none">
        {statusBar}
      </div>
    </div>
  );
}
