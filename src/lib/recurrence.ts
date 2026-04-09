import { addDays, addWeeks, addMonths, addYears, parseISO, format, getDay, nextDay } from 'date-fns';
import type { RecurrenceRule } from '../types';

export function computeNextOccurrence(currentDueDate: string, rule: RecurrenceRule): string {
  const date = parseISO(currentDueDate);
  const { frequency, interval } = rule;

  let next: Date;

  switch (frequency) {
    case 'daily':
      next = addDays(date, interval);
      break;

    case 'weekly': {
      if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
        // Find next matching day of week
        const currentDay = getDay(date);
        const sortedDays = [...rule.daysOfWeek].sort((a, b) => a - b);
        const nextDayIndex = sortedDays.findIndex((d) => d > currentDay);

        if (nextDayIndex >= 0) {
          // There's a matching day later this week
          next = nextDay(date, sortedDays[nextDayIndex] as Day);
        } else {
          // Wrap to first day of next week cycle
          const daysUntilNextWeek = 7 * interval - currentDay + sortedDays[0];
          next = addDays(date, daysUntilNextWeek);
        }
      } else {
        next = addWeeks(date, interval);
      }
      break;
    }

    case 'monthly':
      next = addMonths(date, interval);
      if (rule.dayOfMonth) {
        const maxDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
        next.setDate(Math.min(rule.dayOfMonth, maxDay));
      }
      break;

    case 'yearly':
      next = addYears(date, interval);
      break;

    default:
      next = addDays(date, 1);
  }

  return format(next, 'yyyy-MM-dd');
}

type Day = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export function describeRecurrence(rule: RecurrenceRule): string {
  const { frequency, interval } = rule;
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (interval === 1) {
    switch (frequency) {
      case 'daily': return 'Daily';
      case 'weekly': {
        if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
          if (arraysEqual(rule.daysOfWeek, [1, 2, 3, 4, 5])) return 'Weekdays';
          return `Weekly on ${rule.daysOfWeek.map((d) => dayNames[d]).join(', ')}`;
        }
        return 'Weekly';
      }
      case 'monthly': return 'Monthly';
      case 'yearly': return 'Yearly';
    }
  }

  switch (frequency) {
    case 'daily': return `Every ${interval} days`;
    case 'weekly': return `Every ${interval} weeks`;
    case 'monthly': return `Every ${interval} months`;
    case 'yearly': return `Every ${interval} years`;
  }
}

function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((v, i) => v === sortedB[i]);
}
