import { useEffect, useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { SearchOverlay } from './components/search/SearchOverlay';
import { SettingsDialog } from './components/settings/SettingsDialog';
import { useTheme } from './hooks/useTheme';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useReminders } from './hooks/useReminders';
import { useIntegrationSync } from './hooks/useIntegrationSync';
import { useAgentSync } from './hooks/useAgentSync';
import { ChatPanel } from './components/chatbot/ChatPanel';
import { seedDatabase } from './db/seed';
import { taskActions } from './stores/taskStore';
import { getTodayString } from './lib/dates';

function App() {
  useTheme();
  useKeyboardShortcuts();
  useReminders();
  useIntegrationSync();
  useAgentSync();
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    seedDatabase();

    const lastActiveDate = localStorage.getItem('lastActiveDate');
    const today = getTodayString();
    if (lastActiveDate !== today) {
      taskActions.resetMyDay();
    }
  }, []);

  return (
    <>
      {/* Animated mesh gradient background */}
      <div className="app-bg" />

      {/* App content */}
      <div className="relative z-10 h-full">
        <AppLayout onOpenSettings={() => setSettingsOpen(true)} />
        <SearchOverlay />
        <SettingsDialog isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
        <ChatPanel />
      </div>
    </>
  );
}

export default App;
