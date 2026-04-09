import { Sun, Star, Calendar, UserCheck, Home, MoreHorizontal } from 'lucide-react';
import { useUIStore } from '../../stores';
import { useList } from '../../hooks/useLists';
import { useSettingsStore } from '../../stores/settingsStore';
import type { SmartListId } from '../../types';
import { format } from 'date-fns';

const SMART_LIST_CONFIG: Record<SmartListId, { name: string; icon: React.ReactNode; themeClass?: string }> = {
  myday: { name: 'My Day', icon: <Sun size={28} strokeWidth={1.5} />, themeClass: 'myday-bg' },
  important: { name: 'Important', icon: <Star size={28} strokeWidth={1.5} /> },
  planned: { name: 'Planned', icon: <Calendar size={28} strokeWidth={1.5} /> },
  assigned: { name: 'Assigned to me', icon: <UserCheck size={28} strokeWidth={1.5} /> },
  tasks: { name: 'Tasks', icon: <Home size={28} strokeWidth={1.5} /> },
};

const SMART_LIST_IDS = ['myday', 'important', 'planned', 'assigned', 'tasks'];

export function ListHeader() {
  const activeView = useUIStore((s) => s.activeView);
  const backgroundTheme = useSettingsStore((s) => s.backgroundTheme);
  const isSmartList = SMART_LIST_IDS.includes(activeView);

  const customList = useList(isSmartList ? '' : activeView);
  const config = isSmartList ? SMART_LIST_CONFIG[activeView as SmartListId] : null;
  const name = config?.name || customList?.name || 'Tasks';

  const isMyDay = activeView === 'myday';
  const bgClass = isMyDay ? `myday-bg-${backgroundTheme}` : '';

  return (
    <div
      className={`shrink-0 ${bgClass} transition-all duration-300`}
      style={{
        padding: isMyDay ? '32px 28px 24px' : '24px 28px 16px',
        color: isMyDay ? '#ffffff' : 'var(--color-text)',
        borderRadius: isMyDay ? '0 0 var(--radius-xl) var(--radius-xl)' : '0',
        ...(customList?.themeColor && !isSmartList
          ? { borderBottom: `3px solid ${customList.themeColor}` }
          : {}),
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isMyDay && (
            <span className="opacity-90 drop-shadow-lg">{config?.icon}</span>
          )}
          <div>
            <h1
              className="font-bold tracking-tight"
              style={{
                fontSize: isMyDay ? '26px' : '22px',
                lineHeight: '32px',
                color: isMyDay ? '#ffffff' : customList?.themeColor || 'var(--color-primary)',
                textShadow: isMyDay ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
              }}
            >
              {name}
            </h1>
            {isMyDay && (
              <p className="text-[14px] mt-1.5 opacity-85 font-light tracking-wide"
                style={{ textShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                {format(new Date(), 'EEEE, MMMM d')}
              </p>
            )}
          </div>
        </div>

        {!isMyDay && (
          <button
            className="p-2 rounded-[var(--radius-md)] hover:bg-[var(--color-task-hover)] transition-all duration-200 active:scale-95"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <MoreHorizontal size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
