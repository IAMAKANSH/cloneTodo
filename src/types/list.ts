export type SortOption = 'manual' | 'alphabetical' | 'dueDate' | 'createdAt' | 'importance' | 'completedAt';
export type SortDirection = 'asc' | 'desc';

export interface TaskList {
  id: string;
  groupId: string | null;
  name: string;
  themeColor: string;
  isDefault: boolean;
  showCompleted: boolean;
  sortBy: SortOption;
  sortDirection: SortDirection;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListGroup {
  id: string;
  name: string;
  isExpanded: boolean;
  sortOrder: number;
  createdAt: string;
}

export type SmartListId = 'myday' | 'important' | 'planned' | 'assigned' | 'tasks';
