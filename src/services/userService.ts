import { graphFetch } from './graphClient';
import type { UserProfile } from '../types/graph';

interface GraphUser {
  id: string;
  displayName: string;
  mail?: string;
  userPrincipalName: string;
}

export async function getMyProfile(): Promise<UserProfile> {
  const user = await graphFetch<GraphUser>('me?$select=id,displayName,mail,userPrincipalName');
  return {
    id: user.id,
    displayName: user.displayName,
    mail: user.mail || user.userPrincipalName,
  };
}

export async function getProfilePhoto(): Promise<string | null> {
  try {
    const token = (await import('../stores/authStore')).authActions.getAccessToken();
    const accessToken = await token;

    const response = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) return null;

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}
