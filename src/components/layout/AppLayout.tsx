import { Sidebar } from './Sidebar';
import { TaskListPanel } from './TaskListPanel';
import { TaskDetailPanel } from './TaskDetailPanel';
import { useUIStore } from '../../stores';
import { Menu, Search, Settings } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

interface AppLayoutProps {
  onOpenSettings: () => void;
}

export function AppLayout({ onOpenSettings }: AppLayoutProps) {
  const { isDetailPanelOpen, isSidebarCollapsed, toggleSidebar, openSearch } = useUIStore();

  return (
    <div className="h-full flex flex-col">
      {/* Collapsed sidebar top bar */}
      {isSidebarCollapsed && (
        <div
          className="flex items-center justify-between h-[var(--header-height)] px-3 shrink-0 no-print glass-subtle"
          style={{
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <button
            onClick={toggleSidebar}
            className="p-2.5 rounded-[var(--radius-md)] hover:bg-[var(--color-task-hover)] transition-all duration-200 active:scale-95"
            style={{ color: 'var(--color-text)' }}
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={openSearch}
              className="p-2.5 rounded-[var(--radius-md)] hover:bg-[var(--color-task-hover)] transition-all duration-200 active:scale-95"
              style={{ color: 'var(--color-text-secondary)' }}
              title="Search (Ctrl+F)"
            >
              <Search size={18} />
            </button>
            <button
              onClick={onOpenSettings}
              className="p-2.5 rounded-[var(--radius-md)] hover:bg-[var(--color-task-hover)] transition-all duration-200 active:scale-95"
              style={{ color: 'var(--color-text-secondary)' }}
              title="Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Main 3-panel layout */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar onOpenSettings={onOpenSettings} />

        <div
          className="flex-1 flex overflow-hidden min-w-0"
        >
          <TaskListPanel />
          <AnimatePresence>
            {isDetailPanelOpen && <TaskDetailPanel />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
