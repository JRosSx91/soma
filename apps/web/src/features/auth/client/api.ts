/**
 * Fetch wrapper for the Soma API.
 *
 * - Access JWT: in-memory Bearer only.
 * - Refresh: HttpOnly cookie via credentials:"include" (never read by JS).
 * - On 401 for protected calls: single-flight /auth/refresh, then one retry.
 * - Does not refresh on 403 / 429 / 5xx, or for auth bootstrap endpoints.
 */

import {
  bumpSessionEpoch,
  clearAccessToken,
  getAccessToken,
  getSessionEpoch,
  setAccessToken,
} from "./access-token.js";

const API_BASE_URL =
  (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env
    ?.VITE_API_URL ?? "";

/** Custom header required by product policy for cookie-auth POSTs.
 *  Never a substitute for Origin validation (AuthOriginGuard). */
export const SOMA_REQUESTED_WITH = "soma-web";
export const SOMA_REQUESTED_WITH_HEADER = "X-Soma-Requested-With";

export const UNAUTHORIZED_EVENT = "soma:auth:unauthorized";
export const SESSION_REVOKED_EVENT = "soma:auth:session-revoked";

export class ApiError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(
    status: number,
    message: string,
    code?: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Skip Authorization header (login/register). */
  anonymous?: boolean;
  /** Include cookies (default true). */
  credentials?: RequestCredentials;
  /** Attach CSRF client header (refresh/logout). */
  cookieAuth?: boolean;
  /** Internal: do not attempt refresh+retry on 401. */
  skipRefresh?: boolean;
}

type RefreshResult =
  | { ok: true; accessToken: string; user: unknown }
  | { ok: false; status: number };

let refreshInFlight: Promise<RefreshResult> | null = null;

function apiUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE_URL}${path}`;
}

function isAuthMutationPath(path: string): boolean {
  return (
    path === "/auth/login" ||
    path === "/auth/register" ||
    path === "/auth/refresh" ||
    path === "/auth/logout"
  );
}

async function parseError(response: Response): Promise<ApiError> {
  let message = `HTTP ${response.status}`;
  let code: string | undefined;
  let details: unknown;
  try {
    const errorBody = await response.json();
    details = errorBody;
    if (typeof errorBody.message === "string") {
      message = errorBody.message;
    } else if (Array.isArray(errorBody.message)) {
      message = errorBody.message.join("; ");
    }
    if (typeof errorBody.code === "string") {
      code = errorBody.code;
    }
  } catch {
    // Non-JSON body.
  }
  return new ApiError(response.status, message, code, details);
}

/**
 * Single-flight refresh. Concurrent callers share one /auth/refresh.
 * Multi-tab: a twin-tab loser gets 401; we retry once after a short delay
 * so the browser can pick up the rotated HttpOnly cookie set by the winner.
 * We never read or reuse a refresh token from JavaScript.
 */
export async function refreshAccessSession(): Promise<RefreshResult> {
  if (refreshInFlight) return refreshInFlight;

  const epochAtStart = getSessionEpoch();

  refreshInFlight = (async (): Promise<RefreshResult> => {
    const attempt = async (): Promise<RefreshResult> => {
      const response = await fetch(apiUrl("/auth/refresh"), {
        method: "POST",
        credentials: "include",
        headers: {
          [SOMA_REQUESTED_WITH_HEADER]: SOMA_REQUESTED_WITH,
          Accept: "application/json",
        },
      });

      if (getSessionEpoch() !== epochAtStart) {
        return { ok: false, status: 401 };
      }

      if (!response.ok) {
        return { ok: false, status: response.status };
      }

      const data = (await response.json()) as {
        accessToken?: string;
        user?: unknown;
      };
      if (typeof data.accessToken !== "string" || !data.accessToken) {
        return { ok: false, status: 401 };
      }

      if (getSessionEpoch() !== epochAtStart) {
        return { ok: false, status: 401 };
      }

      setAccessToken(data.accessToken);
      return { ok: true, accessToken: data.accessToken, user: data.user };
    };

    let result = await attempt();
    if (!result.ok && result.status === 401) {
      await new Promise((r) => setTimeout(r, 150));
      if (getSessionEpoch() !== epochAtStart) {
        return { ok: false, status: 401 };
      }
      result = await attempt();
    }
    return result;
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

function emitSessionRevoked(): void {
  clearAccessToken();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SESSION_REVOKED_EVENT));
    window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    anonymous = false,
    credentials = "include",
    cookieAuth = false,
    skipRefresh = false,
  } = options;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (cookieAuth) {
    headers[SOMA_REQUESTED_WITH_HEADER] = SOMA_REQUESTED_WITH;
  }

  if (!anonymous) {
    const token = getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(apiUrl(path), {
    method,
    headers,
    credentials,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const canRefresh =
    response.status === 401 &&
    !anonymous &&
    !skipRefresh &&
    !isAuthMutationPath(path) &&
    !cookieAuth;

  if (canRefresh) {
    let refreshed: RefreshResult;
    try {
      refreshed = await refreshAccessSession();
    } catch (err) {
      // Transient network / API outage during refresh: keep the in-memory
      // session and surface the transport error (do not treat as logout).
      throw err;
    }
    if (refreshed.ok) {
      return apiRequest<T>(path, { ...options, skipRefresh: true });
    }
    // Only end the session when refresh itself failed (expired cookie / revoke).
    if (refreshed.status === 401 || refreshed.status === 403) {
      emitSessionRevoked();
    }
    throw await parseError(response);
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

/** @deprecated Use getAccessToken — kept for callers migrating off localStorage. */
export function getStoredToken(): string | null {
  return getAccessToken();
}

/** @deprecated Use setAccessToken. */
export function setStoredToken(token: string): void {
  setAccessToken(token);
}

/** @deprecated Use clearAccessToken + bumpSessionEpoch for logout. */
export function clearStoredToken(): void {
  clearAccessToken();
}

export function invalidateLocalSession(): void {
  bumpSessionEpoch();
}

export { getAccessToken, setAccessToken, clearAccessToken, bumpSessionEpoch };
