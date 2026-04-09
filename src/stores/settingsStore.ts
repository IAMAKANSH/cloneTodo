import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings, ThemeMode, BackgroundTheme } from '../types';

interface SettingsStore extends AppSettings {
  setThemeMode: (mode: ThemeMode) => void;
  setBackgroundTheme: (theme: BackgroundTheme) => void;
  toggleCompletionSound: () => void;
  toggleConfirmBeforeDelete: () => void;
  toggleSmartList: (listId: string) => void;
  setNewTaskPosition: (position: 'top' | 'bottom') => void;
  toggleMoveCompletedToBottom: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      themeMode: 'system',
      backgroundTheme: 'default',
      confirmBeforeDelete: true,
      playCompletionSound: true,
      smartListVisibility: {
        myday: true,
        important: true,
        planned: true,
        assigned: true,
        tasks: true,
      },
      newTaskPosition: 'bottom',
      moveCompletedToBottom: true,

      setThemeMode: (mode) => set({ themeMode: mode }),
      setBackgroundTheme: (theme) => set({ backgroundTheme: theme }),
      toggleCompletionSound: () => set((s) => ({ playCompletionSound: !s.playCompletionSound })),
      toggleConfirmBeforeDelete: () => set((s) => ({ confirmBeforeDelete: !s.confirmBeforeDelete })),
      toggleSmartList: (listId) =>
        set((s) => ({
          smartListVisibility: {
            ...s.smartListVisibility,
            [listId]: !s.smartListVisibility[listId as keyof typeof s.smartListVisibility],
          },
        })),
      setNewTaskPosition: (position) => set({ newTaskPosition: position }),
      toggleMoveCompletedToBottom: () => set((s) => ({ moveCompletedToBottom: !s.moveCompletedToBottom })),
    }),
    { name: 'todo-settings' }
  )
);
