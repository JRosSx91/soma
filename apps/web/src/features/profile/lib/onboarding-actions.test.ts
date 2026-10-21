import assert from "node:assert/strict";
import { test } from "node:test";
import { ApiError } from "../../auth/client/api.js";
import type { UserProfileResponse } from "../hooks/useUserProfile.js";
import { destinationAfterLogin } from "../onboarding-status.js";
import {
  completeOnboardingStatusOnly,
  completeOnboardingWithUsages,
  parseOnboardingStatusFromProfile,
  skipOnboardingWithoutClearingUsages,
} from "./onboarding-actions.js";

function profile(
  overrides: Partial<UserProfileResponse> & {
    onboardingStatus: UserProfileResponse["onboardingStatus"];
  },
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
    usages: [],
    ...overrides,
  };
}

test("destinationAfterLogin: pending → invite; skipped/completed → app", () => {
  assert.equal(destinationAfterLogin("pending"), "invite");
  assert.equal(destinationAfterLogin("skipped"), "app");
  assert.equal(destinationAfterLogin("completed"), "app");
});

test("parseOnboardingStatusFromProfile reads backend field only", () => {
  assert.equal(
    parseOnboardingStatusFromProfile(
      profile({ onboardingStatus: "skipped", usages: [] }),
    ),
    "skipped",
  );
  assert.equal(
    parseOnboardingStatusFromProfile(
      profile({
        onboardingStatus: "pending",
        usages: [
          {
            id: "1",
            userId: "u1",
            substanceId: "nicotine",
            yearStarted: 2020,
            lastUseDate: null,
            frequency: "daily",
            status: "active",
            createdAt: "",
            updatedAt: "",
          },
        ],
      }),
    ),
    "pending",
  );
  assert.equal(parseOnboardingStatusFromProfile(null), null);
});

test("completeOnboardingWithUsages PUT then PATCH completed", async () => {
  const calls: string[] = [];
  const result = await completeOnboardingWithUsages(
    [
      {
        substanceId: "nicotine",
        yearStarted: 2020,
        lastUseDate: "2024-01-01",
        frequency: "daily",
        status: "abstinent",
      },
    ],
    {
      saveUsages: async (usages) => {
        calls.push(`put:${usages.length}`);
        return profile({ onboardingStatus: "pending", usages: [] });
      },
      patchStatus: async (status) => {
        calls.push(`patch:${status}`);
        return profile({ onboardingStatus: status });
      },
    },
  );
  assert.equal(result.ok, true);
  assert.deepEqual(calls, ["put:1", "patch:completed"]);
});

test("completeOnboardingWithUsages: PUT failure does not PATCH", async () => {
  const calls: string[] = [];
  const result = await completeOnboardingWithUsages([], {
    saveUsages: async () => {
      calls.push("put");
      throw new ApiError(500, "fail");
    },
    patchStatus: async () => {
      calls.push("patch");
      return profile({ onboardingStatus: "completed" });
    },
  });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.phase, "put");
    assert.equal(result.usagesSaved, false);
  }
  assert.deepEqual(calls, ["put"]);
});

test("completeOnboardingWithUsages: PATCH failure after PUT is recoverable", async () => {
  const result = await completeOnboardingWithUsages([], {
    saveUsages: async () => profile({ onboardingStatus: "pending" }),
    patchStatus: async () => {
      throw new ApiError(500, "status fail");
    },
  });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.phase, "patch");
    assert.equal(result.usagesSaved, true);
  }

  const retry = await completeOnboardingStatusOnly({
    patchStatus: async (status) => profile({ onboardingStatus: status }),
  });
  assert.equal(retry.ok, true);
});

test("skipOnboardingWithoutClearingUsages only PATCHes skipped", async () => {
  const calls: string[] = [];
  const result = await skipOnboardingWithoutClearingUsages({
    patchStatus: async (status) => {
      calls.push(status);
      return profile({ onboardingStatus: status });
    },
  });
  assert.equal(result.ok, true);
  assert.deepEqual(calls, ["skipped"]);
});
