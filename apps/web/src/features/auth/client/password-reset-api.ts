import { apiRequest, ApiError } from "./api.js";

export interface ForgotPasswordResponse {
  ok: true;
  message: string;
}

export interface ResetPasswordResponse {
  ok: true;
}

/**
 * Public password-recovery endpoints.
 * Always anonymous + skipRefresh — never trigger session rotation.
 */
export async function requestPasswordReset(
  email: string,
): Promise<ForgotPasswordResponse> {
  return apiRequest<ForgotPasswordResponse>("/auth/forgot-password", {
    method: "POST",
    body: { email },
    anonymous: true,
    skipRefresh: true,
  });
}

export async function resetPasswordWithToken(
  token: string,
  newPassword: string,
): Promise<ResetPasswordResponse> {
  return apiRequest<ResetPasswordResponse>("/auth/reset-password", {
    method: "POST",
    body: { token, newPassword },
    anonymous: true,
    skipRefresh: true,
  });
}

export type PasswordResetClientErrorKind =
  | "validation"
  | "rate_limited"
  | "network"
  | "invalid_token"
  | "server";

export function classifyPasswordResetError(
  error: unknown,
  endpoint: "forgot" | "reset" = "reset",
): PasswordResetClientErrorKind {
  if (error instanceof TypeError) return "network";
  if (!(error instanceof ApiError)) return "server";
  if (error.status === 429) return "rate_limited";
  if (error.status === 0) return "network";
  if (error.status === 400) {
    return endpoint === "reset" ? "invalid_token" : "validation";
  }
  if (error.status >= 500) return "server";
  return "server";
}
