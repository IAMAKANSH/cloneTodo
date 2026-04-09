import { Mail, Calendar, Users, ClipboardList } from 'lucide-react';
import { useAuthStore, useUIStore } from '../../stores';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { clsx } from 'clsx';

const INTEGRATION_VIEWS = [
  { id: 'outlook-mail', name: 'Outlook Mail', icon: <Mail size={20} />, color: '#0078d4', personalOk: true },
  { id: 'outlook-calendar', name: 'Calendar', icon: <Calendar size={20} />, color: '#0078d4', personalOk: true },
  { id: 'planner', name: 'Planner Tasks', icon: <ClipboardList size={20} />, color: '#6264a7', personalOk: false },
  { id: 'teams', name: 'Teams', icon: <Users size={20} />, color: '#6264a7', personalOk: false },
] as const;

export function IntegrationSection() {
  const { isAuthenticated, isPersonalAccount } = useAuthStore();
  const { activeView, setActiveView } = useUIStore();

  const emailCount = useLiveQuery(() => db.outlookEmails.count(), []);
  const eventCount = useLiveQuery(() => db.calendarEvents.count(), []);
  const plannerCount = useLiveQuery(() => db.plannerTasks.count(), []);
  const teamsCount = useLiveQuery(() => db.teamsMentions.count(), []);

  if (!isAuthenticated) return null;

  const counts: Record<string, number | undefined> = {
    'outlook-mail': emailCount,
    'outlook-calendar': eventCount,
    'planner': plannerCount,
    'teams': teamsCount,
  };

  const visibleViews = INTEGRATION_VIEWS.filter(
    (v) => v.personalOk || !isPersonalAccount
  );

  return (
    <>
      <div className="my-3 mx-3">
        <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--color-divider), transparent)' }} />
      </div>

      <div className="mb-1 px-4">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-tertiary)' }}>
          Microsoft 365
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {visibleViews.map((view) => {
          const isActive = activeView === view.id;
          const count = counts[view.id] || 0;
          return (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={clsx('sidebar-item', isActive && 'active')}
            >
              <span
                className="shrink-0 transition-transform duration-200"
                style={{ color: isActive ? view.color : 'var(--color-text-secondary)' }}
              >
                {view.icon}
              </span>
              <span className="flex-1 text-[14px] truncate text-left">{view.name}</span>
              {count > 0 && (
                <span className="count-badge">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
