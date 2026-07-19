import React from 'react';
import { useWorkspace } from './WorkspaceContext';
import { LayoutGrid, Columns, Maximize2, Loader2, AlertCircle } from 'lucide-react';

interface WorkspaceLayoutProps {
  title: string;
  listComponent: React.ReactNode;
  detailComponent?: React.ReactNode;
  toolbarComponent?: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  onClearError?: () => void;
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  title,
  listComponent,
  detailComponent,
  toolbarComponent,
  isLoading = false,
  error = null,
  isEmpty = false,
  emptyMessage = 'No records found.',
  onClearError,
}) => {
  const { densityMode, toggleDensityMode, activeView, setActiveView } = useWorkspace();

  const isCompact = densityMode === 'COMPACT';

  return (
    <div className={`flex flex-col h-full bg-slate-50 text-slate-900 ${isCompact ? 'text-sm' : 'text-base'}`}>
      {/* Sticky Header */}
      <header className={`sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm ${isCompact ? 'px-3 py-2' : 'px-6 py-4'}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-4">
            <h1 className={`font-bold tracking-tight text-slate-800 ${isCompact ? 'text-lg' : 'text-2xl'}`}>
              {title}
            </h1>
            {/* Density & View Controls */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveView('LIST')}
                className={`p-1.5 rounded-md transition-all ${
                  activeView === 'LIST' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="List View"
              >
                <LayoutGrid size={16} />
              </button>
              {detailComponent && (
                <button
                  onClick={() => setActiveView('SPLIT')}
                  className={`p-1.5 rounded-md transition-all ${
                    activeView === 'SPLIT' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Split View"
                >
                  <Columns size={16} />
                </button>
              )}
              {detailComponent && (
                <button
                  onClick={() => setActiveView('DETAIL')}
                  className={`p-1.5 rounded-md transition-all ${
                    activeView === 'DETAIL' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Detail View"
                >
                  <Maximize2 size={16} />
                </button>
              )}
            </div>

            <button
              onClick={toggleDensityMode}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-md transition-all font-medium"
            >
              {isCompact ? 'Comfortable' : 'Compact'}
            </button>
          </div>

          {toolbarComponent && (
            <div className="flex items-center gap-2 flex-wrap">
              {toolbarComponent}
            </div>
          )}
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-40">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-primary" size={32} />
              <span className="text-sm font-medium text-slate-500">Loading workspace...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-white flex items-center justify-center z-40 px-4">
            <div className="max-w-md w-full p-6 bg-red-50 border border-red-200 rounded-xl shadow-sm text-center">
              <div className="flex justify-center mb-3">
                <AlertCircle className="text-red-500" size={40} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Workspace</h3>
              <p className="text-sm text-slate-600 mb-4">{error}</p>
              {onClearError && (
                <button
                  onClick={onClearError}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all shadow-xs"
                >
                  Retry Connection
                </button>
              )}
            </div>
          </div>
        )}

        {!isLoading && !error && isEmpty && (
          <div className="absolute inset-0 bg-slate-50 flex items-center justify-center z-20 px-4">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
                <LayoutGrid className="text-slate-400" size={28} />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">No Data Available</h3>
              <p className="text-sm text-slate-500 mb-4">{emptyMessage}</p>
            </div>
          </div>
        )}

        {/* View Layout Router */}
        <div className="w-full h-full flex overflow-hidden">
          {/* List Column */}
          <div
            className={`h-full overflow-auto transition-all duration-300 ${
              activeView === 'LIST'
                ? 'w-full'
                : activeView === 'SPLIT'
                ? 'w-full md:w-1/2 border-r border-slate-200'
                : 'w-0 hidden md:flex md:w-0'
            }`}
          >
            {listComponent}
          </div>

          {/* Detail View Column */}
          {detailComponent && (
            <div
              className={`h-full overflow-auto transition-all duration-300 ${
                activeView === 'LIST'
                  ? 'w-0 hidden'
                  : activeView === 'SPLIT'
                  ? 'w-full md:w-1/2'
                  : 'w-full'
              }`}
            >
              {detailComponent}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
