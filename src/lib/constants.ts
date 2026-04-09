import type { SmartListId } from '../types';

export const SMART_LISTS: { id: SmartListId; name: string; icon: string }[] = [
  { id: 'myday', name: 'My Day', icon: 'Sun' },
  { id: 'important', name: 'Important', icon: 'Star' },
  { id: 'planned', name: 'Planned', icon: 'Calendar' },
  { id: 'assigned', name: 'Assigned to me', icon: 'UserCheck' },
  { id: 'tasks', name: 'Tasks', icon: 'Home' },
];

export const DEFAULT_LIST_ID = 'default-tasks';

export const THEME_COLORS = [
  '#2564cf', '#107c10', '#d13438', '#ff8c00',
  '#8764b8', '#038387', '#e81123', '#0078d4',
  '#c239b3', '#00b294', '#767676', '#4a9eff',
];

export const BACKGROUND_GRADIENTS: Record<string, string> = {
  'default': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'gradient-blue': 'linear-gradient(135deg, #2564cf 0%, #1b4fa0 100%)',
  'gradient-purple': 'linear-gradient(135deg, #8764b8 0%, #5c4d91 100%)',
  'gradient-pink': 'linear-gradient(135deg, #e81123 0%, #c239b3 100%)',
  'gradient-green': 'linear-gradient(135deg, #107c10 0%, #038387 100%)',
  'gradient-orange': 'linear-gradient(135deg, #ff8c00 0%, #d13438 100%)',
};
