import {
  currentRegistrationAcceptanceFields,
  evaluateRegistrationBirthDate,
} from "@soma/shared-types";
import type { RegisterCredentials } from "../types.js";
import {
  isPasswordLongEnough,
  passwordsMatch,
} from "./password-reset-validation.js";

export type RegisterPasswordCheck =
  | { ok: true; credentials: RegisterCredentials }
  | { ok: false; messageKey: string };

/**
 * Client-side register checks. Confirm is never copied into the
 * API payload. Length matches RegisterDto (min 8). Age is also checked
 * on the server.
 */
export function prepareRegisterCredentials(
  input: RegisterCredentials & {
    confirmPassword: string;
    acceptedTerms: boolean;
    acceptedPrivacyNotice: boolean;
    acceptedAdultAge: boolean;
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
    !input.acceptedAdultAge
  ) {
    return { ok: false, messageKey: "register.acceptRequired" };
  }
  const age = evaluateRegistrationBirthDate(input.birthDate);
  if (!age.ok && age.reason === "underage") {
    return { ok: false, messageKey: "register.ageRestricted" };
  }
  if (!age.ok) {
    return { ok: false, messageKey: "register.birthDateInvalid" };
  }

  const acceptance = currentRegistrationAcceptanceFields();
  const credentials: RegisterCredentials = {
    email: input.email,
    password: input.password,
    displayName: input.displayName,
    biologicalSex: input.biologicalSex,
    birthDate: input.birthDate,
    acceptedTerms: acceptance.acceptedTerms,
    termsVersion: acceptance.termsVersion,
    acceptedPrivacyNotice: acceptance.acceptedPrivacyNotice,
    privacyNoticeVersion: acceptance.privacyNoticeVersion,
    acceptedAdultAge: acceptance.acceptedAdultAge,
    adultAgeVersion: acceptance.adultAgeVersion,
  };
  if (input.weightKg !== undefined) {
    credentials.weightKg = input.weightKg;
  }
  if (input.inviteToken) {
    credentials.inviteToken = input.inviteToken;
  }
  return { ok: true, credentials };
}
