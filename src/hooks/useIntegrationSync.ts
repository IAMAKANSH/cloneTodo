import { useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { integrationActions } from '../stores/integrationStore';

const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useIntegrationSync() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial sync
    integrationActions.syncAll();

    // Periodic sync
    intervalRef.current = window.setInterval(() => {
      integrationActions.syncAll();
    }, SYNC_INTERVAL);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAuthenticated]);
}
