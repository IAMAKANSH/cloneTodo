import { format, isToday, isTomorrow, isYesterday, isPast, isThisWeek, parseISO } from 'date-fns';

export function formatDueDate(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date)) return format(date, 'EEEE');
  return format(date, 'EEE, MMM d');
}

export function isDueDateOverdue(dateStr: string): boolean {
  const date = parseISO(dateStr);
  return isPast(date) && !isToday(date);
}

export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatCreatedDate(dateStr: string): string {
  return format(parseISO(dateStr), 'EEE, MMM d, yyyy');
}
