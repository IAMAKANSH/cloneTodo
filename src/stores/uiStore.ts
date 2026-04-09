import { create } from 'zustand';
import type { UIState, SmartListId } from '../types';

interface UIStore extends UIState {
  setActiveView: (view: SmartListId | string) => void;
  selectTask: (taskId: string | null) => void;
  toggleDetailPanel: () => void;
  closeDetailPanel: () => void;
  toggleSidebar: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  setSearchQuery: (query: string) => void;
  toggleMyDaySuggestions: () => void;
  setEditingListId: (listId: string | null) => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  activeView: 'myday',
  selectedTaskId: null,
  isDetailPanelOpen: false,
  isSidebarCollapsed: false,
  isSearchOpen: false,
  searchQuery: '',
  isMyDaySuggestionsOpen: false,
  editingListId: null,

  setActiveView: (view) =>
    set({
      activeView: view,
      selectedTaskId: null,
      isDetailPanelOpen: false,
      isSearchOpen: false,
    }),

  selectTask: (taskId) =>
    set({
      selectedTaskId: taskId,
      isDetailPanelOpen: taskId !== null,
    }),

  toggleDetailPanel: () =>
    set((s) => ({
      isDetailPanelOpen: !s.isDetailPanelOpen,
      selectedTaskId: s.isDetailPanelOpen ? null : s.selectedTaskId,
    })),

  closeDetailPanel: () =>
    set({ isDetailPanelOpen: false, selectedTaskId: null }),

  toggleSidebar: () =>
    set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),

  openSearch: () =>
    set({ isSearchOpen: true }),

  closeSearch: () =>
    set({ isSearchOpen: false, searchQuery: '' }),

  setSearchQuery: (query) =>
    set({ searchQuery: query }),

  toggleMyDaySuggestions: () =>
    set((s) => ({ isMyDaySuggestionsOpen: !s.isMyDaySuggestionsOpen })),

  setEditingListId: (listId) =>
    set({ editingListId: listId }),
}));
