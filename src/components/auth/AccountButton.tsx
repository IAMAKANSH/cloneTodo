import { useState } from 'react';
import { LogIn, LogOut, RefreshCw, ChevronDown } from 'lucide-react';
import { useAuthStore, authActions } from '../../stores';
import { useIntegrationStore, integrationActions } from '../../stores';
import { motion, AnimatePresence } from 'framer-motion';

export function AccountButton() {
  const { isAuthenticated, user, isLoading, error } = useAuthStore();
  const { isSyncing, lastSyncTime } = useIntegrationStore();
  const [isOpen, setIsOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-1">
        <button
          onClick={() => authActions.login()}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] text-[13px] font-medium transition-all duration-200 hover:bg-[var(--color-sidebar-hover)] active:scale-95 w-full"
          style={{ color: 'var(--color-primary)' }}
        >
          <LogIn size={16} />
          <span>{isLoading ? 'Signing in...' : 'Sign in with Microsoft'}</span>
        </button>
        {error && (
          <p className="px-3 text-[11px] leading-4" style={{ color: 'var(--color-danger)' }}>
            {error}
          </p>
        )}
      </div>
    );
  }

  const initials = user?.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] text-[13px] transition-all duration-200 hover:bg-[var(--color-sidebar-hover)] w-full"
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary), #7c3aed)',
            color: 'white',
          }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-[12px] font-semibold truncate" style={{ color: 'var(--color-text)' }}>
            {user?.displayName}
          </p>
          <p className="text-[10px] truncate" style={{ color: 'var(--color-text-tertiary)' }}>
            {user?.mail}
          </p>
        </div>
        <ChevronDown
          size={14}
          className="shrink-0 transition-transform duration-200"
          style={{
            color: 'var(--color-text-tertiary)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
          }}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 right-0 mb-2 z-50 glass rounded-[var(--radius-lg)] overflow-hidden"
              style={{ boxShadow: 'var(--shadow-16)' }}
            >
              {/* Sync status */}
              <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    {isSyncing ? 'Syncing...' : lastSyncTime ? `Last sync: ${formatTime(lastSyncTime)}` : 'Not synced yet'}
                  </span>
                  <button
                    onClick={() => integrationActions.syncAll()}
                    disabled={isSyncing}
                    className="p-1.5 rounded-[var(--radius-md)] hover:bg-[var(--color-task-hover)] transition-all duration-200"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>

              {/* Sign out */}
              <button
                onClick={() => {
                  authActions.logout();
                  setIsOpen(false);
                }}
                className="flex items-center gap-2.5 w-full px-4 py-3 text-[13px] font-medium transition-all duration-200 hover:bg-[var(--color-task-hover)]"
                style={{ color: 'var(--color-danger)' }}
              >
                <LogOut size={15} />
                Sign out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}
