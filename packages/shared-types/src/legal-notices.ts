/**
 * Draft legal-notice contract for public-beta preparation.
 *
 * LEGAL_NOTICE_STATUS stays "draft" until identity, legal bases, retention,
 * processors, transfers and rights procedures are confirmed. Changing this
 * to "published" is a product decision, not a code default. Production
 * registration stays blocked while the status is draft.
 *
 * Affirmative registration checkboxes persist evidence of an action on these
 * draft versions. They are not a claim of GDPR (or other) compliance.
 *
 * Special-category processing is not accepted at registration. A later
 * explicit grant (purpose special_category_processing) is required before
 * writing substance, journal or derived health data.
 */
export const LEGAL_NOTICE_STATUS = "draft" as const;
export type LegalNoticeStatus = "draft" | "published";

/** Active identifiers persisted on registration. Still draft until publication. */
export const LEGAL_TERMS_VERSION = "draft-2026-10-31.2";
export const LEGAL_PRIVACY_VERSION = "draft-2026-10-31.2";
export const LEGAL_ADULT_AGE_VERSION = "draft-2026-10-31";
export const LEGAL_SPECIAL_CATEGORY_VERSION = "draft-2026-10-30";

/**
 * Proposed identifiers without the draft- prefix. Not used for acceptance
 * until LEGAL_NOTICE_STATUS is published and these constants replace the
 * active versions above. Keep the current draft strings so existing evidence
 * stays distinguishable from a later published set.
 */
export const LEGAL_TERMS_VERSION_RELEASE = "2026-10-31.2";
export const LEGAL_PRIVACY_VERSION_RELEASE = "2026-10-31.2";
export const LEGAL_ADULT_AGE_VERSION_RELEASE = "2026-10-31";
export const LEGAL_SPECIAL_CATEGORY_VERSION_RELEASE = "2026-10-30";

export const REGISTRATION_ACCEPTANCE_PURPOSES = [
  "terms_of_use",
  "privacy_notice",
  "adult_age_declaration",
  "special_category_processing",
] as const;

export type RegistrationAcceptancePurpose =
  (typeof REGISTRATION_ACCEPTANCE_PURPOSES)[number];

/** Grant recorded when the user explicitly consents. Not a withdrawal. */
export const SPECIAL_CATEGORY_PROCESSING_PURPOSE =
  "special_category_processing" as const;

/**
 * Explicit withdrawal evidence. Never treated as a grant.
 * Distinct purpose so grant and withdrawal events can coexist in history.
 */
export const SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE =
  "special_category_processing_withdrawal" as const;

export const LEGAL_SPECIAL_CATEGORY_WITHDRAWAL_VERSION = "draft-2026-10-30";

export type SpecialCategoryConsentRecord = {
  purpose: string;
  acceptedAt: Date;
  documentVersion?: string;
};

export type SpecialCategoryConsentStatus =
  | "never_granted"
  | "active"
  | "withdrawn";

/**
 * Active only when a grant exists and is strictly later than any withdrawal.
 * Equal timestamps are withdrawn: a withdrawal is never treated as a grant.
 */
export function isSpecialCategoryConsentActive(
  records: readonly SpecialCategoryConsentRecord[] | null | undefined,
): boolean {
  if (!records || records.length === 0) return false;

  let grantAt: number | null = null;
  let withdrawnAt: number | null = null;
  for (const row of records) {
    const at = row.acceptedAt.getTime();
    if (row.purpose === SPECIAL_CATEGORY_PROCESSING_PURPOSE) {
      if (grantAt === null || at > grantAt) grantAt = at;
    }
    if (row.purpose === SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE) {
      if (withdrawnAt === null || at > withdrawnAt) withdrawnAt = at;
    }
  }
  if (grantAt === null) return false;
  if (withdrawnAt === null) return true;
  return grantAt > withdrawnAt;
}

/**
 * True only when a withdrawal row is the latest special-category event.
 * Absence of any row is not a withdrawal.
 */
