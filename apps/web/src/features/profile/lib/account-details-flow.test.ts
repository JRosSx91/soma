/**
 * End-to-end-ish flow for Account save without mounting React:
 * draft → patch builder → API client (mocked fetch).
 */
import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { patchProfileDetails } from "../client/profile-api.js";
import {
  buildProfileDetailsPatch,
  draftFromProfile,
  type ProfileDetailsFields,
} from "./profile-details.js";
import {
  clearAccessToken,
  setAccessToken,
} from "../../auth/client/access-token.js";
import { mergeAuthUserFromProfile } from "../../auth/lib/merge-auth-user.js";
import type { AuthUser } from "../../auth/types.js";

const originalFetch = globalThis.fetch;
let bodies: unknown[] = [];

beforeEach(() => {
  bodies = [];
  clearAccessToken();
  setAccessToken("tok");
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  clearAccessToken();
});

const baseline: ProfileDetailsFields = {
  displayName: "Ada",
  biologicalSex: "female",
  birthYear: 1990,
  weightKg: 70,
};

test("account flow: edit one field then PATCH only that field", async () => {
  globalThis.fetch = (async (_url, init) => {
    bodies.push(JSON.parse(String(init?.body)));
    return new Response(
      JSON.stringify({
        user: {
          id: "u1",
          email: "a@example.com",
          displayName: "Ada Lovelace",
          biologicalSex: "female",
          birthYear: 1990,
          weightKg: 70,
        },
        onboardingStatus: "completed",
        usages: [{ id: "u", substanceId: "caffeine" }],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }) as typeof fetch;

  const draft = {
    ...draftFromProfile(baseline),
    displayName: "Ada Lovelace",
  };
  const built = buildProfileDetailsPatch(baseline, draft);
  assert.equal(built.ok, true);
  if (!built.ok) return;

  const saved = await patchProfileDetails(built.patch);
  assert.deepEqual(bodies[0], { displayName: "Ada Lovelace" });
  assert.equal(saved.user.displayName, "Ada Lovelace");
  assert.equal(saved.onboardingStatus, "completed");
  assert.equal(saved.usages.length, 1);
});

test("account flow: cancel means rebuild draft from baseline (no PATCH)", () => {
  const draft = {
    ...draftFromProfile(baseline),
    displayName: "Changed",
    weightKg: "55",
  };
  const restored = draftFromProfile(baseline);
  assert.equal(restored.displayName, "Ada");
  assert.equal(restored.weightKg, "70");
  assert.notEqual(draft.displayName, restored.displayName);
});

test("account flow: clear weight sends null; usages untouched in response contract", async () => {
  globalThis.fetch = (async (_url, init) => {
    bodies.push(JSON.parse(String(init?.body)));
    return new Response(
      JSON.stringify({
        user: {
          id: "u1",
          email: "a@example.com",
          ...baseline,
          weightKg: null,
        },
        onboardingStatus: "skipped",
        usages: [{ id: "keep" }],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }) as typeof fetch;

  const built = buildProfileDetailsPatch(baseline, {
    ...draftFromProfile(baseline),
    weightKg: "",
  });
  assert.equal(built.ok, true);
  if (!built.ok) return;
  const saved = await patchProfileDetails(built.patch);
  assert.deepEqual(bodies[0], { weightKg: null });
  assert.equal(saved.user.weightKg, null);
  assert.equal(saved.usages.length, 1);
  assert.equal(saved.onboardingStatus, "skipped");
});

test("account flow: network error does not invent a successful patch", async () => {
  globalThis.fetch = (async () => {
    throw new TypeError("network down");
  }) as typeof fetch;

  const built = buildProfileDetailsPatch(baseline, {
    ...draftFromProfile(baseline),
    displayName: "Other",
  });
  assert.equal(built.ok, true);
  if (!built.ok) return;
  await assert.rejects(() => patchProfileDetails(built.patch));
});

test("account flow: AuthUser stays coherent after successful details PATCH", async () => {
  const authBefore: AuthUser = {
    id: "u1",
    email: "a@example.com",
    displayName: "Ada",
    biologicalSex: "female",
    birthYear: 1990,
    weightKg: 70,
  };

  globalThis.fetch = (async (_url, init) => {
    bodies.push(JSON.parse(String(init?.body)));
    return new Response(
      JSON.stringify({
        user: {
          id: "u1",
          email: "a@example.com",
          displayName: "Ada Synced",
          biologicalSex: "female",
          birthYear: 1990,
          weightKg: 68.5,
        },
        onboardingStatus: "completed",
        usages: [],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }) as typeof fetch;

  const built = buildProfileDetailsPatch(baseline, {
    ...draftFromProfile(baseline),
    displayName: "Ada Synced",
    weightKg: "68.5",
  });
  assert.equal(built.ok, true);
  if (!built.ok) return;

  const saved = await patchProfileDetails(built.patch);
  const authAfter = mergeAuthUserFromProfile(authBefore, saved.user);
  assert.equal(authAfter.displayName, "Ada Synced");
  assert.equal(authAfter.weightKg, 68.5);
  assert.equal(authAfter.id, authBefore.id);
});
