import { useState } from 'react';

interface GridPreferences {
  columnOrder: string[];
  columnVisibility: Record<string, boolean>;
  columnPinning: {
    left?: string[];
    right?: string[];
  };
  sorting: Array<{ id: string; desc: boolean }>;
  pageSize: number;
}

export const useGridPreferences = (gridId: string, defaultPageSize = 25) => {
  const [preferences, setPreferences] = useState<GridPreferences>(() => {
    try {
      const stored = localStorage.getItem(`arcus_grid_prefs_${gridId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse grid preferences:', e);
    }
    return {
      columnOrder: [],
      columnVisibility: {},
      columnPinning: {},
      sorting: [],
      pageSize: defaultPageSize,
    };
  });

  const savePreferences = (updated: Partial<GridPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updated };
      localStorage.setItem(`arcus_grid_prefs_${gridId}`, JSON.stringify(next));
      return next;
    });
  };

  return {
    preferences,
    savePreferences,
  };
};
