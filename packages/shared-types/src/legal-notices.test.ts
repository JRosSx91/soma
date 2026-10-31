import assert from "node:assert/strict";
import { test } from "node:test";
import {
  LEGAL_NOTICE_STATUS,
  LEGAL_PRIVACY_VERSION,
  LEGAL_PRIVACY_VERSION_RELEASE,
  LEGAL_SPECIAL_CATEGORY_VERSION,
  LEGAL_SPECIAL_CATEGORY_VERSION_RELEASE,
  LEGAL_SPECIAL_CATEGORY_WITHDRAWAL_VERSION,
  LEGAL_ADULT_AGE_VERSION,
  LEGAL_ADULT_AGE_VERSION_RELEASE,
  LEGAL_TERMS_VERSION,
  LEGAL_TERMS_VERSION_RELEASE,
  SPECIAL_CATEGORY_PROCESSING_PURPOSE,
  SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE,
  currentRegistrationAcceptanceFields,
  currentSpecialCategoryGrantFields,
  isCurrentRegistrationAcceptance,
  isCurrentSpecialCategoryGrant,
  isLegalNoticePublished,
  isSpecialCategoryConsentActive,
  isSpecialCategoryProcessingWithdrawn,
  registrationAcceptanceRecords,
  specialCategoryConsentStatus,
} from "./legal-notices.js";

test("legal notices remain draft until explicitly published", () => {
  assert.equal(LEGAL_NOTICE_STATUS, "draft");
  assert.equal(isLegalNoticePublished(), false);
  assert.equal(LEGAL_TERMS_VERSION.startsWith("draft-"), true);
  assert.equal(LEGAL_PRIVACY_VERSION.startsWith("draft-"), true);
  assert.equal(LEGAL_SPECIAL_CATEGORY_VERSION.startsWith("draft-"), true);
  assert.equal(LEGAL_ADULT_AGE_VERSION.startsWith("draft-"), true);
  assert.equal(LEGAL_TERMS_VERSION_RELEASE, "2026-10-31.2");
  assert.equal(LEGAL_PRIVACY_VERSION_RELEASE, "2026-10-31.2");
  assert.equal(LEGAL_ADULT_AGE_VERSION_RELEASE, "2026-10-31");
  assert.equal(LEGAL_SPECIAL_CATEGORY_VERSION_RELEASE, "2026-10-30");
  assert.notEqual(LEGAL_TERMS_VERSION, LEGAL_TERMS_VERSION_RELEASE);
  assert.equal(currentRegistrationAcceptanceFields().termsVersion, LEGAL_TERMS_VERSION);
});

test("current acceptance fields match draft versions and require true flags", () => {
  const fields = currentRegistrationAcceptanceFields();
  assert.equal(isCurrentRegistrationAcceptance(fields), true);
  assert.equal("acceptedSpecialCategoryProcessing" in fields, false);
  assert.equal("specialCategoryProcessingVersion" in fields, false);
  assert.equal(fields.acceptedAdultAge, true);
  assert.equal(
    isCurrentRegistrationAcceptance({ ...fields, acceptedAdultAge: false }),
    false,
  );
  assert.equal(
    isCurrentRegistrationAcceptance({ ...fields, acceptedTerms: false }),
    false,
  );
  assert.equal(
    isCurrentRegistrationAcceptance({ ...fields, termsVersion: "other" }),
    false,
  );
  assert.equal(isCurrentRegistrationAcceptance({}), false);
  assert.equal(
    isCurrentSpecialCategoryGrant(currentSpecialCategoryGrantFields()),
    true,
  );
  assert.equal(
    isCurrentSpecialCategoryGrant({
      acceptedSpecialCategoryProcessing: false,
      specialCategoryProcessingVersion: LEGAL_SPECIAL_CATEGORY_VERSION,
    }),
    false,
  );
});

