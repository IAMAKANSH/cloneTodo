import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { getTodayString } from '../lib/dates';
import { useAuthStore } from '../stores/authStore';
import type { IntegrationSuggestion } from '../types/graph';
import type { Task } from '../types';

interface LocalSuggestion {
  task: Task;
  reason: string;
}

export function useSmartSuggestions() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const localSuggestions = useLiveQuery(async () => {
    const today = getTodayString();
    const tasks = await db.tasks.filter((t) => !t.isCompleted && !t.isMyDay).toArray();
    const scored: LocalSuggestion[] = [];

    for (const task of tasks) {
      if (task.dueDate && task.dueDate <= today) {
        scored.push({ task, reason: task.dueDate === today ? 'Due today' : 'Overdue' });
        continue;
      }
      if (task.isImportant) {
        scored.push({ task, reason: 'Important' });
        continue;
      }
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      if (new Date(task.createdAt) > threeDaysAgo) {
        scored.push({ task, reason: 'Recently added' });
      }
    }

    return scored.slice(0, 8);
  });

  const integrationSuggestions = useLiveQuery(async () => {
    if (!isAuthenticated) return [];

    const suggestions: IntegrationSuggestion[] = [];

    // Flagged emails
    const emails = await db.outlookEmails.toArray();
    for (const email of emails.slice(0, 5)) {
      suggestions.push({
        id: `email-${email.id}`,
        title: email.subject,
        source: 'outlook-mail',
        reason: `Flagged email from ${email.from.name}`,
        sourceUrl: email.webLink,
        metadata: { bodyPreview: email.bodyPreview, from: email.from },
        createdAt: email.receivedDateTime,
      });
    }

    // Today's calendar events
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const events = await db.calendarEvents.toArray();
    for (const event of events) {
      const eventDate = event.start.dateTime.split('T')[0];
      if (eventDate === todayStr) {
        suggestions.push({
          id: `event-${event.id}`,
          title: event.subject,
          source: 'outlook-calendar',
          reason: event.isAllDay ? 'All-day event today' : `Event at ${formatTime(event.start.dateTime)}`,
          sourceUrl: event.webLink,
          metadata: { location: event.location, organizer: event.organizer },
          createdAt: event.start.dateTime,
        });
      }
    }

    // Planner tasks
    const plannerTasks = await db.plannerTasks.toArray();
    for (const pt of plannerTasks.slice(0, 5)) {
      suggestions.push({
        id: `planner-${pt.id}`,
        title: pt.title,
        source: 'planner',
        reason: pt.dueDateTime ? `Planner task due ${pt.dueDateTime.split('T')[0]}` : 'Planner task',
        metadata: { percentComplete: pt.percentComplete, priority: pt.priority },
        createdAt: pt.dueDateTime || now.toISOString(),
      });
    }

    // Teams mentions
    const mentions = await db.teamsMentions.toArray();
    for (const mention of mentions.slice(0, 3)) {
      suggestions.push({
        id: `teams-${mention.id}`,
        title: mention.messagePreview.slice(0, 80) || 'Teams message',
        source: 'teams-mention',
        reason: `Message from ${mention.senderName}`,
        metadata: { chatId: mention.chatId },
        createdAt: mention.createdDateTime,
      });
    }

    return suggestions;
  }, [isAuthenticated]);

  return {
    localSuggestions: localSuggestions || [],
    integrationSuggestions: integrationSuggestions || [],
  };
}

function formatTime(dateTime: string): string {
  try {
    const d = new Date(dateTime);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}
