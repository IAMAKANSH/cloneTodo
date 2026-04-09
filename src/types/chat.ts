export type CommandType =
  | 'add_task'
  | 'show_tasks'
  | 'complete_task'
  | 'delete_task'
  | 'star_task'
  | 'add_to_myday'
  | 'search_tasks'
  | 'show_calendar'
  | 'show_emails'
  | 'show_planner'
  | 'show_teams'
  | 'help'
  | 'unknown';

export interface ParsedCommand {
  type: CommandType;
  taskTitle?: string;
  searchQuery?: string;
  listName?: string;
  viewFilter?: 'myday' | 'important' | 'planned' | 'all' | 'completed';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: string;
  data?: ChatResponseData;
}

export interface ChatResponseData {
  type: 'task_list' | 'calendar_list' | 'email_list' | 'single_task' | 'text';
  tasks?: Array<{ id: string; title: string; isCompleted: boolean; isImportant: boolean; isMyDay: boolean }>;
  events?: Array<{ subject: string; start: string; end: string; location?: string; isAllDay: boolean }>;
  emails?: Array<{ subject: string; from: string; bodyPreview: string }>;
}
