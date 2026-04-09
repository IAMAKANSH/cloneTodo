import { create } from 'zustand';
import { msalInstance, loginRequest } from '../lib/msalConfig';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import type { UserProfile } from '../types/graph';

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isPersonalAccount: boolean;
}

// Microsoft personal account tenant ID
const MSA_TENANT_ID = '9188040d-6c67-4c5b-b112-36a304b66dad';

export const useAuthStore = create<AuthState>(() => ({
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,
  isPersonalAccount: false,
}));

const set = useAuthStore.setState;

function setUserFromAccount(account: any) {
  const isPersonal = account.tenantId === MSA_TENANT_ID;
  set({
    isAuthenticated: true,
    isLoading: false,
    error: null,
    isPersonalAccount: isPersonal,
    user: {
      id: account.localAccountId,
      displayName: account.name || account.username,
      mail: account.username,
    },
  });
}

export const authActions = {
  async initialize() {
    try {
      await msalInstance.initialize();
    } catch (err) {
      console.warn('MSAL init:', err);
    }

    // Handle redirect response (if coming back from login redirect)
    try {
      const response = await msalInstance.handleRedirectPromise();
      if (response && response.account) {
        msalInstance.setActiveAccount(response.account);
        setUserFromAccount(response.account);
        console.log('Login successful via redirect:', response.account.username);
        return;
      }
    } catch (err) {
      console.warn('Redirect handle:', err);
    }

    // Check for cached accounts
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      msalInstance.setActiveAccount(accounts[0]);
      setUserFromAccount(accounts[0]);
      console.log('Restored cached account:', accounts[0].username);
    }
  },

  async login() {
    set({ isLoading: true, error: null });
    try {
      // Use redirect flow — no popup blockers, more reliable
      await msalInstance.loginRedirect(loginRequest);
      // Page will redirect away, so this code won't continue
    } catch (err: any) {
      console.error('Login error:', err);
      set({ isLoading: false, error: err.message || 'Login failed' });
    }
  },

  async logout() {
    try {
      msalInstance.clearCache();
    } catch {
      // ignore
    }
    set({ isAuthenticated: false, user: null, isLoading: false, error: null });
  },

  async getAccessToken(scopes?: string[]): Promise<string> {
    const account = msalInstance.getActiveAccount();
    if (!account) throw new Error('No active account');

    const request = { scopes: scopes || loginRequest.scopes, account };

    try {
      const response = await msalInstance.acquireTokenSilent(request);
      return response.accessToken;
    } catch (err) {
      if (err instanceof InteractionRequiredAuthError) {
        // Use redirect for token renewal too
        await msalInstance.acquireTokenRedirect(request);
        throw new Error('Redirecting for token...');
      }
      throw err;
    }
  },
};
