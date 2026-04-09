import { useEffect } from 'react';
import { useUIStore } from '../stores';

export function useKeyboardShortcuts() {
  const {
    openSearch,
    closeSearch,
    closeDetailPanel,
    isSearchOpen,
    isDetailPanelOpen,
    setActiveView,
    toggleSidebar,
  } = useUIStore();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't handle shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === 'f') {
        e.preventDefault();
        openSearch();
        return;
      }

      if (e.key === 'Escape') {
        if (isSearchOpen) {
          closeSearch();
        } else if (isDetailPanelOpen) {
          closeDetailPanel();
        }
        return;
      }

      if (ctrl && e.key === '1') { e.preventDefault(); setActiveView('myday'); }
      if (ctrl && e.key === '2') { e.preventDefault(); setActiveView('important'); }
      if (ctrl && e.key === '3') { e.preventDefault(); setActiveView('planned'); }
      if (ctrl && e.key === '4') { e.preventDefault(); setActiveView('assigned'); }
      if (ctrl && e.key === '5') { e.preventDefault(); setActiveView('tasks'); }

      if (ctrl && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, isDetailPanelOpen]);
}
