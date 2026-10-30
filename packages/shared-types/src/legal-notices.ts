/**
 * Draft legal-notice contract for closed-beta preparation.
 *
 * LEGAL_NOTICE_STATUS stays "draft" until identity, legal bases, retention,
 * processors, transfers and rights procedures are confirmed. Changing this
 * to "published" is a product decision, not a code default.
 *
 * Affirmative registration checkboxes persist evidence of an action on these
 * draft versions. They are not a claim of GDPR (or other) compliance.
 *
 * PENDING LEGAL: whether special-category processing must be accepted at
 * registration or only when the user first records substance/journal data.
 * Required here so the mechanism exists before beta opens; the legal basis
 * is not defined in this module.
 */
export const LEGAL_NOTICE_STATUS = "draft" as const;
export type LegalNoticeStatus = "draft" | "published";

export const LEGAL_TERMS_VERSION = "draft-2026-10-30";
export const LEGAL_PRIVACY_VERSION = "draft-2026-10-30";
export const LEGAL_SPECIAL_CATEGORY_VERSION = "draft-2026-10-30";

export const REGISTRATION_ACCEPTANCE_PURPOSES = [
  "terms_of_use",
  "privacy_notice",
  "special_category_processing",
] as const;

export type RegistrationAcceptancePurpose =
  (typeof REGISTRATION_ACCEPTANCE_PURPOSES)[number];

/** Grant recorded at registration. Not a withdrawal. */
export const SPECIAL_CATEGORY_PROCESSING_PURPOSE =
  "special_category_processing" as const;

/**
 * Explicit withdrawal evidence. Never treated as a grant.
 * Distinct purpose so @@unique([userId, purpose]) can hold both rows
 * without a schema migration.
 */
export const SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE =
  "special_category_processing_withdrawal" as const;

export const LEGAL_SPECIAL_CATEGORY_WITHDRAWAL_VERSION = "draft-2026-10-30";

export type SpecialCategoryConsentRecord = {
  purpose: string;
  acceptedAt: Date;
};

/**
 * Active only when a grant exists and is strictly later than any withdrawal.
 * A withdrawal row is never interpreted as consent.
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
 * Absence of any row is not a withdrawal (legacy accounts / tests).
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

export type RegistrationAcceptanceFields = {
  acceptedTerms: boolean;
  termsVersion: string;
  acceptedPrivacyNotice: boolean;
  privacyNoticeVersion: string;
  acceptedSpecialCategoryProcessing: boolean;
  specialCategoryProcessingVersion: string;
};

export function currentRegistrationAcceptanceFields(): RegistrationAcceptanceFields {
  return {
    acceptedTerms: true,
    termsVersion: LEGAL_TERMS_VERSION,
    acceptedPrivacyNotice: true,
    privacyNoticeVersion: LEGAL_PRIVACY_VERSION,
    acceptedSpecialCategoryProcessing: true,
    specialCategoryProcessingVersion: LEGAL_SPECIAL_CATEGORY_VERSION,
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
      purpose: "special_category_processing",
      documentVersion: LEGAL_SPECIAL_CATEGORY_VERSION,
      acceptedAt,
    },
  ];
}
