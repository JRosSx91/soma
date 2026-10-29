import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { readFileSync } from "node:fs";
import { fetchMyProgress, resetProgressClientForTests } from "./progress-api.ts";
import { DEMO_PROGRESS_TOTAL_XP } from "./progress-demo.ts";

const api = readFileSync(new URL("./progress-api.ts", import.meta.url), "utf8");
const hook = readFileSync(new URL("./useProgress.ts", import.meta.url), "utf8");
const demo = readFileSync(new URL("./progress-demo.ts", import.meta.url), "utf8");
const home = readFileSync(
  new URL("../recovery-dashboard/components/PreviewHome.tsx", import.meta.url),
  "utf8",
);

afterEach(() => {
  resetProgressClientForTests();
});

test("LIVE client uses GET and PATCH /me/progress", () => {
  assert.match(api, /apiRequest/);
  assert.match(api, /\/me\/progress/);
  assert.match(api, /method: "PATCH"/);
  assert.match(api, /equippedTitleId/);
  assert.match(api, /parseProgressPayload/);
});

test("DEMO fixture never calls the progress API; PreviewHome uses the hook without PATCH", () => {
  assert.equal(demo.includes("apiRequest"), false);
  assert.equal(demo.includes("/me/progress"), false);
  assert.match(home, /useProgress/);
  assert.match(home, /HomeProgressIdentity/);
  assert.equal(home.includes("/me/progress"), false);
  assert.equal(home.includes("TitlePicker"), false);
  assert.equal(home.includes("patchEquippedTitle"), false);
  assert.match(home, /equipTitle=\{progression\.equipTitle\}/);
});

test("LIVE hook refetches on window focus and visibility without a global store", () => {
  assert.match(hook, /visibilitychange/);
  assert.match(hook, /window.addEventListener\("focus"/);
  assert.match(hook, /window.removeEventListener\("focus"/);
  assert.match(hook, /document.removeEventListener\("visibilitychange"/);
  assert.match(hook, /if \(!live \|\| !userId\) return;/);
  assert.doesNotMatch(hook, /zustand|createContext|redux/);
  const listenerEffect = hook.slice(hook.indexOf("const onFocus"));
  assert.equal(listenerEffect.includes("fetchMyProgress"), false);
  assert.match(listenerEffect, /setReloadToken/);
});

test("DEMO progress never attaches focus listeners or fetches on refocus", () => {
  assert.match(hook, /if \(!live \|\| !userId\) return;/);
  assert.equal(demo.includes("addEventListener"), false);
  assert.equal(demo.includes("fetchMyProgress"), false);
  assert.equal(demo.includes("/me/progress"), false);
});

test("LIVE GET /me/progress shares a single in-flight request", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    calls += 1;
    assert.match(String(input), /\/me\/progress$/);
    await Promise.resolve();
    return new Response(
      JSON.stringify({ totalXp: DEMO_PROGRESS_TOTAL_XP, equippedTitleId: "cartographer" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }) as typeof fetch;
  try {
    const [a, b] = await Promise.all([fetchMyProgress(), fetchMyProgress()]);
    assert.equal(calls, 1);
    assert.equal(a.totalXp, DEMO_PROGRESS_TOTAL_XP);
    assert.equal(b.totalXp, DEMO_PROGRESS_TOTAL_XP);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("LIVE hook never substitutes DEMO data on error", () => {
  assert.match(hook, /live: boolean/);
  assert.match(hook, /fetchMyProgress/);
  assert.match(hook, /setProgress\(null\)/);
  assert.match(hook, /setState\("error"\)/);
  assert.match(hook, /if \(!live\)/);
  assert.match(hook, /buildDemoProgress\(\)/);
  assert.match(
    hook,
    /setProgress\(null\);\s*setState\("error"\)/,
  );
});
