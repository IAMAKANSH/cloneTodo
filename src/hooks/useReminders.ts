import { useEffect } from 'react';
import { db } from '../db/database';

export function useReminders() {
  useEffect(() => {
    // Request notification permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const interval = setInterval(async () => {
      const now = new Date().toISOString();
      const dueTasks = await db.tasks
        .filter((t) =>
          t.reminderDate !== null &&
          !t.reminderFired &&
          t.reminderDate <= now &&
          !t.isCompleted
        )
        .toArray();

      for (const task of dueTasks) {
        // Fire browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Todo Reminder', {
            body: task.title,
            icon: '/vite.svg',
          });
        }

        // Mark as fired
        await db.tasks.update(task.id, { reminderFired: true });
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);
}
