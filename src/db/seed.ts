import { db } from './database';
import type { TaskList } from '../types/list';

const DEFAULT_LIST_ID = 'default-tasks';

const defaultList: TaskList = {
  id: DEFAULT_LIST_ID,
  groupId: null,
  name: 'Tasks',
  themeColor: '#2564cf',
  isDefault: true,
  showCompleted: false,
  sortBy: 'manual',
  sortDirection: 'asc',
  sortOrder: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export async function seedDatabase() {
  try {
    const listCount = await db.lists.count();
    if (listCount === 0) {
      await db.lists.add(defaultList);
    }
  } catch (err: any) {
    // If DB schema is corrupted/outdated, reset it
    if (err.name === 'VersionError' || err.name === 'UpgradeError' || err.message?.includes('version')) {
      console.warn('Database version conflict — resetting database...');
      await db.delete();
      window.location.reload();
      return;
    }
    console.error('Seed error:', err);
  }
}

export { DEFAULT_LIST_ID };
