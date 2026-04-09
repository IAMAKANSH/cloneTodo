export interface OutlookEmail {
  id: string;
  subject: string;
  bodyPreview: string;
  from: { name: string; address: string };
  receivedDateTime: string;
  webLink: string;
  flagStatus: 'flagged' | 'complete' | 'notFlagged';
  importance: 'low' | 'normal' | 'high';
}

export interface CalendarEvent {
  id: string;
  subject: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  location?: string;
  isAllDay: boolean;
  webLink: string;
  organizer?: string;
}

export interface Team {
  id: string;
  displayName: string;
  description?: string;
}

export interface TeamsMention {
  id: string;
  messagePreview: string;
  chatId: string;
  senderName: string;
  createdDateTime: string;
  webLink?: string;
}

export interface PlannerTask {
  id: string;
  title: string;
  dueDateTime?: string;
  percentComplete: number;
  priority: number;
  planId: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  mail: string;
  photoUrl?: string;
}

export type IntegrationSource =
  | 'outlook-mail'
  | 'outlook-calendar'
  | 'teams-mention'
  | 'planner';

export interface IntegrationSuggestion {
  id: string;
  title: string;
  source: IntegrationSource;
  reason: string;
  sourceUrl?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}
