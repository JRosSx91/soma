/**
 * GAM-03: services stay on their declared reward path.
 * Same action must not complete a mission, grant a second XP source, and
 * unlock a medal in one write. Distinct actions may still grant distinct XP.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

function read(relative: string): string {
  return readFileSync(new URL(relative, import.meta.url), "utf8");
}

const journal = read("../journal/journal.service.ts");
const journalModule = read("../journal/journal.module.ts");
const missions = read("../missions/missions.service.ts");
const missionsModule = read("../missions/missions.module.ts");
const achievements = read("../achievements/achievements.service.ts");
const achievementsModule = read("../achievements/achievements.module.ts");
const persist = read("../achievements/user-achievement-persist.ts");
const progress = read("./progress.service.ts");
const profile = read("../profile/profile.service.ts");
const consent = read("../auth/special-category-consent.ts");

test("journal grants only catalog journal/milestone XP and never medals or missions", () => {
  assert.match(journal, /source: "journal_create_day"/);
  assert.match(journal, /source: "personal_milestone"/);
  assert.equal(journal.includes("mission_complete"), false);
  assert.equal(journal.includes("achievement_eligible"), false);
  assert.equal(journal.includes("detectAndPersistUnlocks"), false);
  assert.equal(journal.includes("MissionsService"), false);
  assert.equal(journal.includes("AchievementsService"), false);
  assert.equal(journalModule.includes("AchievementsModule"), false);
  assert.equal(journalModule.includes("MissionsModule"), false);
  const awards = journal.match(/awardXp/g) ?? [];
  assert.equal(awards.length, 2);
});

test("missions grant only mission_complete XP and never journal or medals", () => {
  assert.match(missions, /MISSION_XP_SOURCE/);
  assert.equal(missions.includes("journal_create_day"), false);
  assert.equal(missions.includes("personal_milestone"), false);
  assert.equal(missions.includes("achievement_eligible"), false);
  assert.equal(missions.includes("detectAndPersistUnlocks"), false);
  assert.equal(missions.includes("JournalService"), false);
  assert.equal(missionsModule.includes("AchievementsModule"), false);
  assert.equal(missionsModule.includes("JournalModule"), false);
});

test("medals persist insert-only and never call awardXp", () => {
  assert.equal(achievements.includes("awardXp"), false);
  assert.equal(achievements.includes("ProgressService"), false);
  assert.equal(achievements.includes("journal_create_day"), false);
  assert.equal(achievements.includes("mission_complete"), false);
  assert.equal(achievementsModule.includes("ProgressModule"), false);
  assert.match(persist, /ON CONFLICT \("userId", "achievementId"\) DO NOTHING/);
});

test("progress ledger does not unlock medals or complete missions", () => {
  assert.equal(progress.includes("UserAchievement"), false);
  assert.equal(progress.includes("MissionCompletion"), false);
  assert.equal(progress.includes("JournalEntry"), false);
  assert.equal(progress.includes("detectAndPersistUnlocks"), false);
});

test("relapse profile writes do not delete XP or medals; withdraw is a separate purge", () => {
  assert.equal(profile.includes("xpGrant.delete"), false);
  assert.equal(profile.includes("userAchievement.delete"), false);
  assert.equal(profile.includes("awardXp"), false);
  assert.match(consent, /xpGrant.deleteMany/);
  assert.match(consent, /userAchievement.deleteMany/);
  assert.match(consent, /Keeps the account, sessions, and MissionCompletion rows/);
});
