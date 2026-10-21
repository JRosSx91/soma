import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import type { AchievementWithUnlockState } from "../../achievements/types.js";
import {
  pickFeaturedUnlockedAchievement,
  pickNextLockedAchievement,
  percentTowardThreshold,
  quantifiableAchievementProgress,
} from "./home-progress.ts";

function row(
  partial: Partial<AchievementWithUnlockState> & Pick<AchievementWithUnlockState, "id">,
): AchievementWithUnlockState {
  return {
    tier: "bronze",
    titleKey: "x",
    descriptionKey: "y",
    triggerOrganId: "liver",
    triggerSubstanceId: "alcohol",
    triggerRecoveryThreshold: 0.05,
    hidden: false,
    unlocked: false,
    unlockedAt: null,
    notifiedAt: null,
    achievementProgress: 0.4,
    progressAvailability: "ready",
    ...partial,
  };
}

test("next locked achievement is the closest calculable one among tracked substances", () => {
  const next = pickNextLockedAchievement(
    [
      row({ id: "a", achievementProgress: 0.2, triggerSubstanceId: "alcohol" }),
      row({ id: "b", achievementProgress: 0.7, triggerSubstanceId: "alcohol" }),
      row({ id: "c", achievementProgress: 0.9, triggerSubstanceId: "nicotine" }),
      row({ id: "d", unlocked: true, achievementProgress: 1, triggerSubstanceId: "alcohol" }),
      row({ id: "e", hidden: true, achievementProgress: 0.95, triggerSubstanceId: "alcohol" }),
    ],
    ["alcohol"],
  );
  assert.equal(next?.id, "b");
});

test("next locked achievement stays empty without rows, tracking, or ready progress", () => {
  assert.equal(pickNextLockedAchievement(null, ["alcohol"]), null);
  assert.equal(pickNextLockedAchievement([row({ id: "a" })], []), null);
  assert.equal(
    pickNextLockedAchievement(
      [row({ id: "a", progressAvailability: "missing_date" })],
      ["alcohol"],
    ),
    null,
  );
});

test("featured unlocked achievement prefers the latest unlock date", () => {
  const featured = pickFeaturedUnlockedAchievement([
    row({ id: "old", unlocked: true, unlockedAt: "2026-01-01T00:00:00.000Z" }),
    row({ id: "new", unlocked: true, unlockedAt: "2026-03-01T00:00:00.000Z" }),
    row({ id: "locked", unlocked: false }),
  ]);
  assert.equal(featured?.id, "new");
  assert.equal(pickFeaturedUnlockedAchievement([row({ id: "locked" })]), null);
});

test("percent toward a threshold is floored and not invented", () => {
  assert.equal(percentTowardThreshold(0.429), 42);
  assert.equal(percentTowardThreshold(1), 100);
  assert.equal(percentTowardThreshold(null), null);
});

test("quantifiable progress uses live share and catalog threshold, not remaining days", () => {
  const view = quantifiableAchievementProgress({
    unlocked: false,
    hidden: false,
    progressAvailability: "ready",
    achievementProgress: 0.4,
    threshold: 0.1,
  });
  assert.deepEqual(view, { towardPercent: 40, thresholdPercent: 10, currentPercent: 4 });
  assert.equal(
    quantifiableAchievementProgress({
      unlocked: false,
      hidden: true,
      progressAvailability: "ready",
      achievementProgress: 0.4,
      threshold: 0.1,
    }),
    null,
  );
  assert.equal(
    quantifiableAchievementProgress({
      unlocked: true,
      hidden: false,
      progressAvailability: "ready",
      achievementProgress: 1,
      threshold: 0.1,
    }),
    null,
  );
});

test("home summary helpers do not estimate curves or abstinence", () => {
  const source = readFileSync(new URL("./home-progress.ts", import.meta.url), "utf8");
  for (const token of ["estimateCurve", "computeRecovery", "daysTo95Recovery", "lastUseDate"]) {
    assert.equal(source.includes(token), false, token);
  }
});

test("achievements page reuses the shared quantifiable progress helper", () => {
  const page = readFileSync(new URL("../pages/AchievementsPage.tsx", import.meta.url), "utf8");
  assert.match(page, /quantifiableAchievementProgress/);
  assert.equal(page.includes("daysToReachCurveProgress"), false);
});

test("home next-milestone fixture shows a locked calculable bar without preview invention", () => {
  const fixture = row({
    id: "alcohol-liver-bronze-1",
    titleKey: "alcohol-liver-bronze-1.title",
    triggerOrganId: "liver",
    triggerSubstanceId: "alcohol",
    triggerRecoveryThreshold: 0.1,
    achievementProgress: 0.4,
    progressAvailability: "ready",
  });
  const next = pickNextLockedAchievement(
    [
      fixture,
      row({ id: "hidden", hidden: true, achievementProgress: 0.9 }),
      row({ id: "done", unlocked: true, achievementProgress: 1 }),
    ],
    ["alcohol"],
  );
  assert.ok(next);
  assert.equal(next.id, "alcohol-liver-bronze-1");
  assert.deepEqual(
    quantifiableAchievementProgress({
      unlocked: next.unlocked,
      hidden: next.hidden,
      progressAvailability: next.progressAvailability,
      achievementProgress: next.achievementProgress,
      threshold: next.triggerRecoveryThreshold,
    }),
    { towardPercent: 40, thresholdPercent: 10, currentPercent: 4 },
  );

  const home = readFileSync(new URL("../components/PreviewHome.tsx", import.meta.url), "utf8");
  assert.match(home, /nextProgress\.towardPercent/);
  assert.match(home, /homeNextMilestoneProgress/);
  assert.match(home, /liveEnabled = Boolean\(user\) && base === "\/app"/);
  assert.equal(home.includes("demoAchievements"), false);
  assert.match(home, /lg:grid-cols-3/);
  assert.match(home, /fadeBottom/);
  assert.match(home, /HeroFilaments/);
});
