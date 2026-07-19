import { useEffect } from 'react';
import { useWorkspace } from './WorkspaceContext';

interface ShortcutOptions {
  onSearchFocus?: () => void;
}

export const useWorkspaceShortcuts = (options: ShortcutOptions = {}) => {
  const { toggleDensityMode, setActiveView, activeView } = useWorkspace();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Focus Search: Ctrl + / or Command + /
      if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault();
        options.onSearchFocus?.();
      }

      // View Selectors: Alt + L (List), Alt + S (Split), Alt + D (Detail)
      if (event.altKey && event.key.toLowerCase() === 'l') {
        event.preventDefault();
        setActiveView('LIST');
      }
      if (event.altKey && event.key.toLowerCase() === 's') {
        event.preventDefault();
        setActiveView('SPLIT');
      }
      if (event.altKey && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        setActiveView('DETAIL');
      }

      // Density Selection: Alt + C (Toggle Compact Mode)
      if (event.altKey && event.key.toLowerCase() === 'c') {
        event.preventDefault();
        toggleDensityMode();
      }

      // Close Details: Escape (Go back to List view)
      if (event.key === 'Escape' && activeView !== 'LIST') {
        event.preventDefault();
        setActiveView('LIST');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleDensityMode, setActiveView, activeView, options]);
};
