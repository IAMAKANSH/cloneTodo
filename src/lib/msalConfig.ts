import { PublicClientApplication, type Configuration } from '@azure/msal-browser';

const msalConfig: Configuration = {
  auth: {
    clientId: '98f50838-f29a-4ea1-a6ab-3381a5551911',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
  },
};

export const loginRequest = {
  scopes: [
    'User.Read',
    'Mail.Read',
    'Calendars.Read',
    'Tasks.Read',
    'Tasks.ReadWrite',
    'Team.ReadBasic.All',
    'Chat.Read',
  ],
};

export const msalInstance = new PublicClientApplication(msalConfig);
