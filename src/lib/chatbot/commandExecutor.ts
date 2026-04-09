import { db } from '../../db/database';
import { taskActions } from '../../stores/taskStore';
import { useAuthStore } from '../../stores/authStore';
import { getTodayString } from '../dates';
import { findBestTaskMatch } from './fuzzyMatch';
import type { ParsedCommand, ChatMessage, ChatResponseData } from '../../types/chat';

function msg(content: string, data?: ChatResponseData): Omit<ChatMessage, 'id' | 'timestamp'> {
  return { role: 'bot', content, data };
}

export async function executeCommand(command: ParsedCommand): Promise<Omit<ChatMessage, 'id' | 'timestamp'>> {
  switch (command.type) {
    case 'add_task':
      return handleAddTask(command);
    case 'show_tasks':
      return handleShowTasks(command);
    case 'complete_task':
      return handleCompleteTask(command);
    case 'delete_task':
      return handleDeleteTask(command);
    case 'star_task':
      return handleStarTask(command);
    case 'add_to_myday':
      return handleAddToMyDay(command);
    case 'search_tasks':
      return handleSearchTasks(command);
    case 'show_calendar':
      return handleShowCalendar();
    case 'show_emails':
      return handleShowEmails();
    case 'show_planner':
      return handleShowPlanner();
    case 'show_teams':
      return handleShowTeams();
    case 'help':
      return handleHelp();
    default:
      return msg(
        "I didn't quite understand that. Try commands like:\n" +
        '- "add task buy groceries"\n' +
        '- "show my tasks"\n' +
        '- "complete buy groceries"\n' +
        '- "calendar" or "emails"\n' +
        'Type "help" for all commands.'
      );
  }
}

async function handleAddTask(cmd: ParsedCommand) {
  if (!cmd.taskTitle) {
    return msg('What should the task be called? Try: "add task buy groceries"');
  }
  await taskActions.createTask(cmd.taskTitle, 'default-tasks', {});
  return msg(`Added task: **${cmd.taskTitle}**`);
}

async function handleShowTasks(cmd: ParsedCommand) {
  const today = getTodayString();
  let tasks;
  let label: string;

  switch (cmd.viewFilter) {
    case 'myday':
      tasks = await db.tasks.filter((t) => !t.isCompleted && t.isMyDay && t.myDayDate === today).toArray();
      label = 'My Day';
      break;
    case 'important':
      tasks = await db.tasks.filter((t) => !t.isCompleted && t.isImportant).toArray();
      label = 'Important';
      break;
    case 'completed':
      tasks = await db.tasks.filter((t) => t.isCompleted).toArray();
      label = 'Completed';
      break;
    default:
      tasks = await db.tasks.filter((t) => !t.isCompleted).toArray();
      label = 'All';
  }

  if (tasks.length === 0) {
    return msg(`No ${label.toLowerCase()} tasks found.`);
  }

  return msg(
    `**${label} tasks** (${tasks.length}):`,
    {
      type: 'task_list',
      tasks: tasks.slice(0, 15).map((t) => ({
        id: t.id,
        title: t.title,
        isCompleted: t.isCompleted,
        isImportant: t.isImportant,
        isMyDay: t.isMyDay && t.myDayDate === today,
      })),
    }
  );
}

async function handleCompleteTask(cmd: ParsedCommand) {
  if (!cmd.taskTitle) return msg('Which task? Try: "complete buy groceries"');

  const tasks = await db.tasks.filter((t) => !t.isCompleted).toArray();
  const match = findBestTaskMatch(cmd.taskTitle, tasks);

  if (!match) return msg(`Couldn't find a task matching "${cmd.taskTitle}".`);

  await taskActions.toggleComplete(match.id);
  return msg(`Completed: **${match.title}**`);
}

async function handleDeleteTask(cmd: ParsedCommand) {
  if (!cmd.taskTitle) return msg('Which task? Try: "delete buy groceries"');

  const tasks = await db.tasks.toArray();
  const match = findBestTaskMatch(cmd.taskTitle, tasks);

  if (!match) return msg(`Couldn't find a task matching "${cmd.taskTitle}".`);

  await taskActions.deleteTask(match.id);
  return msg(`Deleted: **${match.title}**`);
}

async function handleStarTask(cmd: ParsedCommand) {
  if (!cmd.taskTitle) return msg('Which task? Try: "star buy groceries"');

  const tasks = await db.tasks.filter((t) => !t.isCompleted).toArray();
  const match = findBestTaskMatch(cmd.taskTitle, tasks);

  if (!match) return msg(`Couldn't find a task matching "${cmd.taskTitle}".`);

  await taskActions.toggleImportant(match.id);
  const action = match.isImportant ? 'Removed star from' : 'Starred';
  return msg(`${action}: **${match.title}**`);
}

