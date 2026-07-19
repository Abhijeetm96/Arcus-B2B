/* eslint-disable @typescript-eslint/no-explicit-any, react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';

export type DensityMode = 'COMFORTABLE' | 'COMPACT';
export type ActiveView = 'LIST' | 'SPLIT' | 'DETAIL';

export interface SavedView {
  id: string;
  name: string;
  gridState: any;
}

interface WorkspaceContextType {
  densityMode: DensityMode;
  toggleDensityMode: () => void;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  columnWidths: Record<string, Record<string, number>>;
  setColumnWidth: (gridId: string, columnId: string, width: number) => void;
  savedViews: Record<string, SavedView[]>;
  saveView: (gridId: string, name: string, gridState: any) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [densityMode, setDensityMode] = useState<DensityMode>(() => {
    return (localStorage.getItem('arcus_density_mode') as DensityMode) || 'COMFORTABLE';
  });

  const [activeView, setActiveView] = useState<ActiveView>('LIST');

  const [columnWidths, setColumnWidths] = useState<Record<string, Record<string, number>>>(() => {
    try {
      const stored = localStorage.getItem('arcus_grid_column_widths');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [savedViews, setSavedViews] = useState<Record<string, SavedView[]>>(() => {
    try {
      const stored = localStorage.getItem('arcus_workspace_saved_views');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const toggleDensityMode = () => {
    setDensityMode((prev) => {
      const next = prev === 'COMFORTABLE' ? 'COMPACT' : 'COMFORTABLE';
      localStorage.setItem('arcus_density_mode', next);
      return next;
    });
  };

  const setColumnWidth = (gridId: string, columnId: string, width: number) => {
    setColumnWidths((prev) => {
      const updated = {
        ...prev,
        [gridId]: {
          ...(prev[gridId] || {}),
          [columnId]: width,
        },
      };
      localStorage.setItem('arcus_grid_column_widths', JSON.stringify(updated));
      return updated;
    });
  };

  const saveView = (gridId: string, name: string, gridState: any) => {
    setSavedViews((prev) => {
      const newView: SavedView = {
        id: `view_${Date.now()}`,
        name,
        gridState,
      };
      const updated = {
        ...prev,
        [gridId]: [...(prev[gridId] || []), newView],
      };
      localStorage.setItem('arcus_workspace_saved_views', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (densityMode === 'COMPACT') {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }
  }, [densityMode]);

  return (
    <WorkspaceContext.Provider
      value={{
        densityMode,
        toggleDensityMode,
        activeView,
        setActiveView,
        columnWidths,
        setColumnWidth,
        savedViews,
        saveView,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
