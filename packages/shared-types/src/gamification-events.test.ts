import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  GAMIFICATION_EVENT_RULES,
  GAMIFICATION_RESERVED_UNGRANTED_SOURCES,
  GAMIFICATION_USER_ACTIONS,
  gamificationRuleFor,
  isLegitimateDistinctXpPair,
} from "./gamification-events.js";
import {
  PROGRESS_XP_AMOUNT,
  PROGRESS_XP_SOURCES,
} from "./progress.js";
import { MISSION_XP_AMOUNT, MISSION_XP_SOURCE } from "./missions.js";

const source = readFileSync(new URL("./gamification-events.ts", import.meta.url), "utf8");

test("every listed action has exactly one rule and no Prisma table", () => {
  assert.equal(GAMIFICATION_EVENT_RULES.length, GAMIFICATION_USER_ACTIONS.length);
  const actions = GAMIFICATION_EVENT_RULES.map((row) => row.action);
  assert.deepEqual([...actions], [...GAMIFICATION_USER_ACTIONS]);
  assert.equal(new Set(actions).size, actions.length);
  assert.equal(source.includes("prisma"), false);
  assert.equal(source.includes("awardXp"), false);
  assert.equal(source.includes("CREATE TABLE"), false);
});

test("journal create and first mission complete are distinct legitimate XP grants", () => {
  const journal = gamificationRuleFor("journal_create");
  const mission = gamificationRuleFor("mission_submit_correct_first");
  assert.equal(journal.xp.grants, true);
  assert.equal(mission.xp.grants, true);
  if (journal.xp.grants && mission.xp.grants) {
    assert.equal(journal.xp.source, "journal_create_day");
    assert.equal(journal.xp.amount, PROGRESS_XP_AMOUNT.journal_create_day);
    assert.equal(mission.xp.source, MISSION_XP_SOURCE);
    assert.equal(mission.xp.amount, MISSION_XP_AMOUNT);
    assert.equal(
      isLegitimateDistinctXpPair(journal.xp.source, mission.xp.source),
      true,
    );
  }
  assert.equal(journal.missionProgress, "none");
  assert.equal(journal.medalUnlock, "none");
  assert.equal(mission.medalUnlock, "none");
});

test("edits, deletes, repeats, wrong answers and feedback never grant XP", () => {
  for (const action of [
    "journal_patch",
    "journal_delete",
    "personal_milestone_patch",
    "personal_milestone_delete",
    "mission_submit_correct_repeat",
    "mission_submit_incorrect",
    "feedback_submit",
  ] as const) {
    assert.equal(gamificationRuleFor(action).xp.grants, false);
  }
});

test("medals do not write XP; reserved sources stay ungranted", () => {
  const medals = gamificationRuleFor("achievement_detect");
  assert.equal(medals.xp.grants, false);
  assert.match(medals.medalUnlock, /ON CONFLICT/);
  assert.deepEqual([...GAMIFICATION_RESERVED_UNGRANTED_SOURCES], [
    "onboarding_complete",
    "achievement_eligible",
    "referral_qualified",
  ]);
  for (const sourceId of GAMIFICATION_RESERVED_UNGRANTED_SOURCES) {
    assert.equal((PROGRESS_XP_SOURCES as readonly string[]).includes(sourceId), true);
  }
  assert.equal(PROGRESS_XP_AMOUNT.achievement_eligible, 18);
});

test("relapse keeps XP and medals; withdraw is not a relapse", () => {
  const relapse = gamificationRuleFor("relapse_last_use_change");
  const withdraw = gamificationRuleFor("special_category_withdraw");
  assert.equal(relapse.xp.grants, false);
  assert.match(relapse.medalUnlock, /kept/);
  assert.match(withdraw.xp.reason, /mission_complete is kept/);
  assert.match(withdraw.medalUnlock, /deleted/);
});

test("the same XP source pair is not a distinct legitimate pair", () => {
  assert.equal(
    isLegitimateDistinctXpPair("journal_create_day", "journal_create_day"),
    false,
  );
});
