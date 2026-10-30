import assert from "node:assert/strict";
import { test } from "node:test";
import {
  LEGAL_NOTICE_STATUS,
  LEGAL_PRIVACY_VERSION,
  LEGAL_SPECIAL_CATEGORY_VERSION,
  LEGAL_TERMS_VERSION,
  currentRegistrationAcceptanceFields,
  isCurrentRegistrationAcceptance,
  isLegalNoticePublished,
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
