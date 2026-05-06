import type { TFunction } from 'i18next';
import { ApiError } from '../client/api.js';

/**
 * Maps backend error codes to i18n translation keys.
 *
 * The backend emits stable codes (e.g. AUTH_INVALID_CREDENTIALS)
 * along with English messages. This map converts those codes into
 * keys against the `auth` namespace so the user sees the message
 * in their active language.
 *
 * If the error has no code or its code is not in the map, falls
 * back to the provided fallback key.
 */
const ERROR_CODE_TO_KEY: Record<string, string> = {
  AUTH_INVALID_CREDENTIALS: 'errors.invalidCredentials',
  AUTH_EMAIL_EXISTS: 'errors.emailAlreadyRegistered',
  AUTH_USER_NOT_FOUND: 'errors.userNotFound',
  PROFILE_USER_NOT_FOUND: 'errors.userNotFound',
};

export function translateAuthError(
  error: unknown,
  t: TFunction,
  fallbackKey: string,
): string {
  if (error instanceof ApiError && error.code) {
    const key = ERROR_CODE_TO_KEY[error.code];
    if (key) {
      return t(key);
    }
  }
  return t(fallbackKey);
}