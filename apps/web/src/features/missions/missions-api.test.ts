import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { readFileSync } from "node:fs";
import { fetchMyMissions, postMissionAnswer, resetMissionsClientForTests } from "./missions-api.ts";
import { buildDemoMissions } from "./missions-demo.ts";

afterEach(() => {
  resetMissionsClientForTests();
});

const api = readFileSync(new URL("./missions-api.ts", import.meta.url), "utf8");
const hook = readFileSync(new URL("./useMissions.ts", import.meta.url), "utf8");
const demo = readFileSync(new URL("./missions-demo.ts", import.meta.url), "utf8");
const progressDemo = readFileSync(new URL("../progress/progress-demo.ts", import.meta.url), "utf8");

test("LIVE client uses GET /me/missions and POST /me/missions/:id/answer", () => {
  assert.match(api, /apiRequest/);
  assert.match(api, /\/me\/missions/);
  assert.match(api, /method: "POST"/);
  assert.match(api, /optionId/);
  assert.equal(api.includes("correctOptionId"), false);
  assert.equal(api.includes("evaluateDemoAnswer"), false);
});

test("LIVE GET is authenticated and shares a single in-flight request", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    calls += 1;
    assert.match(String(input), /\/me\/missions$/);
    await Promise.resolve();
    return new Response(JSON.stringify({ missions: buildDemoMissions(new Set()) }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
  try {
    const [a, b] = await Promise.all([fetchMyMissions(), fetchMyMissions()]);
    assert.equal(calls, 1);
    assert.equal(a.missions.length, 6);
    assert.equal(b.missions.length, 6);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("LIVE POST sends optionId and returns a server educational result", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    assert.match(String(input), /\/me\/missions\/edu-dopamine-01\/answer$/);
    assert.equal(init?.method, "POST");
    assert.equal(JSON.parse(String(init?.body)).optionId, "wanting");
    assert.equal(JSON.parse(String(init?.body)).xp, undefined);
    return new Response(
      JSON.stringify({
        correct: true,
        completed: true,
        alreadyCompleted: false,
        xpGranted: 12,
        explainKey: "missions.items.edu-dopamine-01.explain",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }) as typeof fetch;
  try {
    const row = await postMissionAnswer("edu-dopamine-01", "wanting");
    assert.equal(row.xpGranted, 12);
    assert.equal(row.completed, true);
    assert.equal(row.alreadyCompleted, false);
    assert.equal(hook.includes("xpGranted: 0"), false);
    assert.equal(hook.includes("xpGranted: 12"), false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("LIVE GET failure is an error and does not use the DEMO catalog", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ error: "nope" }), { status: 500 })) as typeof fetch;
  try {
    await assert.rejects(() => fetchMyMissions());
  } finally {
    globalThis.fetch = originalFetch;
  }
  assert.match(hook, /fetchMyMissions/);
  assert.match(hook, /setMissions\(null\)/);
  assert.match(hook, /setState\("error"\)/);
  assert.match(hook, /does not fall back to the DEMO catalog/);
});

test("DEMO module never calls mission HTTP or GAM-01 progress", () => {
  assert.equal(demo.includes("apiRequest"), false);
  assert.equal(demo.includes("/me/missions"), false);
  assert.equal(demo.includes("fetchMyProgress"), false);
  assert.equal(demo.includes("DEMO_PROGRESS"), false);
  assert.match(demo, /DEMO-only/);
  assert.match(progressDemo, /4435|DEMO_PROGRESS_TOTAL_XP/);
  assert.equal(hook.includes("DEMO_PROGRESS"), false);
  assert.equal(hook.includes("fetchMyProgress"), false);
  assert.equal(hook.includes("mission-answers"), false);
});
