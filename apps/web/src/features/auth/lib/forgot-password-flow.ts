import {
  classifyPasswordResetError,
  requestPasswordReset,
} from "../client/password-reset-api.js";
import { isValidEmailFormat } from "./password-reset-validation.js";

export type ForgotPasswordOutcome =
  | { status: "ok" }
  | { status: "error"; messageKey: string };

/**
 * Client-side forgot-password flow (validation + API). Used by the page and tests.
 */
export async function runForgotPasswordRequest(
  email: string,
  request: (email: string) => Promise<unknown> = requestPasswordReset,
): Promise<ForgotPasswordOutcome> {
  if (!isValidEmailFormat(email)) {
    return { status: "error", messageKey: "forgotPassword.invalidEmail" };
  }

  try {
    await request(email.trim());
    return { status: "ok" };
  } catch (err) {
    const kind = classifyPasswordResetError(err, "forgot");
    if (kind === "rate_limited") {
      return { status: "error", messageKey: "errors.rateLimited" };
    }
    if (kind === "network") {
      return { status: "error", messageKey: "errors.network" };
    }
    if (kind === "validation") {
      return { status: "error", messageKey: "forgotPassword.invalidEmail" };
    }
    return { status: "error", messageKey: "errors.forgotFailed" };
  }
}
