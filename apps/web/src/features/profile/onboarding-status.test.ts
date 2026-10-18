import assert from "node:assert/strict";
import { test } from "node:test";
import { destinationAfterLogin, isOnboardingStatus } from "./onboarding-status.js";

test("destinationAfterLogin: pending invites; skipped/completed go to app", () => {
  assert.equal(destinationAfterLogin("pending"), "invite");
  assert.equal(destinationAfterLogin("skipped"), "app");
  assert.equal(destinationAfterLogin("completed"), "app");
});

test("isOnboardingStatus rejects unknown values", () => {
  assert.equal(isOnboardingStatus("pending"), true);
  assert.equal(isOnboardingStatus("nope"), false);
  assert.equal(isOnboardingStatus(null), false);
});
