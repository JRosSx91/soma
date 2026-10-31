import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  GAMIFICATION_EVENT_RULES,
  gamificationRuleFor,
} from "@soma/shared-types";

const journalDemo = readFileSync(
  new URL("../journal/journal-demo.ts", import.meta.url),
  "utf8",
);
const missionsDemo = readFileSync(
  new URL("../missions/missions-demo.ts", import.meta.url),
  "utf8",
);
const progressDemo = readFileSync(new URL("./progress-demo.ts", import.meta.url), "utf8");
const progressApi = readFileSync(new URL("./progress-api.ts", import.meta.url), "utf8");

test("DEMO journal and missions never award LIVE XP", () => {
  assert.equal(journalDemo.includes("awardXp"), false);
  assert.equal(journalDemo.includes("/me/progress"), false);
  assert.equal(journalDemo.includes("/me/missions"), false);
  assert.match(missionsDemo, /xpGranted: 0/);
  assert.equal(missionsDemo.includes("xpGranted: 12"), false);
  assert.match(progressDemo, /Never sent over HTTP/);
  assert.match(progressApi, /Preview\/DEMO must not call this/);
});

test("shared GAM-03 rules keep journal XP distinct from mission XP", () => {
  const journal = gamificationRuleFor("journal_create");
  const mission = gamificationRuleFor("mission_submit_correct_first");
  assert.equal(journal.xp.grants, true);
  assert.equal(mission.xp.grants, true);
  if (journal.xp.grants && mission.xp.grants) {
    assert.notEqual(journal.xp.source, mission.xp.source);
  }
  assert.equal(
    GAMIFICATION_EVENT_RULES.every((row) => row.circularRisk === "none"),
    true,
  );
});
