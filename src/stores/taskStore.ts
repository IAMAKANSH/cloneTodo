import { db } from '../db/database';
import type { Task, Step } from '../types';
import { getTodayString } from '../lib/dates';
import { playCompletionSound } from '../lib/sounds';
import { useSettingsStore } from './settingsStore';
import { DEFAULT_LIST_ID } from '../lib/constants';

function now() {
  return new Date().toISOString();
}

export const taskActions = {
  async createTask(title: string, listId?: string, options?: Partial<Task>): Promise<string> {
    const settings = useSettingsStore.getState();
    const targetListId = listId || DEFAULT_LIST_ID;

    const existingTasks = await db.tasks
      .where('listId')
      .equals(targetListId)
      .count();

    const sortOrder = settings.newTaskPosition === 'top' ? -1 : existingTasks;

    const task: Task = {
      id: crypto.randomUUID(),
      listId: targetListId,
      title,
      notes: '',
      isCompleted: false,
      completedAt: null,
      isImportant: false,
      isMyDay: false,
      myDayDate: null,
      dueDate: null,
      reminderDate: null,
      reminderFired: false,
      recurrence: null,
      assignedTo: null,
      categories: [],
      sortOrder,
      createdAt: now(),
      updatedAt: now(),
      ...options,
    };

    await db.tasks.add(task);

    // Re-normalize sort orders if we inserted at top
    if (settings.newTaskPosition === 'top') {
      const allTasks = await db.tasks
        .where('listId')
        .equals(targetListId)
        .sortBy('sortOrder');
      const updates = allTasks.map((t, i) => ({
        key: t.id,
        changes: { sortOrder: i },
      }));
      await db.tasks.bulkUpdate(updates);
    }

    return task.id;
  },

  async toggleComplete(taskId: string) {
    const task = await db.tasks.get(taskId);
    if (!task) return;

    const isCompleted = !task.isCompleted;

    await db.tasks.update(taskId, {
      isCompleted,
      completedAt: isCompleted ? now() : null,
      updatedAt: now(),
    });

    if (isCompleted && useSettingsStore.getState().playCompletionSound) {
      playCompletionSound();
    }
  },

  async toggleImportant(taskId: string) {
    const task = await db.tasks.get(taskId);
    if (!task) return;

    await db.tasks.update(taskId, {
      isImportant: !task.isImportant,
      updatedAt: now(),
    });
  },

  async toggleMyDay(taskId: string) {
    const task = await db.tasks.get(taskId);
    if (!task) return;

    const isMyDay = !task.isMyDay;
    await db.tasks.update(taskId, {
      isMyDay,
      myDayDate: isMyDay ? getTodayString() : null,
      updatedAt: now(),
    });
  },

  async updateTask(taskId: string, changes: Partial<Task>) {
    await db.tasks.update(taskId, {
      ...changes,
      updatedAt: now(),
    });
  },

  async deleteTask(taskId: string) {
    await db.transaction('rw', db.tasks, db.steps, db.attachments, async () => {
      await db.steps.where('taskId').equals(taskId).delete();
      await db.attachments.where('taskId').equals(taskId).delete();
      await db.tasks.delete(taskId);
    });
  },

  async reorderTasks(_listId: string, taskIds: string[]) {
    const updates = taskIds.map((id, i) => ({
      key: id,
      changes: { sortOrder: i, updatedAt: now() },
    }));
    await db.tasks.bulkUpdate(updates);
  },

  async moveTask(taskId: string, targetListId: string) {
    const count = await db.tasks.where('listId').equals(targetListId).count();
    await db.tasks.update(taskId, {
      listId: targetListId,
      sortOrder: count,
      updatedAt: now(),
    });
  },

  async copyTask(taskId: string, targetListId: string) {
    const task = await db.tasks.get(taskId);
    if (!task) return;

    const newTaskId = crypto.randomUUID();
    const count = await db.tasks.where('listId').equals(targetListId).count();

    await db.tasks.add({
      ...task,
      id: newTaskId,
      listId: targetListId,
      sortOrder: count,
      createdAt: now(),
      updatedAt: now(),
    });

    // Copy steps
    const steps = await db.steps.where('taskId').equals(taskId).toArray();
    for (const step of steps) {
      await db.steps.add({
        ...step,
        id: crypto.randomUUID(),
        taskId: newTaskId,
        createdAt: now(),
      });
    }
  },

  // Steps
  async addStep(taskId: string, title: string): Promise<string> {
    const stepCount = await db.steps.where('taskId').equals(taskId).count();
    const step: Step = {
      id: crypto.randomUUID(),
      taskId,
      title,
      isCompleted: false,
      sortOrder: stepCount,
      createdAt: now(),
    };
    await db.steps.add(step);
    await db.tasks.update(taskId, { updatedAt: now() });
    return step.id;
  },

  async toggleStep(stepId: string) {
    const step = await db.steps.get(stepId);
    if (!step) return;
    await db.steps.update(stepId, { isCompleted: !step.isCompleted });
    await db.tasks.update(step.taskId, { updatedAt: now() });
  },

  async updateStep(stepId: string, title: string) {
    const step = await db.steps.get(stepId);
    if (!step) return;
    await db.steps.update(stepId, { title });
    await db.tasks.update(step.taskId, { updatedAt: now() });
  },

  async deleteStep(stepId: string) {
    const step = await db.steps.get(stepId);
    if (!step) return;
    await db.steps.delete(stepId);
    await db.tasks.update(step.taskId, { updatedAt: now() });
  },

  // My Day reset
  async resetMyDay() {
    const today = getTodayString();
    const staleMyDayTasks = await db.tasks
      .where('isMyDay')
      .equals(1)
      .filter((t) => t.myDayDate !== today)
      .toArray();

    if (staleMyDayTasks.length > 0) {
      const updates = staleMyDayTasks.map((t) => ({
        key: t.id,
        changes: { isMyDay: false, myDayDate: null },
      }));
      await db.tasks.bulkUpdate(updates);
    }

    localStorage.setItem('lastActiveDate', today);
  },
};
