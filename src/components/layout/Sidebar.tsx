import {
  Sun, Star, Calendar, UserCheck, Home, Plus, Menu, ListTodo,
  Search, Settings,
} from 'lucide-react';
import { useUIStore, useSettingsStore } from '../../stores';
import { listActions } from '../../stores/listStore';
import { useTaskCounts } from '../../hooks/useTasks';
import { useLists } from '../../hooks/useLists';
import { ListContextMenu } from '../lists/ListContextMenu';
import { AccountButton } from '../auth/AccountButton';
import { IntegrationSection } from './IntegrationSection';
import type { SmartListId } from '../../types';
import { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';

const SMART_LIST_ICONS: Record<SmartListId, React.ReactNode> = {
  myday: <Sun size={20} />,
  important: <Star size={20} />,
  planned: <Calendar size={20} />,
  assigned: <UserCheck size={20} />,
  tasks: <Home size={20} />,
};

const SMART_LIST_NAMES: Record<SmartListId, string> = {
  myday: 'My Day',
  important: 'Important',
  planned: 'Planned',
  assigned: 'Assigned to me',
  tasks: 'Tasks',
};

const SMART_LIST_ORDER: SmartListId[] = ['myday', 'important', 'planned', 'assigned', 'tasks'];

interface SidebarProps {
  onOpenSettings: () => void;
}

export function Sidebar({ onOpenSettings }: SidebarProps) {
  const {
    activeView, setActiveView, isSidebarCollapsed, toggleSidebar,
    openSearch, editingListId, setEditingListId,
  } = useUIStore();
  const smartListVisibility = useSettingsStore((s) => s.smartListVisibility);
  const counts = useTaskCounts();
  const lists = useLists();
  const [newListName, setNewListName] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [renamingName, setRenamingName] = useState('');
  const renameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingListId) {
      const list = lists?.find((l) => l.id === editingListId);
      if (list) {
        setRenamingName(list.name);
        setTimeout(() => renameRef.current?.focus(), 50);
      }
    }
  }, [editingListId]);

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    const id = await listActions.createList(newListName.trim());
    setNewListName('');
    setIsCreatingList(false);
    setActiveView(id);
  };

  const handleRename = async () => {
    if (editingListId && renamingName.trim()) {
      await listActions.updateList(editingListId, { name: renamingName.trim() });
    }
    setEditingListId(null);
  };

  return (
    <aside
      className={clsx(
        'h-full flex flex-col no-print shrink-0 transition-all duration-300 overflow-hidden sidebar-glass',
        isSidebarCollapsed ? 'w-0' : 'w-[var(--sidebar-width)]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-[var(--header-height)] px-3 shrink-0">
        <button
          onClick={toggleSidebar}
          className="p-2.5 rounded-[var(--radius-md)] hover:bg-[var(--color-sidebar-hover)] transition-all duration-200 active:scale-95"
          style={{ color: 'var(--color-text)' }}
          title="Toggle sidebar (Ctrl+B)"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-0.5">
          <button
            onClick={openSearch}
            className="p-2.5 rounded-[var(--radius-md)] hover:bg-[var(--color-sidebar-hover)] transition-all duration-200 active:scale-95"
            style={{ color: 'var(--color-text-secondary)' }}
            title="Search (Ctrl+F)"
          >
            <Search size={18} />
          </button>
          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-[var(--radius-md)] hover:bg-[var(--color-sidebar-hover)] transition-all duration-200 active:scale-95"
            style={{ color: 'var(--color-text-secondary)' }}
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        {/* Smart Lists */}
        <div className="flex flex-col gap-1">
          {SMART_LIST_ORDER.map((id) => {
            if (!smartListVisibility[id]) return null;
            const count = counts?.[id] || 0;
            const isActive = activeView === id;
            return (
              <button
                key={id}
                onClick={() => setActiveView(id)}
                className={clsx('sidebar-item', isActive && 'active')}
              >
                <span
                  className="shrink-0 transition-transform duration-200"
                  style={{
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  }}
                >
                  {SMART_LIST_ICONS[id]}
                </span>
                <span className="flex-1 text-[14px] truncate text-left">{SMART_LIST_NAMES[id]}</span>
                {count > 0 && (
                  <span className="count-badge">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="my-3 mx-3">
          <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--color-divider), transparent)' }} />
        </div>

        {/* Custom Lists */}
        <div className="flex flex-col gap-1">
          {lists?.filter((l) => !l.isDefault).map((list) => {
            const count = counts?.[list.id] || 0;
            const isActive = activeView === list.id;
            const isEditing = editingListId === list.id;

            return (
              <ListContextMenu key={list.id} list={list}>
                <div
                  onClick={() => !isEditing && setActiveView(list.id)}
                  className={clsx('sidebar-item', isActive && 'active')}
                >
                  <span className="shrink-0 transition-transform duration-200">
                    <ListTodo size={20} style={{ color: list.themeColor }} />
                  </span>

                  {isEditing ? (
                    <input
                      ref={renameRef}
                      value={renamingName}
                      onChange={(e) => setRenamingName(e.target.value)}
                      onBlur={handleRename}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename();
                        if (e.key === 'Escape') setEditingListId(null);
                      }}
                      className="flex-1 bg-transparent outline-none text-[14px] border-b-2"
                      style={{
                        color: 'var(--color-text)',
                        borderColor: 'var(--color-primary)',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="flex-1 text-[14px] truncate text-left">{list.name}</span>
                  )}

                  {count > 0 && !isEditing && (
                    <span className="count-badge">
                      {count}
                    </span>
                  )}
                </div>
              </ListContextMenu>
            );
          })}
        </div>

        {/* Create New List */}
        {isCreatingList ? (
          <div className="flex items-center gap-3 px-3 py-2 mt-1">
            <Plus size={20} style={{ color: 'var(--color-primary)' }} className="shrink-0" />
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateList();
                if (e.key === 'Escape') {
                  setIsCreatingList(false);
                  setNewListName('');
                }
              }}
              onBlur={() => {
                if (newListName.trim()) {
                  handleCreateList();
                } else {
                  setIsCreatingList(false);
                }
              }}
              autoFocus
              placeholder="Untitled list"
              className="flex-1 bg-transparent outline-none text-[14px] border-b-2 py-1"
              style={{
                color: 'var(--color-text)',
                borderColor: 'var(--color-primary)',
              }}
            />
          </div>
        ) : (
          <button
            onClick={() => setIsCreatingList(true)}
            className="sidebar-item mt-1"
            style={{ color: 'var(--color-primary)' }}
          >
            <span className="flex items-center justify-center w-5 h-5 rounded-full transition-all duration-200"
              style={{ background: 'var(--color-primary-light)' }}>
              <Plus size={14} className="shrink-0" />
            </span>
            <span className="text-[14px] font-medium">New list</span>
          </button>
        )}

        {/* Microsoft 365 Integration */}
        <IntegrationSection />
      </nav>

      {/* Account section at bottom */}
      <div className="px-3 pb-3 shrink-0" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
        <div className="pt-2">
          <AccountButton />
        </div>
      </div>
    </aside>
  );
}
