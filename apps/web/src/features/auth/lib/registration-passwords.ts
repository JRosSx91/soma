import { currentRegistrationAcceptanceFields } from "@soma/shared-types";
import type { RegisterCredentials } from "../types.js";
import {
  isPasswordLongEnough,
  passwordsMatch,
} from "./password-reset-validation.js";

export type RegisterPasswordCheck =
  | { ok: true; credentials: RegisterCredentials }
  | { ok: false; messageKey: string };

/**
 * Client-side register password checks. Confirm is never copied into the
 * API payload. Length matches RegisterDto (min 8).
 */
export function prepareRegisterCredentials(
  input: RegisterCredentials & {
    confirmPassword: string;
    acceptedTerms: boolean;
    acceptedPrivacyNotice: boolean;
    acceptedSpecialCategoryProcessing: boolean;
  },
): RegisterPasswordCheck {
  if (!isPasswordLongEnough(input.password)) {
    return { ok: false, messageKey: "register.passwordTooShort" };
  }
  if (!passwordsMatch(input.password, input.confirmPassword)) {
    return { ok: false, messageKey: "register.passwordMismatch" };
  }
  if (
    !input.acceptedTerms ||
    !input.acceptedPrivacyNotice ||
    !input.acceptedSpecialCategoryProcessing
  ) {
    return { ok: false, messageKey: "register.acceptRequired" };
  }

  const credentials: RegisterCredentials = {
    email: input.email,
    password: input.password,
    displayName: input.displayName,
    biologicalSex: input.biologicalSex,
    birthYear: input.birthYear,
    ...currentRegistrationAcceptanceFields(),
  };
  if (input.weightKg !== undefined) {
    credentials.weightKg = input.weightKg;
  }
  if (input.inviteToken) {
    credentials.inviteToken = input.inviteToken;
  }
  return { ok: true, credentials };
}
