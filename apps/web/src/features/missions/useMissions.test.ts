import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const hook = readFileSync(new URL("./useMissions.ts", import.meta.url), "utf8");
const demo = readFileSync(new URL("./missions-demo.ts", import.meta.url), "utf8");
const api = readFileSync(new URL("./missions-api.ts", import.meta.url), "utf8");
const progressHook = readFileSync(new URL("../progress/useProgress.ts", import.meta.url), "utf8");

test("LIVE submit uses POST and never evaluates locally", () => {
  assert.match(hook, /postMissionAnswer/);
  assert.match(hook, /if \(!live\)/);
  assert.match(hook, /evaluateDemoAnswer/);
  const liveBranch = hook.slice(hook.indexOf("} else {"));
  assert.match(liveBranch, /postMissionAnswer/);
  assert.equal(liveBranch.includes("evaluateDemoAnswer"), false);
  assert.equal(hook.includes("mission-answers"), false);
});

test("incorrect HTTP 200 is stored as lastAnswer, not submitError", () => {
  assert.match(hook, /setLastAnswer\(\{ missionId, result \}\)/);
  assert.match(hook, /if \(result\.completed\)/);
  assert.match(hook, /applyAnswerToCatalog/);
  assert.match(hook, /setSubmitError\(null\)/);
  assert.doesNotMatch(
    hook.slice(hook.indexOf("setLastAnswer"), hook.indexOf("catch")),
    /setSubmitError\(err/,
  );
});

test("submit errors stay separate from load errors and do not fake completion", () => {
  assert.match(hook, /error,/);
  assert.match(hook, /submitError,/);
  assert.match(hook, /setError\(null\)/);
  assert.match(hook, /missions load failed/);
  assert.match(hook, /missions submit failed/);
  assert.match(hook, /shouldBlockMissionSubmit/);
  assert.match(hook, /pendingRef/);
});

test("lastAnswer is keyed by missionId so stale results are not applied to another mission", () => {
  assert.match(hook, /setLastAnswer\(\{ missionId, result \}\)/);
  assert.match(hook, /MissionAnswerRecord/);
  assert.equal(hook.includes("setLastAnswer(null)"), true);
  const catchBlock = hook.slice(hook.indexOf("} catch (err: unknown) {"));
  assert.equal(catchBlock.includes("setLastAnswer(null)"), false);
});

test("DEMO path never hits mission endpoints; LIVE load does", () => {
  assert.match(hook, /fetchMyMissions/);
  assert.match(hook, /buildDemoMissions\(new Set\(\)\)/);
  assert.equal(demo.includes("/me/missions"), false);
  assert.match(api, /\/me\/missions/);
});

test("LIVE progress refetches on focus so Home XP is not left stale after a mission grant", () => {
  assert.match(progressHook, /visibilitychange/);
  assert.match(progressHook, /window.addEventListener\("focus"/);
  assert.match(progressHook, /setReloadToken/);
  assert.equal(hook.includes("setProgress"), false);
  assert.equal(hook.includes("totalXp"), false);
});
