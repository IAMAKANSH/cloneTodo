import { graphFetchList } from './graphClient';
import type { PlannerTask, TeamsMention } from '../types/graph';

interface GraphPlannerTask {
  id: string;
  title: string;
  dueDateTime?: string;
  percentComplete: number;
  priority: number;
  planId: string;
}

interface GraphChat {
  id: string;
  lastMessagePreview?: {
    body?: { content?: string };
    from?: { user?: { displayName?: string } };
    createdDateTime?: string;
  };
}

export async function getPlannerTasks(): Promise<PlannerTask[]> {
  try {
    const tasks = await graphFetchList<GraphPlannerTask>(
      'me/planner/tasks?$top=50'
    );
    return tasks
      .filter((t) => t.percentComplete < 100)
      .map((t) => ({
        id: t.id,
        title: t.title,
        dueDateTime: t.dueDateTime || undefined,
        percentComplete: t.percentComplete,
        priority: t.priority,
        planId: t.planId,
      }));
  } catch {
    // Planner API not available for personal Microsoft accounts
    return [];
  }
}

export async function getRecentChats(): Promise<TeamsMention[]> {
  try {
    const chats = await graphFetchList<GraphChat>(
      'me/chats?$expand=lastMessagePreview&$top=20'
    );

    return chats
      .filter((c) => c.lastMessagePreview?.body?.content)
      .slice(0, 15)
      .map((c) => ({
        id: c.id,
        messagePreview: c.lastMessagePreview?.body?.content || '',
        chatId: c.id,
        senderName: c.lastMessagePreview?.from?.user?.displayName || 'Unknown',
        createdDateTime: c.lastMessagePreview?.createdDateTime || new Date().toISOString(),
      }));
  } catch {
    // Teams Chat API not available for personal Microsoft accounts
    return [];
  }
}