export function isSpecialCategoryProcessingWithdrawn(
  records: readonly SpecialCategoryConsentRecord[] | null | undefined,
): boolean {
  if (!records || records.length === 0) return false;
  const hasWithdrawal = records.some(
    (row) => row.purpose === SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE,
  );
  if (!hasWithdrawal) return false;
  return !isSpecialCategoryConsentActive(records);
}

export function specialCategoryConsentStatus(
  records: readonly SpecialCategoryConsentRecord[] | null | undefined,
): SpecialCategoryConsentStatus {
  if (isSpecialCategoryConsentActive(records)) return "active";
  if (isSpecialCategoryProcessingWithdrawn(records)) return "withdrawn";
  return "never_granted";
}

export type RegistrationAcceptanceFields = {
  acceptedTerms: boolean;
  termsVersion: string;
  acceptedPrivacyNotice: boolean;
  privacyNoticeVersion: string;
  acceptedAdultAge: boolean;
  adultAgeVersion: string;
};

/** Civil date used by register tests. Always 18+ relative to the 2026 beta. */
export const REGISTER_TEST_BIRTH_DATE = "1990-06-15";

export function currentRegistrationAcceptanceFields(): RegistrationAcceptanceFields {
  return {
    acceptedTerms: true,
    termsVersion: LEGAL_TERMS_VERSION,
    acceptedPrivacyNotice: true,
    privacyNoticeVersion: LEGAL_PRIVACY_VERSION,
    acceptedAdultAge: true,
    adultAgeVersion: LEGAL_ADULT_AGE_VERSION,
  };
}

export function currentRegisterClientFields(): RegistrationAcceptanceFields & {
  birthDate: string;
} {
  return {
    birthDate: REGISTER_TEST_BIRTH_DATE,
    ...currentRegistrationAcceptanceFields(),
  };
}

export function isCurrentRegistrationAcceptance(
  input: Partial<RegistrationAcceptanceFields> | null | undefined,
): input is RegistrationAcceptanceFields {
  if (!input) return false;
  return (
    input.acceptedTerms === true &&
    input.termsVersion === LEGAL_TERMS_VERSION &&
    input.acceptedPrivacyNotice === true &&
    input.privacyNoticeVersion === LEGAL_PRIVACY_VERSION &&
    input.acceptedAdultAge === true &&
    input.adultAgeVersion === LEGAL_ADULT_AGE_VERSION
  );
}

export type SpecialCategoryGrantFields = {
  acceptedSpecialCategoryProcessing: boolean;
  specialCategoryProcessingVersion: string;
};

export function currentSpecialCategoryGrantFields(): SpecialCategoryGrantFields {
  return {
    acceptedSpecialCategoryProcessing: true,
    specialCategoryProcessingVersion: LEGAL_SPECIAL_CATEGORY_VERSION,
  };
}

export function isCurrentSpecialCategoryGrant(
  input: Partial<SpecialCategoryGrantFields> | null | undefined,
): input is SpecialCategoryGrantFields {
  if (!input) return false;
  return (
    input.acceptedSpecialCategoryProcessing === true &&
    input.specialCategoryProcessingVersion === LEGAL_SPECIAL_CATEGORY_VERSION
  );
}

export function isLegalNoticePublished(
  status: string = LEGAL_NOTICE_STATUS,
): boolean {
  return status === "published";
}

export function registrationAcceptanceRecords(acceptedAt: Date): Array<{
  purpose: RegistrationAcceptancePurpose;
  documentVersion: string;
  acceptedAt: Date;
}> {
  return [
    {
      purpose: "terms_of_use",
      documentVersion: LEGAL_TERMS_VERSION,
      acceptedAt,
    },
    {
      purpose: "privacy_notice",
      documentVersion: LEGAL_PRIVACY_VERSION,
      acceptedAt,
    },
    {
      purpose: "adult_age_declaration",
      documentVersion: LEGAL_ADULT_AGE_VERSION,
      acceptedAt,
    },
  ];
}