async function handleAddToMyDay(cmd: ParsedCommand) {
  if (!cmd.taskTitle) return msg('Which task? Try: "add to my day: buy groceries"');

  const tasks = await db.tasks.filter((t) => !t.isCompleted).toArray();
  const match = findBestTaskMatch(cmd.taskTitle, tasks);

  if (!match) return msg(`Couldn't find a task matching "${cmd.taskTitle}".`);

  await taskActions.toggleMyDay(match.id);
  return msg(`Added to My Day: **${match.title}**`);
}

async function handleSearchTasks(cmd: ParsedCommand) {
  if (!cmd.searchQuery) return msg('What are you looking for? Try: "search groceries"');

  const query = cmd.searchQuery.toLowerCase();
  const tasks = await db.tasks
    .filter((t) => t.title.toLowerCase().includes(query) || t.notes.toLowerCase().includes(query))
    .toArray();

  if (tasks.length === 0) return msg(`No tasks found matching "${cmd.searchQuery}".`);

  const today = getTodayString();
  return msg(
    `Found **${tasks.length}** task${tasks.length !== 1 ? 's' : ''}:`,
    {
      type: 'task_list',
      tasks: tasks.slice(0, 10).map((t) => ({
        id: t.id,
        title: t.title,
        isCompleted: t.isCompleted,
        isImportant: t.isImportant,
        isMyDay: t.isMyDay && t.myDayDate === today,
      })),
    }
  );
}

function requireAuth(): Omit<ChatMessage, 'id' | 'timestamp'> | null {
  if (!useAuthStore.getState().isAuthenticated) {
    return msg('Please sign in with Microsoft first to access this data.');
  }
  return null;
}

async function handleShowCalendar() {
  const authMsg = requireAuth();
  if (authMsg) return authMsg;

  const events = await db.calendarEvents.toArray();
  if (events.length === 0) return msg('No upcoming calendar events found.');

  return msg(
    `**Upcoming events** (${events.length}):`,
    {
      type: 'calendar_list',
      events: events.slice(0, 10).map((e) => ({
        subject: e.subject,
        start: e.start.dateTime,
        end: e.end.dateTime,
        location: e.location,
        isAllDay: e.isAllDay,
      })),
    }
  );
}

async function handleShowEmails() {
  const authMsg = requireAuth();
  if (authMsg) return authMsg;

  const emails = await db.outlookEmails.toArray();
  if (emails.length === 0) return msg('No flagged emails found.');

  return msg(
    `**Flagged emails** (${emails.length}):`,
    {
      type: 'email_list',
      emails: emails.slice(0, 10).map((e) => ({
        subject: e.subject,
        from: e.from.name,
        bodyPreview: e.bodyPreview,
      })),
    }
  );
}

async function handleShowPlanner() {
  const authMsg = requireAuth();
  if (authMsg) return authMsg;

  const tasks = await db.plannerTasks.toArray();
  if (tasks.length === 0) return msg('No Planner tasks found.');

  return msg(
    `**Planner tasks** (${tasks.length}):\n` +
    tasks.slice(0, 10).map((t) => `- ${t.title} (${t.percentComplete}%)`).join('\n')
  );
}

async function handleShowTeams() {
  const authMsg = requireAuth();
  if (authMsg) return authMsg;

  const mentions = await db.teamsMentions.toArray();
  if (mentions.length === 0) return msg('No recent Teams messages found.');

  return msg(
    `**Recent Teams messages** (${mentions.length}):\n` +
    mentions.slice(0, 8).map((m) => `- **${m.senderName}**: ${m.messagePreview.replace(/<[^>]*>/g, '').slice(0, 60)}`).join('\n')
  );
}

function handleHelp() {
  return msg(
    '**Available commands:**\n\n' +
    '**Tasks:**\n' +
    '- `add task <title>` — Create a new task\n' +
    '- `show my tasks` — List all active tasks\n' +
    '- `my day` — Show My Day tasks\n' +
    '- `show important` — Show starred tasks\n' +
    '- `complete <task>` — Mark task as done\n' +
    '- `delete <task>` — Delete a task\n' +
    '- `star <task>` — Toggle importance\n' +
    '- `add to my day: <task>` — Add task to My Day\n' +
    '- `search <query>` — Search tasks\n\n' +
    '**Microsoft 365:**\n' +
    '- `calendar` — Show upcoming events\n' +
    '- `emails` — Show flagged emails\n' +
    '- `planner` — Show Planner tasks\n' +
    '- `teams` — Show Teams messages'
  );
}
