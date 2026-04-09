import { Mail, Calendar, ClipboardList, Users, RefreshCw } from 'lucide-react';
import { useIntegrationStore, integrationActions } from '../../stores';

const VIEW_CONFIG: Record<string, { name: string; icon: React.ReactNode; color: string; syncKey: string }> = {
  'outlook-mail': {
    name: 'Outlook Mail',
    icon: <Mail size={26} strokeWidth={1.5} />,
    color: '#0078d4',
    syncKey: 'mail',
  },
  'outlook-calendar': {
    name: 'Calendar',
    icon: <Calendar size={26} strokeWidth={1.5} />,
    color: '#0078d4',
    syncKey: 'calendar',
  },
  'planner': {
    name: 'Planner Tasks',
    icon: <ClipboardList size={26} strokeWidth={1.5} />,
    color: '#6264a7',
    syncKey: 'planner',
  },
  'teams': {
    name: 'Teams',
    icon: <Users size={26} strokeWidth={1.5} />,
    color: '#6264a7',
    syncKey: 'teams',
  },
};

interface Props {
  viewId: string;
}

export function IntegrationViewHeader({ viewId }: Props) {
  const config = VIEW_CONFIG[viewId];
  const { isSyncing } = useIntegrationStore();

  if (!config) return null;

  return (
    <div
      className="shrink-0 transition-all duration-300"
      style={{ padding: '24px 28px 16px' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span style={{ color: config.color }}>{config.icon}</span>
          <h1
            className="font-bold tracking-tight text-[22px] leading-[32px]"
            style={{ color: config.color }}
          >
            {config.name}
          </h1>
        </div>
        <button
          onClick={() => integrationActions.syncAll()}
          disabled={isSyncing}
          className="p-2 rounded-[var(--radius-md)] hover:bg-[var(--color-task-hover)] transition-all duration-200 active:scale-95"
          style={{ color: 'var(--color-text-secondary)' }}
          title="Sync now"
        >
          <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
        </button>
      </div>
    </div>
  );
}
