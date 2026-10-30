import type { BiologicalSex } from "@soma/shared-types";

/**
 * Authenticated user as returned by the backend.
 * Mirrors the shape of `/auth/me` and the `user` field of
 * `/auth/login` and `/auth/register` responses.
 */
export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  biologicalSex: BiologicalSex;
  birthYear: number;
  weightKg: number | null;
}

/**
 * Response from `/auth/login` and `/auth/register`.
 */
export interface AuthResponse {
  accessToken: string;
  user: Pick<AuthUser, "id" | "email" | "displayName">;
}

/**
 * Credentials for `/auth/login`.
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Payload for `/auth/register`.
 */
export interface RegisterCredentials {
  email: string;
  password: string;
  displayName: string;
  biologicalSex: BiologicalSex;
  birthYear: number;
  weightKg?: number;
  /** Closed-beta invite; omitted in open registration mode. */
  inviteToken?: string;
  acceptedTerms: boolean;
  termsVersion: string;
  acceptedPrivacyNotice: boolean;
  privacyNoticeVersion: string;
  acceptedSpecialCategoryProcessing: boolean;
  specialCategoryProcessingVersion: string;
}

/** Bootstrap / session lifecycle for the SPA. */
export type AuthStatus = "checking" | "authenticated" | "anonymous";

/**
 * State exposed by the AuthContext.
 */
export interface AuthState {
  user: AuthUser | null;
  /** True while status === "checking" (refresh bootstrap in flight). */
  loading: boolean;
  status: AuthStatus;
  error: string | null;
  /** Stable notice key when a session becomes irrecoverable (e.g. session_expired). */
  sessionNotice: string | null;
  /** Whether an access JWT is currently held in memory (not persisted). */
  hasAccessToken: boolean;
}
