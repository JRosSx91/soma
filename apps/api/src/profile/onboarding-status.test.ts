import assert from "node:assert/strict";
import { test } from "node:test";
import { OnboardingStatus } from "@prisma/client";
import { isOnboardingTransitionAllowed } from "./onboarding-status.js";

test("allows pending → skipped and pending → completed", () => {
  assert.equal(
    isOnboardingTransitionAllowed(
      OnboardingStatus.pending,
      OnboardingStatus.skipped,
    ),
    true,
  );
  assert.equal(
    isOnboardingTransitionAllowed(
      OnboardingStatus.pending,
      OnboardingStatus.completed,
    ),
    true,
  );
});

test("allows skipped → completed and completed → skipped", () => {
  assert.equal(
    isOnboardingTransitionAllowed(
      OnboardingStatus.skipped,
      OnboardingStatus.completed,
    ),
    true,
  );
  assert.equal(
    isOnboardingTransitionAllowed(
      OnboardingStatus.completed,
      OnboardingStatus.skipped,
    ),
    true,
  );
});

test("allows idempotent same → same", () => {
  for (const status of Object.values(OnboardingStatus)) {
    assert.equal(isOnboardingTransitionAllowed(status, status), true);
  }
});

test("rejects return to pending and skipped → pending / completed → pending", () => {
  assert.equal(
    isOnboardingTransitionAllowed(
      OnboardingStatus.skipped,
      OnboardingStatus.pending,
    ),
    false,
  );
  assert.equal(
    isOnboardingTransitionAllowed(
      OnboardingStatus.completed,
      OnboardingStatus.pending,
    ),
    false,
  );
});

test("rejects skipped → pending and pending is not reachable from completed", () => {
  assert.equal(
    isOnboardingTransitionAllowed(
      OnboardingStatus.skipped,
      OnboardingStatus.pending,
    ),
    false,
  );
});
