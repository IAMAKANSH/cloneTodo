import { create } from 'zustand';
import { db } from '../db/database';
import { useAuthStore } from './authStore';
import { getFlaggedEmails } from '../services/outlookMailService';
import { getUpcomingEvents } from '../services/outlookCalendarService';
import { getPlannerTasks, getRecentChats } from '../services/teamsService';

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'unsupported';

interface IntegrationState {
  syncStatus: {
    mail: SyncStatus;
    calendar: SyncStatus;
    teams: SyncStatus;
    planner: SyncStatus;
  };
  lastSyncTime: string | null;
  isSyncing: boolean;
}

export const useIntegrationStore = create<IntegrationState>(() => ({
  syncStatus: {
    mail: 'idle',
    calendar: 'idle',
    teams: 'idle',
    planner: 'idle',
  },
  lastSyncTime: null,
  isSyncing: false,
}));

const set = useIntegrationStore.setState;

function setSyncStatus(key: keyof IntegrationState['syncStatus'], status: SyncStatus) {
  set((s) => ({
    syncStatus: { ...s.syncStatus, [key]: status },
  }));
}

export const integrationActions = {
  async syncAll() {
    const isPersonal = useAuthStore.getState().isPersonalAccount;

    set({ isSyncing: true });

    const tasks: Promise<void>[] = [
      integrationActions.syncMail(),
      integrationActions.syncCalendar(),
    ];

    // Planner and Teams are only available for work/school accounts
    if (!isPersonal) {
      tasks.push(integrationActions.syncTeams());
      tasks.push(integrationActions.syncPlanner());
    } else {
      setSyncStatus('teams', 'unsupported');
      setSyncStatus('planner', 'unsupported');
    }

    await Promise.allSettled(tasks);
    const now = new Date().toISOString();
    set({ isSyncing: false, lastSyncTime: now });
    await db.syncMetadata.put({ key: 'lastSync', lastSyncTime: now });
  },

  async syncMail() {
    setSyncStatus('mail', 'syncing');
    try {
      const emails = await getFlaggedEmails();
      await db.transaction('rw', db.outlookEmails, async () => {
        await db.outlookEmails.clear();
        if (emails.length > 0) await db.outlookEmails.bulkPut(emails);
      });
      setSyncStatus('mail', 'success');
    } catch (err) {
      console.warn('Mail sync:', err);
      setSyncStatus('mail', 'error');
    }
  },

  async syncCalendar() {
    setSyncStatus('calendar', 'syncing');
    try {
      const events = await getUpcomingEvents(7);
      await db.transaction('rw', db.calendarEvents, async () => {
        await db.calendarEvents.clear();
        if (events.length > 0) await db.calendarEvents.bulkPut(events);
      });
      setSyncStatus('calendar', 'success');
    } catch (err) {
      console.warn('Calendar sync:', err);
      setSyncStatus('calendar', 'error');
    }
  },

  async syncTeams() {
    setSyncStatus('teams', 'syncing');
    try {
      const mentions = await getRecentChats();
      await db.transaction('rw', db.teamsMentions, async () => {
        await db.teamsMentions.clear();
        if (mentions.length > 0) await db.teamsMentions.bulkPut(mentions);
      });
      setSyncStatus('teams', 'success');
    } catch (err) {
      console.warn('Teams sync:', err);
      setSyncStatus('teams', 'error');
    }
  },

  async syncPlanner() {
    setSyncStatus('planner', 'syncing');
    try {
      const tasks = await getPlannerTasks();
      await db.transaction('rw', db.plannerTasks, async () => {
        await db.plannerTasks.clear();
        if (tasks.length > 0) await db.plannerTasks.bulkPut(tasks);
      });
      setSyncStatus('planner', 'success');
    } catch (err) {
      console.warn('Planner sync:', err);
      setSyncStatus('planner', 'error');
    }
  },

  async clearIntegrationData() {
    await db.outlookEmails.clear();
    await db.calendarEvents.clear();
    await db.teamsMentions.clear();
    await db.plannerTasks.clear();
    await db.syncMetadata.clear();
    set({
      syncStatus: { mail: 'idle', calendar: 'idle', teams: 'idle', planner: 'idle' },
      lastSyncTime: null,
      isSyncing: false,
    });
  },
};
