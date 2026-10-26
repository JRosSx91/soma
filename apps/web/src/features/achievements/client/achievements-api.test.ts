import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { fetchAchievements, resetAchievementsClientForTests } from "./achievements-api.js";

afterEach(() => {
  resetAchievementsClientForTests();
});

test("fetchAchievements for different users do not share an in-flight GET", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = (async () => {
    calls += 1;
    await Promise.resolve();
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  try {
    await Promise.all([fetchAchievements("user-a"), fetchAchievements("user-b")]);
    assert.equal(calls, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("forced fetchAchievements does not reuse a stale in-flight GET", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = (async () => {
    calls += 1;
    await Promise.resolve();
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const pending = fetchAchievements("user-a");
    const forced = fetchAchievements("user-a", { force: true });
    await Promise.all([pending, forced]);
    assert.equal(calls, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("concurrent fetchAchievements share a single GET", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = (async () => {
    calls += 1;
    await Promise.resolve();
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const [a, b] = await Promise.all([fetchAchievements(), fetchAchievements()]);
    assert.equal(calls, 1);
    assert.deepEqual(a, []);
    assert.deepEqual(b, []);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
