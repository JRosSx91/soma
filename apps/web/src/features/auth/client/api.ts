/**
 * Lightweight fetch wrapper that automatically:
 *   - sets the Authorization header from the stored token
 *   - parses JSON responses
 *   - normalizes errors into a single ApiError type
 *   - dispatches a logout signal on 401 so the auth context can
 *     clear the user.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const TOKEN_STORAGE_KEY = 'soma.auth.token';

/**
 * Custom event emitted when the API receives a 401. The auth context
 * listens and clears the user state. Decoupled this way so the API
 * client doesn't depend on React.
 */
export const UNAUTHORIZED_EVENT = 'soma:auth:unauthorized';

export class ApiError extends Error {
  public readonly status: number;
  public readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /**
   * If true, the request is sent without the Authorization header.
   * Used for /auth/login and /auth/register.
   */
  anonymous?: boolean;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, anonymous = false } = options;

  const headers: Record<string, string> = {};

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (!anonymous) {
    const token = getStoredToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Special case: 401 means the token is invalid or missing.
  // Notify the auth context so it can clear the user.
  if (response.status === 401 && !anonymous) {
    window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
  }

  // Try to parse JSON error body for nicer messages.
  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    let details: unknown;
    try {
      const errorBody = await response.json();
      details = errorBody;
      if (typeof errorBody.message === 'string') {
        message = errorBody.message;
      } else if (Array.isArray(errorBody.message)) {
        message = errorBody.message.join('; ');
      }
    } catch {
      // Body is not JSON. Use default message.
    }
    throw new ApiError(response.status, message, details);
  }

  // 204 No Content returns no body.
  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}