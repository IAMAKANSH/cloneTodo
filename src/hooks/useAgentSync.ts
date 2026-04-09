import { useEffect, useRef } from 'react';
import { db } from '../db/database';
import type { Task } from '../types';

const SYNC_INTERVAL = 15_000; // 15 seconds
const AGENT_URL = 'http://localhost:3001';

let lastSyncHash = '';

async function syncWithAgent() {
  try {
    // Check if agent is running
    const healthRes = await fetch(`${AGENT_URL}/health`, {
      signal: AbortSignal.timeout(1000),
      mode: 'cors',
    });
    if (!healthRes.ok) return;

    const res = await fetch(`${AGENT_URL}/api/tasks`);
    if (!res.ok) return;
    const { tasks: agentTasks } = await res.json();
    if (!agentTasks) return;

    // Quick hash check — skip if nothing changed
    const hash = JSON.stringify(agentTasks.map((t: any) => t.id + t.updatedAt).sort());
    if (hash === lastSyncHash) return;
    lastSyncHash = hash;

    // Find truly new tasks (not already in IndexedDB)
    const existingIds = new Set((await db.tasks.toArray()).map((t) => t.id));
    const newTasks: Task[] = [];

    for (const t of agentTasks) {
      if (!existingIds.has(t.id)) {
        newTasks.push({
          id: t.id,
          listId: 'default-tasks',
          title: t.title,
          notes: t.notes || '',
          isCompleted: !!t.isCompleted,
          isImportant: !!t.isImportant,
          isMyDay: !!t.isMyDay,
          myDayDate: t.myDayDate || null,
          dueDate: t.dueDate || null,
          reminderDate: null,
          recurrence: null,
          assignedTo: null,
          categories: t.categories || [],
          sortOrder: t.sortOrder || 0,
          completedAt: t.completedAt || null,
          reminderFired: t.reminderFired || false,
          createdAt: t.createdAt || new Date().toISOString(),
          updatedAt: t.updatedAt || new Date().toISOString(),
        });
      }
    }

    // Only write to DB if there are genuinely new tasks
    if (newTasks.length > 0) {
      await db.tasks.bulkAdd(newTasks);
      console.log(`Synced ${newTasks.length} tasks from CLI agent`);
    }

    // Update existing tasks that changed (compare updatedAt)
    const existingTasks = await db.tasks.toArray();
    const existingMap = new Map(existingTasks.map((t) => [t.id, t]));
    let updated = 0;

    for (const agentTask of agentTasks) {
      const existing = existingMap.get(agentTask.id);
      if (existing && agentTask.updatedAt && agentTask.updatedAt > existing.updatedAt) {
        // Dexie indexes booleans as 0/1, so we must convert
        await db.tasks.update(agentTask.id, {
          isCompleted: agentTask.isCompleted ? true : false,
          isImportant: agentTask.isImportant ? true : false,
          isMyDay: agentTask.isMyDay ? true : false,
          myDayDate: agentTask.myDayDate || null,
          dueDate: agentTask.dueDate || null,
          title: agentTask.title,
          updatedAt: agentTask.updatedAt,
        });
        updated++;
      }
    }

    if (updated > 0) {
      console.log(`Updated ${updated} tasks from CLI agent`);
    }
  } catch {
    // Agent not running — silently ignore
  }
}

export function useAgentSync() {
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Delay initial sync to avoid interfering with app startup
    const timeout = window.setTimeout(() => {
      syncWithAgent();
      intervalRef.current = window.setInterval(syncWithAgent, SYNC_INTERVAL);
    }, 3000);

    return () => {
      clearTimeout(timeout);
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, []);
}
