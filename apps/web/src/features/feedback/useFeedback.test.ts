import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const hook = readFileSync(new URL("./useFeedback.ts", import.meta.url), "utf8");
const api = readFileSync(new URL("./feedback-api.ts", import.meta.url), "utf8");

test("LIVE load and submit use GET/POST; DEMO never writes", () => {
  assert.match(hook, /fetchMyFeedback/);
  assert.match(hook, /createMyFeedback/);
  assert.match(hook, /if \(!live\) return null/);
  assert.match(hook, /never writes/);
  assert.match(hook, /never touches XP/);
  assert.equal(hook.includes("awardXp"), false);
  assert.equal(hook.includes("/me/progress"), false);
  assert.match(api, /\/me\/feedback/);
});

test("submit blocks repeats, validates locally, and records created vs duplicate", () => {
  assert.match(hook, /pendingRef/);
  assert.match(hook, /validateFeedbackDraft/);
  assert.match(hook, /kind: result.duplicate \? "duplicate" : "created"/);
  assert.match(hook, /prependFeedbackItem/);
  assert.match(hook, /feedback submit failed/);
});

test("pagination and load errors stay separate from submit errors", () => {
  assert.match(hook, /appendFeedbackPage/);
  assert.match(hook, /loadMore/);
  assert.match(hook, /feedback load failed/);
  assert.match(hook, /submitError/);
  assert.match(hook, /setState\("error"\)/);
});
