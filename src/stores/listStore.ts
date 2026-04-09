import { db } from '../db/database';
import type { TaskList, ListGroup } from '../types';

function now() {
  return new Date().toISOString();
}

export const listActions = {
  async createList(name: string, themeColor: string = '#2564cf'): Promise<string> {
    const count = await db.lists.count();
    const list: TaskList = {
      id: crypto.randomUUID(),
      groupId: null,
      name,
      themeColor,
      isDefault: false,
      showCompleted: false,
      sortBy: 'manual',
      sortDirection: 'asc',
      sortOrder: count,
      createdAt: now(),
      updatedAt: now(),
    };
    await db.lists.add(list);
    return list.id;
  },

  async updateList(listId: string, changes: Partial<TaskList>) {
    await db.lists.update(listId, { ...changes, updatedAt: now() });
  },

  async deleteList(listId: string) {
    const list = await db.lists.get(listId);
    if (!list || list.isDefault) return;

    await db.transaction('rw', db.lists, db.tasks, db.steps, db.attachments, async () => {
      // Delete all tasks in this list and their related data
      const tasks = await db.tasks.where('listId').equals(listId).toArray();
      for (const task of tasks) {
        await db.steps.where('taskId').equals(task.id).delete();
        await db.attachments.where('taskId').equals(task.id).delete();
      }
      await db.tasks.where('listId').equals(listId).delete();
      await db.lists.delete(listId);
    });
  },

  async reorderLists(listIds: string[]) {
    const updates = listIds.map((id, i) => ({
      key: id,
      changes: { sortOrder: i, updatedAt: now() },
    }));
    await db.lists.bulkUpdate(updates);
  },

  async moveListToGroup(listId: string, groupId: string | null) {
    await db.lists.update(listId, { groupId, updatedAt: now() });
  },

  async toggleShowCompleted(listId: string) {
    const list = await db.lists.get(listId);
    if (!list) return;
    await db.lists.update(listId, {
      showCompleted: !list.showCompleted,
      updatedAt: now(),
    });
  },

  // Groups
  async createGroup(name: string): Promise<string> {
    const count = await db.groups.count();
    const group: ListGroup = {
      id: crypto.randomUUID(),
      name,
      isExpanded: true,
      sortOrder: count,
      createdAt: now(),
    };
    await db.groups.add(group);
    return group.id;
  },

  async updateGroup(groupId: string, changes: Partial<ListGroup>) {
    await db.groups.update(groupId, changes);
  },

  async deleteGroup(groupId: string) {
    // Ungroup all lists in this group
    const listsInGroup = await db.lists.where('groupId').equals(groupId).toArray();
    for (const list of listsInGroup) {
      await db.lists.update(list.id, { groupId: null });
    }
    await db.groups.delete(groupId);
  },

  async toggleGroupExpanded(groupId: string) {
    const group = await db.groups.get(groupId);
    if (!group) return;
    await db.groups.update(groupId, { isExpanded: !group.isExpanded });
  },
};
