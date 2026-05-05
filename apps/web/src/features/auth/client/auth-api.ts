import { apiRequest, setStoredToken, clearStoredToken } from './api.js';
import type {
  AuthResponse,
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
} from '../types.js';

export async function login(
  credentials: LoginCredentials,
): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: credentials,
    anonymous: true,
  });
  setStoredToken(response.accessToken);
  return response;
}

export async function register(
  credentials: RegisterCredentials,
): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: credentials,
    anonymous: true,
  });
  setStoredToken(response.accessToken);
  return response;
}

export function logout(): void {
  clearStoredToken();
}

/**
 * Validates the stored token by calling `/auth/me`.
 * Used at app load to restore session.
 *
 * Returns null if there is no token, or if the token is invalid
 * (the apiRequest will have already cleared it via the 401 event).
 */
export async function fetchCurrentUser(): Promise<AuthUser | null> {
  return apiRequest<AuthUser>('/auth/me').catch(() => null);
}