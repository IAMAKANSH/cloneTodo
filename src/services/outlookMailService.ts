import { graphFetchList } from './graphClient';
import type { OutlookEmail } from '../types/graph';

interface GraphEmail {
  id: string;
  subject: string;
  bodyPreview: string;
  from: { emailAddress: { name: string; address: string } };
  receivedDateTime: string;
  webLink: string;
  flag: { flagStatus: string };
  importance: string;
}

function mapEmail(e: GraphEmail): OutlookEmail {
  return {
    id: e.id,
    subject: e.subject || '(No subject)',
    bodyPreview: e.bodyPreview || '',
    from: {
      name: e.from?.emailAddress?.name || 'Unknown',
      address: e.from?.emailAddress?.address || '',
    },
    receivedDateTime: e.receivedDateTime,
    webLink: e.webLink,
    flagStatus: (e.flag?.flagStatus || 'notFlagged') as OutlookEmail['flagStatus'],
    importance: (e.importance || 'normal') as OutlookEmail['importance'],
  };
}

export async function getFlaggedEmails(): Promise<OutlookEmail[]> {
  // Personal accounts don't support $filter on flag + $orderby together
  // Fetch recent emails and filter client-side
  try {
    // Try the filter first (works for work accounts)
    const emails = await graphFetchList<GraphEmail>(
      "me/messages?$filter=flag/flagStatus eq 'flagged'&$top=25&$select=id,subject,bodyPreview,from,receivedDateTime,webLink,flag,importance"
    );
    return emails.map(mapEmail);
  } catch {
    // Fallback: fetch recent emails and filter client-side
    try {
      const emails = await graphFetchList<GraphEmail>(
        "me/messages?$top=50&$select=id,subject,bodyPreview,from,receivedDateTime,webLink,flag,importance"
      );
      return emails
        .filter((e) => e.flag?.flagStatus === 'flagged' || e.importance === 'high')
        .map(mapEmail);
    } catch {
      return [];
    }
  }
}

export async function getImportantEmails(): Promise<OutlookEmail[]> {
  try {
    const emails = await graphFetchList<GraphEmail>(
      "me/messages?$top=20&$select=id,subject,bodyPreview,from,receivedDateTime,webLink,flag,importance"
    );
    return emails
      .filter((e) => e.importance === 'high')
      .map(mapEmail);
  } catch {
    return [];
  }
}
