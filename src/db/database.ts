import Dexie, { type Table } from 'dexie';
import type { Task, Step, Attachment } from '../types/task';
import type { TaskList, ListGroup } from '../types/list';
import type { OutlookEmail, CalendarEvent, TeamsMention, PlannerTask } from '../types/graph';

export interface SyncMetadata {
  key: string;
  lastSyncTime: string;
}

export class TodoDatabase extends Dexie {
  tasks!: Table<Task>;
  steps!: Table<Step>;
  attachments!: Table<Attachment>;
  lists!: Table<TaskList>;
  groups!: Table<ListGroup>;
  outlookEmails!: Table<OutlookEmail>;
  calendarEvents!: Table<CalendarEvent>;
  teamsMentions!: Table<TeamsMention>;
  plannerTasks!: Table<PlannerTask>;
  syncMetadata!: Table<SyncMetadata>;

  constructor() {
    super('TodoApp');

    this.version(3).stores({
      tasks: 'id, listId, isCompleted, isImportant, isMyDay, dueDate, assignedTo, createdAt, sortOrder, *categories',
      steps: 'id, taskId, sortOrder',
      attachments: 'id, taskId',
      lists: 'id, groupId, sortOrder',
      groups: 'id, sortOrder',
      outlookEmails: 'id, receivedDateTime, flagStatus',
      calendarEvents: 'id',
      teamsMentions: 'id, createdDateTime',
      plannerTasks: 'id, dueDateTime',
      syncMetadata: 'key',
    });

    // Auto-recover from version conflicts
    this.on('versionchange', () => {
      this.close();
      window.location.reload();
    });
  }
}

export const db = new TodoDatabase();

// Handle blocked version upgrades
db.open().catch((err) => {
  if (err.name === 'VersionError') {
    console.warn('Database version conflict — deleting and recreating...');
    return db.delete().then(() => window.location.reload());
  }
  console.error('Database open error:', err);
});
