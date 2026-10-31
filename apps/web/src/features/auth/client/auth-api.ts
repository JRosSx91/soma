import {
  apiRequest,
  bumpSessionEpoch,
  clearAccessToken,
  refreshAccessSession,
  setAccessToken,
} from "./api.js";
import { clearLegacyAuthStorage } from "./access-token.js";
import type {
  AuthResponse,
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
} from "../types.js";

export async function login(
  credentials: LoginCredentials,
): Promise<AuthResponse> {
  clearLegacyAuthStorage();
  const response = await apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: credentials,
    anonymous: true,
    credentials: "include",
    skipRefresh: true,
  });
  setAccessToken(response.accessToken);
  return response;
}

export async function register(
  credentials: RegisterCredentials,
): Promise<AuthResponse> {
  clearLegacyAuthStorage();
  const body: RegisterCredentials = {
    email: credentials.email,
    password: credentials.password,
    displayName: credentials.displayName,
    biologicalSex: credentials.biologicalSex,
    birthYear: credentials.birthYear,
    acceptedTerms: credentials.acceptedTerms,
    termsVersion: credentials.termsVersion,
    acceptedPrivacyNotice: credentials.acceptedPrivacyNotice,
    privacyNoticeVersion: credentials.privacyNoticeVersion,
  };
  if (credentials.weightKg !== undefined) {
    body.weightKg = credentials.weightKg;
  }
  if (credentials.inviteToken) {
    body.inviteToken = credentials.inviteToken;
  }
  const response = await apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body,
    anonymous: true,
    credentials: "include",
    skipRefresh: true,
  });
  setAccessToken(response.accessToken);
  return response;
}

/**
 * Restore session via HttpOnly refresh cookie.
 * Returns the access token + partial user from the backend, or null.
 */
export async function restoreSession(): Promise<AuthResponse | null> {
  clearLegacyAuthStorage();
  try {
    const result = await refreshAccessSession();
    if (!result.ok) return null;
    return {
      accessToken: result.accessToken,
      user: result.user as AuthResponse["user"],
    };
  } catch {
    // Network / API unavailable during bootstrap → anonymous, not a hard crash.
    clearAccessToken();
    return null;
  }
}

export interface LogoutResult {
  /** True when POST /auth/logout succeeded. */
  remoteRevoked: boolean;
}

/**
 * Revokes the refresh family on the server (best effort) and clears memory.
 * Access JWTs already issued remain valid until expiry (no denylist).
 */
export async function logout(): Promise<LogoutResult> {
  bumpSessionEpoch();
  clearLegacyAuthStorage();

  try {
    await apiRequest<{ ok: boolean }>("/auth/logout", {
      method: "POST",
      anonymous: true,
      credentials: "include",
      cookieAuth: true,
      skipRefresh: true,
    });
    return { remoteRevoked: true };
  } catch {
    clearAccessToken();
    return { remoteRevoked: false };
  }
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    return await apiRequest<AuthUser>("/auth/me", { skipRefresh: false });
  } catch {
    return null;
  }
}
