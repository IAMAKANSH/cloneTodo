import type { SmartListId } from './list';

export type ThemeMode = 'light' | 'dark' | 'system';
export type BackgroundTheme = 'default' | 'gradient-blue' | 'gradient-purple' | 'gradient-pink' | 'gradient-green' | 'gradient-orange';

export interface AppSettings {
  themeMode: ThemeMode;
  backgroundTheme: BackgroundTheme;
  confirmBeforeDelete: boolean;
  playCompletionSound: boolean;
  smartListVisibility: Record<SmartListId, boolean>;
  newTaskPosition: 'top' | 'bottom';
  moveCompletedToBottom: boolean;
}
