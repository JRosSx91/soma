import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  PROGRESS_LEVEL_MAX,
  PROGRESS_LEVEL_MIN,
  PROGRESS_STARTING_TITLE_ID,
  PROGRESS_TITLES,
  PROGRESS_TITLE_IDS,
  PROGRESS_XP_AMOUNT,
  PROGRESS_XP_MAX,
  PROGRESS_XP_MIN,
  PROGRESS_XP_SOURCES,
  SPECIAL_CATEGORY_XP_SOURCES,
  isProgressLevel,
  isSpecialCategoryXpSource,
  isProgressTitleId,
  isProgressTitleUnlocked,
  isProgressXp,
  isProgressXpSource,
  levelFromTotalXp,
  percentToNextLevel,
  progressFromTotalXp,
  totalXpToReach,
  unlockedProgressTitleIds,
  xpForNextLevel,
  xpIntoCurrentLevel,
  xpToNextLevel,
} from "./progress.js";

const source = readFileSync(new URL("./progress.ts", import.meta.url), "utf8");

function expectedT(level: number): number {
  const n = level - 1;
  return 30 * n * n + 40 * n;
}

test("progress math is a pure module without Prisma, HTTP, React or abstinence", () => {
  assert.equal(source.includes("@prisma"), false);
  assert.equal(source.includes("lastUseDate"), false);
  assert.equal(source.includes("from \"react"), false);
  assert.equal(source.includes("fetch("), false);
  assert.equal(source.includes("/me/"), false);
  assert.match(source, /achievement_eligible/);
  assert.match(source, /reserved source/);
  assert.match(source, /does not classify medals/);
});

test("T(L) matches 30(L-1)^2 + 40(L-1) on approved knots", () => {
  assert.equal(totalXpToReach(1), 0);
  assert.equal(totalXpToReach(2), 70);
  assert.equal(totalXpToReach(10), 2790);
  assert.equal(totalXpToReach(50), 73990);
  assert.equal(totalXpToReach(100), 297990);
  for (const level of [1, 2, 5, 10, 13, 15, 25, 40, 50, 75, 100, 1000]) {
    assert.equal(totalXpToReach(level), expectedT(level));
  }
});

test("level 1 is 0 XP; knots map back through the inverse", () => {
  assert.equal(levelFromTotalXp(0), 1);
  assert.equal(levelFromTotalXp(70), 2);
  assert.equal(levelFromTotalXp(2790), 10);
  assert.equal(levelFromTotalXp(73990), 50);
  assert.equal(levelFromTotalXp(297990), 100);
});

test("XP immediately below and above each approved threshold", () => {
  const knots = [
    { xp: 70, level: 2 },
    { xp: 2790, level: 10 },
    { xp: 73990, level: 50 },
    { xp: 297990, level: 100 },
  ];
  for (const knot of knots) {
    assert.equal(levelFromTotalXp(knot.xp - 1), knot.level - 1);
    assert.equal(levelFromTotalXp(knot.xp), knot.level);
    assert.equal(levelFromTotalXp(knot.xp + 1), knot.level);
    assert.equal(percentToNextLevel(knot.xp), 0);
    assert.equal(xpIntoCurrentLevel(knot.xp), 0);
  }
  assert.equal(levelFromTotalXp(69), 1);
  assert.equal(xpIntoCurrentLevel(69), 69);
  assert.equal(xpToNextLevel(69), 1);
  assert.equal(xpForNextLevel(69), 70);
  assert.equal(percentToNextLevel(69), Math.floor((69 * 100) / 70));
});

test("progress inside a level uses the 60L+10 band", () => {
  assert.equal(xpForNextLevel(70), 130);
  assert.equal(xpToNextLevel(70), 130);
  assert.equal(xpIntoCurrentLevel(100), 30);
  assert.equal(xpToNextLevel(100), 100);
  assert.equal(percentToNextLevel(100), Math.floor((30 * 100) / 130));
  const mid = progressFromTotalXp(100);
  assert.equal(mid.level, 2);
  assert.equal(mid.xpForNextLevel, 130);
});

