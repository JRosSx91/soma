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
