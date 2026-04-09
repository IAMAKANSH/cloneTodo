import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { SmartListId, Task } from '../types';
import { getTodayString } from '../lib/dates';
import { isToday, isTomorrow, isThisWeek, parseISO, isPast } from 'date-fns';

export function useTasks(view: SmartListId | string): Task[] | undefined {
  return useLiveQuery(async () => {
    const today = getTodayString();

    switch (view) {
      case 'myday': {
        return db.tasks
          .filter((t) => t.isMyDay && t.myDayDate === today && !t.isCompleted)
          .sortBy('sortOrder');
      }
      case 'important': {
        return db.tasks
          .filter((t) => t.isImportant && !t.isCompleted)
          .sortBy('sortOrder');
      }
      case 'planned': {
        const tasks = await db.tasks
          .where('dueDate')
          .notEqual('')
          .filter((t) => t.dueDate !== null && !t.isCompleted)
          .sortBy('dueDate');
        return tasks;
      }
      case 'assigned': {
        return db.tasks
          .filter((t) => t.assignedTo !== null && t.assignedTo !== '' && !t.isCompleted)
          .sortBy('sortOrder');
      }
      case 'tasks': {
        return db.tasks
          .where('listId')
          .equals('default-tasks')
          .filter((t) => !t.isCompleted)
          .sortBy('sortOrder');
      }
      default: {
        // Custom list
        return db.tasks
          .where('listId')
          .equals(view)
          .filter((t) => !t.isCompleted)
          .sortBy('sortOrder');
      }
    }
  }, [view]);
}

export function useCompletedTasks(view: SmartListId | string): Task[] | undefined {
  return useLiveQuery(async () => {
    switch (view) {
      case 'myday': {
        const today = getTodayString();
        return db.tasks
          .filter((t) => t.isMyDay && t.myDayDate === today && t.isCompleted)
          .sortBy('completedAt');
      }
      case 'important':
        return db.tasks
          .filter((t) => t.isImportant && t.isCompleted)
          .sortBy('completedAt');
      case 'planned':
        return db.tasks
          .filter((t) => t.dueDate !== null && t.isCompleted)
          .sortBy('completedAt');
      case 'assigned':
        return db.tasks
          .filter((t) => t.assignedTo !== null && t.isCompleted)
          .sortBy('completedAt');
      case 'tasks':
        return db.tasks
          .where('listId')
          .equals('default-tasks')
          .filter((t) => t.isCompleted)
          .sortBy('completedAt');
      default:
        return db.tasks
          .where('listId')
          .equals(view)
          .filter((t) => t.isCompleted)
          .sortBy('completedAt');
    }
  }, [view]);
}

export function useTaskCounts(): Record<string, number> | undefined {
  return useLiveQuery(async () => {
    const today = getTodayString();
    const [myday, important, planned, assigned] = await Promise.all([
      db.tasks.filter((t) => t.isMyDay && t.myDayDate === today && !t.isCompleted).count(),
      db.tasks.filter((t) => t.isImportant && !t.isCompleted).count(),
      db.tasks.filter((t) => t.dueDate !== null && !t.isCompleted).count(),
      db.tasks.filter((t) => t.assignedTo !== null && t.assignedTo !== '' && !t.isCompleted).count(),
    ]);

    // Count per list
    const lists = await db.lists.toArray();
    const listCounts: Record<string, number> = {};
    for (const list of lists) {
      listCounts[list.id] = await db.tasks
        .where('listId')
        .equals(list.id)
        .filter((t) => !t.isCompleted)
        .count();
    }

    return {
      myday,
      important,
      planned,
      assigned,
      tasks: listCounts['default-tasks'] || 0,
      ...listCounts,
    };
  });
}

export function usePlannedGroups() {
  return useLiveQuery(async () => {
    const tasks = await db.tasks
      .filter((t) => t.dueDate !== null && !t.isCompleted)
      .toArray();

    const overdue: Task[] = [];
    const today: Task[] = [];
    const tomorrow: Task[] = [];
    const thisWeek: Task[] = [];
    const later: Task[] = [];

    for (const task of tasks) {
      if (!task.dueDate) continue;
      const date = parseISO(task.dueDate);
      if (isPast(date) && !isToday(date)) {
        overdue.push(task);
      } else if (isToday(date)) {
        today.push(task);
      } else if (isTomorrow(date)) {
        tomorrow.push(task);
      } else if (isThisWeek(date)) {
        thisWeek.push(task);
      } else {
        later.push(task);
      }
    }

    return { overdue, today, tomorrow, thisWeek, later };
  });
}
