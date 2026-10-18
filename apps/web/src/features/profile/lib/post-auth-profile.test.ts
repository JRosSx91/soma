import assert from "node:assert/strict";
import { test } from "node:test";
import type { UserProfileResponse } from "../hooks/useUserProfile.js";
import { outcomeFromProfileFetch } from "./post-auth-profile.js";

function profile(
  onboardingStatus: UserProfileResponse["onboardingStatus"],
): UserProfileResponse {
  return {
    user: {
      id: "u1",
      email: "a@example.com",
      displayName: "A",
      biologicalSex: "male",
      birthYear: 1990,
      weightKg: null,
    },
    onboardingStatus,
    usages: [],
  };
}

test("outcomeFromProfileFetch: pending → invite gate", () => {
  assert.deepEqual(
    outcomeFromProfileFetch({ ok: true, profile: profile("pending") }),
    { kind: "pending" },
  );
});

test("outcomeFromProfileFetch: skipped/completed → app", () => {
  assert.deepEqual(
    outcomeFromProfileFetch({ ok: true, profile: profile("skipped") }),
    { kind: "app", status: "skipped" },
  );
  assert.deepEqual(
    outcomeFromProfileFetch({ ok: true, profile: profile("completed") }),
    { kind: "app", status: "completed" },
  );
});

test("outcomeFromProfileFetch: failed GET → unknown (no invented status)", () => {
  assert.deepEqual(outcomeFromProfileFetch({ ok: false }), { kind: "unknown" });
});
