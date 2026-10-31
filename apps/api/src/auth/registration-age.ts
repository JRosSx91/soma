import { evaluateRegistrationBirthDate } from "@soma/shared-types";
import { CodedBadRequestException } from "../common/exceptions/coded-exception.js";

export const AUTH_AGE_RESTRICTED_CODE = "AUTH_AGE_RESTRICTED";
export const AUTH_AGE_RESTRICTED_MESSAGE =
  "Registration is limited to people aged 18 or over";

export const AUTH_BIRTH_DATE_INVALID_CODE = "AUTH_BIRTH_DATE_INVALID";
export const AUTH_BIRTH_DATE_INVALID_MESSAGE = "Birth date is invalid";

export function assertEligibleRegistrationAge(birthDate: string): number {
  const result = evaluateRegistrationBirthDate(birthDate);
  if (!result.ok && result.reason === "underage") {
    throw new CodedBadRequestException(
      AUTH_AGE_RESTRICTED_CODE,
      AUTH_AGE_RESTRICTED_MESSAGE,
    );
  }
  if (!result.ok) {
    throw new CodedBadRequestException(
      AUTH_BIRTH_DATE_INVALID_CODE,
      AUTH_BIRTH_DATE_INVALID_MESSAGE,
    );
  }
  return result.birthYear;
}