test("special-category consent is inactive without a grant", () => {
  assert.equal(isSpecialCategoryConsentActive([]), false);
  assert.equal(isSpecialCategoryConsentActive(undefined), false);
  assert.equal(specialCategoryConsentStatus([]), "never_granted");
  assert.equal(isSpecialCategoryProcessingWithdrawn([]), false);
  assert.equal(
    isSpecialCategoryConsentActive([
      {
        purpose: SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE,
        acceptedAt: new Date("2026-10-30T12:00:00.000Z"),
      },
    ]),
    false,
  );
  assert.equal(
    isSpecialCategoryProcessingWithdrawn([
      {
        purpose: SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE,
        acceptedAt: new Date("2026-10-30T12:00:00.000Z"),
      },
    ]),
    true,
  );
});

test("a withdrawal is never treated as a grant", () => {
  const grantAt = new Date("2026-10-30T10:00:00.000Z");
  const withdrawnAt = new Date("2026-10-30T11:00:00.000Z");
  assert.equal(
    isSpecialCategoryConsentActive([
      {
        purpose: SPECIAL_CATEGORY_PROCESSING_PURPOSE,
        acceptedAt: grantAt,
      },
    ]),
    true,
  );
  assert.equal(
    isSpecialCategoryConsentActive([
      {
        purpose: SPECIAL_CATEGORY_PROCESSING_PURPOSE,
        acceptedAt: grantAt,
      },
      {
        purpose: SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE,
        acceptedAt: withdrawnAt,
      },
    ]),
    false,
  );
  assert.equal(
    isSpecialCategoryConsentActive([
      {
        purpose: SPECIAL_CATEGORY_PROCESSING_PURPOSE,
        acceptedAt: grantAt,
      },
      {
        purpose: SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE,
        acceptedAt: grantAt,
      },
    ]),
    false,
  );
  assert.equal(
    isSpecialCategoryProcessingWithdrawn([
      {
        purpose: SPECIAL_CATEGORY_PROCESSING_PURPOSE,
        acceptedAt: grantAt,
      },
      {
        purpose: SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE,
        acceptedAt: withdrawnAt,
      },
    ]),
    true,
  );
  assert.equal(
    specialCategoryConsentStatus([
      {
        purpose: SPECIAL_CATEGORY_PROCESSING_PURPOSE,
        acceptedAt: grantAt,
      },
    ]),
    "active",
  );
  assert.equal(
    specialCategoryConsentStatus([
      {
        purpose: SPECIAL_CATEGORY_PROCESSING_PURPOSE,
        acceptedAt: grantAt,
      },
      {
        purpose: SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE,
        acceptedAt: withdrawnAt,
      },
    ]),
    "withdrawn",
  );
});

test("a later grant can reactivate after a withdrawal", () => {
  assert.equal(
    isSpecialCategoryConsentActive([
      {
        purpose: SPECIAL_CATEGORY_PROCESSING_PURPOSE,
        acceptedAt: new Date("2026-10-30T10:00:00.000Z"),
      },
      {
        purpose: SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE,
        acceptedAt: new Date("2026-10-30T11:00:00.000Z"),
      },
      {
        purpose: SPECIAL_CATEGORY_PROCESSING_PURPOSE,
        acceptedAt: new Date("2026-10-30T12:00:00.000Z"),
      },
    ]),
    true,
  );
  assert.equal(LEGAL_SPECIAL_CATEGORY_WITHDRAWAL_VERSION.startsWith("draft-"), true);
  assert.notEqual(
    SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE,
    SPECIAL_CATEGORY_PROCESSING_PURPOSE,
  );
});

test("persisted records do not include IP or extra client metadata", () => {
  const at = new Date("2026-10-30T08:00:00.000Z");
  const records = registrationAcceptanceRecords(at);
  assert.equal(records.length, 3);
  assert.deepEqual(
    records.map((row) => row.purpose).sort(),
    ["adult_age_declaration", "privacy_notice", "terms_of_use"],
  );
  assert.equal(
    records.some((row) => row.purpose === "special_category_processing"),
    false,
  );
  for (const row of records) {
    assert.equal("ip" in row, false);
    assert.equal("userAgent" in row, false);
    assert.equal(row.acceptedAt.toISOString(), at.toISOString());
    assert.equal(row.documentVersion.startsWith("draft-"), true);
  }
});
