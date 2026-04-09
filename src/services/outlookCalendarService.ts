import { graphFetchList } from './graphClient';
import type { CalendarEvent } from '../types/graph';

interface GraphEvent {
  id: string;
  subject: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  location?: { displayName?: string };
  isAllDay: boolean;
  webLink: string;
  organizer?: { emailAddress?: { name?: string } };
}

function mapEvent(e: GraphEvent): CalendarEvent {
  return {
    id: e.id,
    subject: e.subject || '(No subject)',
    start: e.start,
    end: e.end,
    location: e.location?.displayName || undefined,
    isAllDay: e.isAllDay,
    webLink: e.webLink,
    organizer: e.organizer?.emailAddress?.name || undefined,
  };
}

export async function getUpcomingEvents(days = 7): Promise<CalendarEvent[]> {
  try {
    const now = new Date();
    const end = new Date();
    end.setDate(end.getDate() + days);

    const events = await graphFetchList<GraphEvent>(
      `me/calendarview?startdatetime=${now.toISOString()}&enddatetime=${end.toISOString()}&$top=50&$select=id,subject,start,end,location,isAllDay,webLink,organizer&$orderby=start/dateTime`
    );
    return events.map(mapEvent);
  } catch {
    return [];
  }
}

export async function getTodayEvents(): Promise<CalendarEvent[]> {
  try {
    const now = new Date();
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const events = await graphFetchList<GraphEvent>(
      `me/calendarview?startdatetime=${now.toISOString()}&enddatetime=${end.toISOString()}&$top=20&$select=id,subject,start,end,location,isAllDay,webLink,organizer&$orderby=start/dateTime`
    );
    return events.map(mapEvent);
  } catch {
    return [];
  }
}
