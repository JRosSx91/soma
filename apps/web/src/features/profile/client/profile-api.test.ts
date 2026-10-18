import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import {
  fetchUserProfile,
  patchOnboardingStatus,
  saveUserUsages,
} from "./profile-api.js";
import { clearAccessToken, setAccessToken } from "../../auth/client/access-token.js";

const originalFetch = globalThis.fetch;
let calls: { url: string; init?: RequestInit }[] = [];

beforeEach(() => {
  calls = [];
  clearAccessToken();
  setAccessToken("test-token");
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockJson(status: number, body: unknown) {
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), init });
    return new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
}

const sampleProfile = {
  user: {
    id: "u1",
    email: "a@example.com",
    displayName: "A",
    biologicalSex: "male",
    birthYear: 1990,
    weightKg: null,
  },
  onboardingStatus: "pending",
  usages: [],
};

test("fetchUserProfile GETs /me/profile", async () => {
  mockJson(200, sampleProfile);
  const data = await fetchUserProfile();
  assert.equal(data.onboardingStatus, "pending");
  assert.match(calls[0]!.url, /\/me\/profile$/);
  assert.equal(calls[0]!.init?.method ?? "GET", "GET");
});

test("saveUserUsages PUTs full usages array", async () => {
  mockJson(200, { ...sampleProfile, onboardingStatus: "pending" });
  await saveUserUsages([]);
  assert.equal(calls[0]!.init?.method, "PUT");
  assert.deepEqual(JSON.parse(String(calls[0]!.init?.body)), { usages: [] });
});

test("patchOnboardingStatus PATCHes status only", async () => {
  mockJson(200, { ...sampleProfile, onboardingStatus: "skipped" });
  const data = await patchOnboardingStatus("skipped");
  assert.equal(data.onboardingStatus, "skipped");
  assert.equal(calls[0]!.init?.method, "PATCH");
  assert.match(calls[0]!.url, /onboarding-status/);
  assert.deepEqual(JSON.parse(String(calls[0]!.init?.body)), {
    status: "skipped",
  });
});
