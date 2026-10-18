import assert from "node:assert/strict";
import { test } from "node:test";
import { ApiError } from "../../auth/client/api.js";
import type { UsageInput, UserProfileResponse } from "../hooks/useUserProfile.js";
import { shouldConfirmClearUsages } from "./clear-usages-guard.js";
import {
  normalizeUsagesPayload,
  planOnboardingPersist,
  persistOnboardingCompletion,
  usagesPayloadEqual,
} from "./onboarding-persist.js";

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

const nicotine: UsageInput = {
  substanceId: "nicotine",
  yearStarted: 2020,
  lastUseDate: "2024-01-01",
  frequency: "daily",
  status: "abstinent",
};

const caffeine: UsageInput = {
  substanceId: "caffeine",
  yearStarted: 2018,
  lastUseDate: "2025-01-15",
  frequency: "daily",
  status: "abstinent",
};

test("normalizeUsagesPayload sorts and nulls lastUseDate for active", () => {
  const normalized = normalizeUsagesPayload([
    { ...caffeine },
    {
      substanceId: "nicotine",
      yearStarted: 2020,
      lastUseDate: "2024-01-01",
      frequency: "daily",
      status: "active",
    },
  ]);
  assert.deepEqual(
    normalized.map((r) => r.substanceId),
    ["caffeine", "nicotine"],
  );
  assert.equal(normalized[1].lastUseDate, null);
});

test("usagesPayloadEqual ignores object identity and order", () => {
  assert.equal(
    usagesPayloadEqual([nicotine, caffeine], [{ ...caffeine }, { ...nicotine }]),
    true,
  );
  assert.equal(usagesPayloadEqual([nicotine], [caffeine]), false);
});

test("A: PUT OK → PATCH fails → form unchanged → retry only PATCH", async () => {
  const calls: string[] = [];
  const first = await persistOnboardingCompletion([nicotine], {
    lastSuccessfulPut: null,
    awaitingStatusRetry: false,
    saveUsages: async (usages) => {
      calls.push(`put:${usages.length}`);
      return profile({ onboardingStatus: "pending" });
    },
    patchStatus: async () => {
      calls.push("patch");
      throw new ApiError(500, "status fail");
    },
  });
  assert.equal(first.ok, false);
  if (!first.ok) {
    assert.equal(first.phase, "patch");
    assert.equal(first.usagesSaved, true);
  }
  assert.ok(first.lastSuccessfulPut);
  assert.equal(usagesPayloadEqual(first.lastSuccessfulPut!, [nicotine]), true);

  const retry = await persistOnboardingCompletion([nicotine], {
    lastSuccessfulPut: first.lastSuccessfulPut,
    awaitingStatusRetry: true,
    saveUsages: async () => {
      calls.push("put-again");
      return profile({ onboardingStatus: "pending" });
    },
    patchStatus: async (status) => {
      calls.push(`patch:${status}`);
      return profile({ onboardingStatus: status });
    },
  });
  assert.equal(retry.ok, true);
  assert.deepEqual(calls, ["put:1", "patch", "patch:completed"]);
});

test("B: PUT OK → PATCH fails → form changed → retry PUT + PATCH", async () => {
  const calls: string[] = [];
  const first = await persistOnboardingCompletion([nicotine], {
    lastSuccessfulPut: null,
    awaitingStatusRetry: false,
    saveUsages: async () => profile({ onboardingStatus: "pending" }),
    patchStatus: async () => {
      throw new ApiError(500, "status fail");
    },
  });
  assert.ok(first.lastSuccessfulPut);

  const retry = await persistOnboardingCompletion([caffeine], {
    lastSuccessfulPut: first.lastSuccessfulPut,
    awaitingStatusRetry: true,
    saveUsages: async (usages) => {
      calls.push(`put:${usages.map((u) => u.substanceId).join(",")}`);
      return profile({ onboardingStatus: "pending" });
    },
    patchStatus: async (status) => {
      calls.push(`patch:${status}`);
      return profile({ onboardingStatus: status });
    },
  });
  assert.equal(retry.ok, true);
  assert.deepEqual(calls, ["put:caffeine", "patch:completed"]);
  assert.equal(usagesPayloadEqual(retry.lastSuccessfulPut!, [caffeine]), true);
});