test("starting title is unlocked at level 1; later titles follow minLevel", () => {
  assert.equal(PROGRESS_STARTING_TITLE_ID, "walker");
  assert.deepEqual(unlockedProgressTitleIds(1), ["walker"]);
  assert.equal(isProgressTitleUnlocked("walker", 1), true);
  assert.equal(isProgressTitleUnlocked("explorer", 1), false);
  assert.equal(isProgressTitleUnlocked("explorer", 5), true);
  assert.deepEqual(unlockedProgressTitleIds(10), [
    "walker",
    "explorer",
    "cartographer",
  ]);
  assert.equal(unlockedProgressTitleIds(100).length, PROGRESS_TITLE_IDS.length);
  assert.equal(PROGRESS_TITLES[0]?.minLevel, 1);
  for (const row of PROGRESS_TITLES) {
    assert.equal(row.titleKey, `progress.titles.${row.id}`);
    assert.equal(row.emblemId, row.id);
  }
  assert.deepEqual(progressFromTotalXp(69).unlockedTitleIds, ["walker"]);
  assert.deepEqual(progressFromTotalXp(70).unlockedTitleIds, ["walker"]);
  assert.equal(source.includes("lastUseDate"), false);
  assert.match(source, /unlockedProgressTitles\(level: number\)/);
});

test("invalid and non-safe numeric inputs are rejected", () => {
  const badXp = [-1, 1.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER, 70.0001];
  for (const value of badXp) {
    assert.equal(isProgressXp(value), false);
    assert.throws(() => levelFromTotalXp(value as number), RangeError);
  }
  assert.equal(isProgressXp(0), true);
  assert.equal(isProgressLevel(0), false);
  assert.equal(isProgressLevel(1.2), false);
  assert.throws(() => totalXpToReach(0), RangeError);
  assert.throws(() => totalXpToReach(PROGRESS_LEVEL_MAX + 1), RangeError);
  assert.throws(() => unlockedProgressTitleIds(Number.NaN), RangeError);
});

test("safe numeric range: cap level and T(max) stay inside MAX_SAFE_INTEGER", () => {
  assert.equal(PROGRESS_LEVEL_MIN, 1);
  assert.ok(PROGRESS_XP_MAX <= Number.MAX_SAFE_INTEGER);
  assert.ok(Number.isSafeInteger(PROGRESS_XP_MAX));
  assert.equal(PROGRESS_XP_MAX, expectedT(PROGRESS_LEVEL_MAX));
  assert.equal(totalXpToReach(PROGRESS_LEVEL_MAX), PROGRESS_XP_MAX);
  assert.equal(levelFromTotalXp(PROGRESS_XP_MAX), PROGRESS_LEVEL_MAX);
  assert.equal(levelFromTotalXp(PROGRESS_XP_MAX - 1), PROGRESS_LEVEL_MAX - 1);
  assert.equal(xpIntoCurrentLevel(PROGRESS_XP_MAX), 0);
  assert.equal(xpToNextLevel(PROGRESS_XP_MAX), 0);
  assert.equal(xpForNextLevel(PROGRESS_XP_MAX), 0);
  assert.equal(percentToNextLevel(PROGRESS_XP_MAX), 100);
  assert.ok(percentToNextLevel(PROGRESS_XP_MAX - 1) < 100);
  assert.equal(isProgressXp(PROGRESS_XP_MAX + 1), false);
  assert.throws(() => levelFromTotalXp(PROGRESS_XP_MAX + 1), RangeError);
  assert.equal(PROGRESS_XP_MIN, 0);
});

test("XP sources are stable ids and do not implement grants", () => {
  assert.deepEqual([...PROGRESS_XP_SOURCES], [
    "journal_create_day",
    "personal_milestone",
    "onboarding_complete",
    "achievement_eligible",
    "mission_complete",
    "referral_qualified",
  ]);
  assert.equal(isProgressXpSource("journal_create_day"), true);
  assert.equal(isProgressXpSource("login"), false);
  assert.equal(PROGRESS_XP_AMOUNT.journal_create_day, 12);
  assert.equal(PROGRESS_XP_AMOUNT.mission_complete, 12);
  assert.equal(isSpecialCategoryXpSource("journal_create_day"), true);
  assert.equal(isSpecialCategoryXpSource("mission_complete"), false);
  assert.ok(!SPECIAL_CATEGORY_XP_SOURCES.includes("mission_complete" as never));
  assert.equal(isProgressTitleId("walker"), true);
  assert.equal(isProgressTitleId("jedi"), false);
  assert.equal(source.includes("grantXp"), false);
  assert.equal(source.includes("UserAchievement"), false);
});
