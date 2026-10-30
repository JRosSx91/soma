import assert from "node:assert/strict";
import { test } from "node:test";
import {
  LEGAL_NOTICE_STATUS,
  LEGAL_PRIVACY_VERSION,
  LEGAL_SPECIAL_CATEGORY_VERSION,
  LEGAL_SPECIAL_CATEGORY_WITHDRAWAL_VERSION,
  LEGAL_TERMS_VERSION,
  SPECIAL_CATEGORY_PROCESSING_PURPOSE,
  SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE,
  currentRegistrationAcceptanceFields,
  isCurrentRegistrationAcceptance,
  isLegalNoticePublished,
  isSpecialCategoryConsentActive,
  isSpecialCategoryProcessingWithdrawn,
  registrationAcceptanceRecords,
} from "./legal-notices.js";

test("legal notices remain draft until explicitly published", () => {
  assert.equal(LEGAL_NOTICE_STATUS, "draft");
  assert.equal(isLegalNoticePublished(), false);
  assert.equal(LEGAL_TERMS_VERSION.startsWith("draft-"), true);
  assert.equal(LEGAL_PRIVACY_VERSION.startsWith("draft-"), true);
  assert.equal(LEGAL_SPECIAL_CATEGORY_VERSION.startsWith("draft-"), true);
});

test("current acceptance fields match draft versions and require true flags", () => {
  const fields = currentRegistrationAcceptanceFields();
  assert.equal(isCurrentRegistrationAcceptance(fields), true);
  assert.equal(
    isCurrentRegistrationAcceptance({ ...fields, acceptedTerms: false }),
    false,
  );
  assert.equal(
    isCurrentRegistrationAcceptance({ ...fields, termsVersion: "other" }),
    false,
  );
  assert.equal(isCurrentRegistrationAcceptance({}), false);
});

test("special-category consent is inactive without a grant", () => {
  assert.equal(isSpecialCategoryConsentActive([]), false);
  assert.equal(isSpecialCategoryConsentActive(undefined), false);
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
  for (const row of records) {
    assert.equal("ip" in row, false);
    assert.equal("userAgent" in row, false);
    assert.equal(row.acceptedAt.toISOString(), at.toISOString());
    assert.equal(row.documentVersion.startsWith("draft-"), true);
  }
});
