import type { BiologicalSex } from '@soma/shared-types';

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
  user: Pick<AuthUser, 'id' | 'email' | 'displayName'>;
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
}

/**
 * State exposed by the AuthContext.
 */
export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}