export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number;
  daysOfWeek?: number[];    // 0=Sun..6=Sat
  dayOfMonth?: number;
  monthOfYear?: number;     // 0-11
  endDate?: string | null;
  endAfterCount?: number | null;
}

export interface Task {
  id: string;
  listId: string;
  title: string;
  notes: string;
  isCompleted: boolean;
  completedAt: string | null;
  isImportant: boolean;
  isMyDay: boolean;
  myDayDate: string | null;
  dueDate: string | null;
  reminderDate: string | null;
  reminderFired: boolean;
  recurrence: RecurrenceRule | null;
  assignedTo: string | null;
  categories: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Step {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface Attachment {
  id: string;
  taskId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  data: Blob;
  createdAt: string;
}