test("C: second PUT fails → no PATCH", async () => {
  const calls: string[] = [];
  const first = await persistOnboardingCompletion([nicotine], {
    lastSuccessfulPut: null,
    awaitingStatusRetry: false,
    saveUsages: async () => profile({ onboardingStatus: "pending" }),
    patchStatus: async () => {
      throw new ApiError(500, "status fail");
    },
  });

  const retry = await persistOnboardingCompletion([caffeine], {
    lastSuccessfulPut: first.lastSuccessfulPut,
    awaitingStatusRetry: true,
    saveUsages: async () => {
      calls.push("put");
      throw new ApiError(500, "put fail");
    },
    patchStatus: async () => {
      calls.push("patch");
      return profile({ onboardingStatus: "completed" });
    },
  });
  assert.equal(retry.ok, false);
  if (!retry.ok) {
    assert.equal(retry.phase, "put");
    assert.equal(retry.usagesSaved, false);
  }
  assert.deepEqual(calls, ["put"]);
  // Snapshot stays on the previous successful PUT.
  assert.equal(usagesPayloadEqual(retry.lastSuccessfulPut!, [nicotine]), true);
});

test("D: second PUT OK → second PATCH fails → unchanged retry only PATCH", async () => {
  const calls: string[] = [];
  const first = await persistOnboardingCompletion([nicotine], {
    lastSuccessfulPut: null,
    awaitingStatusRetry: false,
    saveUsages: async () => profile({ onboardingStatus: "pending" }),
    patchStatus: async () => {
      throw new ApiError(500, "fail1");
    },
  });

  const second = await persistOnboardingCompletion([caffeine], {
    lastSuccessfulPut: first.lastSuccessfulPut,
    awaitingStatusRetry: true,
    saveUsages: async (usages) => {
      calls.push(`put:${usages[0]?.substanceId}`);
      return profile({ onboardingStatus: "pending" });
    },
    patchStatus: async () => {
      calls.push("patch-fail");
      throw new ApiError(500, "fail2");
    },
  });
  assert.equal(second.ok, false);
  assert.equal(usagesPayloadEqual(second.lastSuccessfulPut!, [caffeine]), true);

  const third = await persistOnboardingCompletion([caffeine], {
    lastSuccessfulPut: second.lastSuccessfulPut,
    awaitingStatusRetry: true,
    saveUsages: async () => {
      calls.push("put-again");
      return profile({ onboardingStatus: "pending" });
    },
    patchStatus: async (status) => {
      calls.push(`patch:${status}`);
      return profile({ onboardingStatus: status });
    },
  });
  assert.equal(third.ok, true);
  assert.deepEqual(calls, ["put:caffeine", "patch-fail", "patch:completed"]);
});

test("E: empty list confirm path → PUT [] then PATCH", async () => {
  const calls: string[] = [];
  assert.equal(shouldConfirmClearUsages(1, 0), true);

  const result = await persistOnboardingCompletion([], {
    lastSuccessfulPut: [nicotine],
    awaitingStatusRetry: true,
    saveUsages: async (usages) => {
      calls.push(`put:${usages.length}`);
      return profile({ onboardingStatus: "pending" });
    },
    patchStatus: async (status) => {
      calls.push(`patch:${status}`);
      return profile({ onboardingStatus: status });
    },
  });
  assert.equal(result.ok, true);
  assert.deepEqual(calls, ["put:0", "patch:completed"]);
  assert.deepEqual(result.lastSuccessfulPut, []);
});

test("F: clear-all cancel does not write (guard only — no persist call)", () => {
  // Cancel leaves confirmClear false and never invokes persist.
  assert.equal(shouldConfirmClearUsages(2, 0), true);
  assert.equal(shouldConfirmClearUsages(0, 0), false);
});

