import assert from "node:assert/strict";
import { test } from "node:test";
import { ApiError } from "../../auth/client/api.js";
import {
  AUTH_ACCEPTANCE_REQUIRED,
  AUTH_SPECIAL_CATEGORY_REQUIRED,
  AUTH_SPECIAL_CATEGORY_WITHDRAWN,
  isSpecialCategoryConsentActive,
  isSpecialCategoryConsentWithdrawn,
  isSpecialCategoryWriteBlocked,
  needsSpecialCategoryConsent,
  specialCategoryClientErrorKind,
  specialCategoryGrantMessageKey,
} from "./special-category-consent.js";

test("legacy grant is treated as active", () => {
  assert.equal(
    isSpecialCategoryConsentActive({ specialCategoryConsentActive: true }),
    true,
  );
  assert.equal(
    needsSpecialCategoryConsent({ specialCategoryConsentActive: true }),
    false,
  );
});

test("new accounts without grant need consent", () => {
  assert.equal(
    needsSpecialCategoryConsent({
      specialCategoryConsentActive: false,
      specialCategoryConsentWithdrawn: false,
    }),
    true,
  );
  assert.equal(needsSpecialCategoryConsent(null), true);
});

test("withdrawn accounts need a new grant and are not active", () => {
  const profile = {
    specialCategoryConsentActive: false,
    specialCategoryConsentWithdrawn: true,
  };
  assert.equal(isSpecialCategoryConsentActive(profile), false);
  assert.equal(isSpecialCategoryConsentWithdrawn(profile), true);
  assert.equal(needsSpecialCategoryConsent(profile), true);
});

test("maps grant and write errors without exposing API codes", () => {
  assert.equal(specialCategoryClientErrorKind(new TypeError("fetch")), "network");
  assert.equal(
    specialCategoryGrantMessageKey(new TypeError("failed to fetch")),
    "network",
  );
  assert.equal(
    specialCategoryClientErrorKind(
      new ApiError(400, "bad", AUTH_ACCEPTANCE_REQUIRED),
    ),
    "version",
  );
  assert.equal(
    specialCategoryGrantMessageKey(
      new ApiError(400, "bad", AUTH_ACCEPTANCE_REQUIRED),
    ),
    "version",
  );
  assert.equal(
    specialCategoryClientErrorKind(
      new ApiError(403, "need", AUTH_SPECIAL_CATEGORY_REQUIRED),
    ),
    "required",
  );
  assert.equal(
    specialCategoryClientErrorKind(
      new ApiError(403, "gone", AUTH_SPECIAL_CATEGORY_WITHDRAWN),
    ),
    "withdrawn",
  );
  assert.equal(
    isSpecialCategoryWriteBlocked(
      new ApiError(403, AUTH_SPECIAL_CATEGORY_REQUIRED, AUTH_SPECIAL_CATEGORY_REQUIRED),
    ),
    true,
  );
  assert.equal(
    specialCategoryGrantMessageKey(
      new ApiError(403, AUTH_SPECIAL_CATEGORY_REQUIRED, AUTH_SPECIAL_CATEGORY_REQUIRED),
    ),
    "failed",
  );
});
