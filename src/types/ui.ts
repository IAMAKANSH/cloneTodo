import type { SmartListId } from './list';

export interface UIState {
  activeView: SmartListId | string;
  selectedTaskId: string | null;
  isDetailPanelOpen: boolean;
  isSidebarCollapsed: boolean;
  isSearchOpen: boolean;
  searchQuery: string;
  isMyDaySuggestionsOpen: boolean;
  editingListId: string | null;
}
