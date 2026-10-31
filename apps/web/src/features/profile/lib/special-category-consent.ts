import { ApiError } from "../../auth/client/api.js";

export const AUTH_SPECIAL_CATEGORY_REQUIRED = "AUTH_SPECIAL_CATEGORY_REQUIRED";
export const AUTH_SPECIAL_CATEGORY_WITHDRAWN = "AUTH_SPECIAL_CATEGORY_WITHDRAWN";
export const AUTH_ACCEPTANCE_REQUIRED = "AUTH_ACCEPTANCE_REQUIRED";

export type SpecialCategoryProfileFlags = {
  specialCategoryConsentActive?: boolean;
  specialCategoryConsentWithdrawn?: boolean;
} | null | undefined;

export function isSpecialCategoryConsentActive(
  profile: SpecialCategoryProfileFlags,
): boolean {
  return profile?.specialCategoryConsentActive === true;
}

export function isSpecialCategoryConsentWithdrawn(
  profile: SpecialCategoryProfileFlags,
): boolean {
  return profile?.specialCategoryConsentWithdrawn === true;
}

export function needsSpecialCategoryConsent(
  profile: SpecialCategoryProfileFlags,
): boolean {
  return !isSpecialCategoryConsentActive(profile);
}

export type SpecialCategoryClientErrorKind =
  | "network"
  | "version"
  | "required"
  | "withdrawn"
  | "failed";

export function specialCategoryClientErrorKind(
  error: unknown,
): SpecialCategoryClientErrorKind {
  if (!(error instanceof ApiError)) {
    return "network";
  }
  if (
    error.code === AUTH_ACCEPTANCE_REQUIRED ||
    (error.status === 400 && error.code === AUTH_ACCEPTANCE_REQUIRED)
  ) {
    return "version";
  }
  if (error.code === AUTH_SPECIAL_CATEGORY_REQUIRED) {
    return "required";
  }
  if (error.code === AUTH_SPECIAL_CATEGORY_WITHDRAWN) {
    return "withdrawn";
  }
  if (error.status === 400) {
    return "version";
  }
  return "failed";
}

/** User-facing account.contextualConsent key. Never returns API codes. */
export function specialCategoryGrantMessageKey(
  error: unknown,
): "network" | "version" | "failed" {
  const kind = specialCategoryClientErrorKind(error);
  if (kind === "network") return "network";
  if (kind === "version") return "version";
  return "failed";
}

export function isSpecialCategoryWriteBlocked(error: unknown): boolean {
  const kind = specialCategoryClientErrorKind(error);
  return kind === "required" || kind === "withdrawn";
}
