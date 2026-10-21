import {
  classifyPasswordResetError,
  resetPasswordWithToken,
} from "../client/password-reset-api.js";
import {
  isPasswordLongEnough,
  passwordsMatch,
} from "./password-reset-validation.js";

export type ResetPasswordOutcome =
  | { status: "ok" }
  | { status: "error"; messageKey: string };

/**
 * Client-side reset-password flow (validation + API). Token must already be
 * held in memory — never persisted by this helper.
 */
export async function runResetPasswordRequest(
  token: string | null,
  password: string,
  confirm: string,
  reset: (
    token: string,
    newPassword: string,
  ) => Promise<unknown> = resetPasswordWithToken,
): Promise<ResetPasswordOutcome> {
  if (!token) {
    return { status: "error", messageKey: "resetPassword.missingToken" };
  }
  if (!isPasswordLongEnough(password)) {
    return { status: "error", messageKey: "resetPassword.tooShort" };
  }
  if (!passwordsMatch(password, confirm)) {
    return { status: "error", messageKey: "resetPassword.mismatch" };
  }

  try {
    await reset(token, password);
    return { status: "ok" };
  } catch (err) {
    const kind = classifyPasswordResetError(err, "reset");
    if (kind === "rate_limited") {
      return { status: "error", messageKey: "errors.rateLimited" };
    }
    if (kind === "network") {
      return { status: "error", messageKey: "errors.network" };
    }
    if (kind === "invalid_token") {
      return { status: "error", messageKey: "errors.invalidResetToken" };
    }
    return { status: "error", messageKey: "errors.resetFailed" };
  }
}