test("G: concurrent persist blocked by plan equality; inFlight is page concern", () => {
  // Unchanged form while awaiting retry stays patch-only (no double PUT plan).
  assert.equal(
    planOnboardingPersist([nicotine], [nicotine], true),
    "patch-only",
  );
  assert.equal(
    planOnboardingPersist([caffeine], [nicotine], true),
    "put-and-patch",
  );
  assert.equal(
    planOnboardingPersist([nicotine], null, true),
    "put-and-patch",
  );
});

test("planOnboardingPersist: first save always put-and-patch", () => {
  assert.equal(
    planOnboardingPersist([nicotine], null, false),
    "put-and-patch",
  );
});

const cannabis: UsageInput = {
  substanceId: "cannabis",
  yearStarted: 2019,
  lastUseDate: "2024-06-01",
  frequency: "weekly",
  status: "abstinent",
};

test("H: multi-retry snapshot — 2→3→clear confirm cancel→PUT [] + PATCH", async () => {
  const calls: string[] = [];
  let snapshot: UsageInput[] | null = null;

  // 1–2: PUT two substances, PATCH fails
  {
    const r = await persistOnboardingCompletion([nicotine, caffeine], {
      lastSuccessfulPut: snapshot,
      awaitingStatusRetry: false,
      saveUsages: async (usages) => {
        calls.push(`put:${usages.map((u) => u.substanceId).sort().join("+")}`);
        return profile({ onboardingStatus: "pending" });
      },
      patchStatus: async () => {
        calls.push("patch-fail");
        throw new ApiError(500, "fail");
      },
    });
    assert.equal(r.ok, false);
    snapshot = r.lastSuccessfulPut;
    assert.equal(snapshot?.length, 2);
  }

  // 3–5: add third → PUT three, PATCH fails again; snapshot becomes 3
  {
    const three = [nicotine, caffeine, cannabis];
    assert.equal(
      planOnboardingPersist(three, snapshot, true),
      "put-and-patch",
    );
    const r = await persistOnboardingCompletion(three, {
      lastSuccessfulPut: snapshot,
      awaitingStatusRetry: true,
      saveUsages: async (usages) => {
        calls.push(`put:${usages.map((u) => u.substanceId).sort().join("+")}`);
        return profile({ onboardingStatus: "pending" });
      },
      patchStatus: async () => {
        calls.push("patch-fail");
        throw new ApiError(500, "fail");
      },
    });
    assert.equal(r.ok, false);
    snapshot = r.lastSuccessfulPut;
    assert.equal(snapshot?.length, 3);
    assert.equal(usagesPayloadEqual(snapshot!, three), true);
  }

  // 6–7: uncheck all → clear confirmation required against snapshot count
  assert.equal(shouldConfirmClearUsages(snapshot!.length, 0), true);

  // 8: cancel → no additional writes (calls unchanged)
  const callsAfterCancel = [...calls];

  // 9: confirm empty → PUT [] then PATCH using frozen confirmed payload
  const confirmedEmpty: UsageInput[] = [];
  const r = await persistOnboardingCompletion(confirmedEmpty, {
    lastSuccessfulPut: snapshot,
    awaitingStatusRetry: true,
    saveUsages: async (usages) => {
      calls.push(`put:${usages.length}`);
      assert.deepEqual(usages, confirmedEmpty);
      return profile({ onboardingStatus: "pending" });
    },
    patchStatus: async (status) => {
      calls.push(`patch:${status}`);
      return profile({ onboardingStatus: status });
    },
  });
  assert.equal(r.ok, true);
  assert.deepEqual(r.lastSuccessfulPut, []);
  assert.deepEqual(callsAfterCancel, [
    "put:caffeine+nicotine",
    "patch-fail",
    "put:caffeine+cannabis+nicotine",
    "patch-fail",
  ]);
  assert.deepEqual(calls, [
    ...callsAfterCancel,
    "put:0",
    "patch:completed",
  ]);
});
