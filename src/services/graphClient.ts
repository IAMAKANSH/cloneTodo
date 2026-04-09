import { authActions } from '../stores/authStore';

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';

interface GraphError {
  code: string;
  message: string;
}

export class GraphApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = 'GraphApiError';
  }
}

export async function graphFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = await authActions.getAccessToken();

  const response = await fetch(`${GRAPH_BASE}/${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    let errData: GraphError = { code: 'Unknown', message: response.statusText };
    try {
      const json = await response.json();
      errData = json.error || errData;
    } catch {}
    throw new GraphApiError(errData.code, errData.message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

// Convenience for Graph API collections that return { value: T[] }
export async function graphFetchList<T>(endpoint: string): Promise<T[]> {
  const result = await graphFetch<{ value: T[] }>(endpoint);
  return result.value;
}
