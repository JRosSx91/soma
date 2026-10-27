import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import type { AchievementWithUnlockState } from "../../achievements/types.js";
import {
  pickFeaturedUnlockedAchievement,
  pickNextLockedAchievement,
  pickRecentUnlockedAchievements,
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

test("next locked achievement ignores temporal medals", () => {
  const next = pickNextLockedAchievement(
    [
      row({
        id: "cannabis-temporal-1",
        family: "temporal",
        triggerOrganId: null,
        triggerRecoveryThreshold: null,
        triggerAbstinenceDays: 1,
        triggerSubstanceId: "cannabis",
        achievementProgress: 0.99,
      }),
      row({
        id: "curve-liver",
        triggerSubstanceId: "cannabis",
        achievementProgress: 0.4,
      }),
    ],
    ["cannabis"],
  );
  assert.equal(next?.id, "curve-liver");
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

test("featured unlocked achievement prefers the highest tier over a newer lower tier", () => {
  const featured = pickFeaturedUnlockedAchievement([
    row({
      id: "silver-new",
      tier: "silver",
      unlocked: true,
      unlockedAt: "2026-06-01T00:00:00.000Z",
    }),
    row({
      id: "platinum-old",
      tier: "platinum",
      unlocked: true,
      unlockedAt: "2026-01-01T00:00:00.000Z",
    }),
    row({
      id: "gold",
      tier: "gold",
      unlocked: true,
      unlockedAt: "2026-05-01T00:00:00.000Z",
    }),
  ]);
  assert.equal(featured?.id, "platinum-old");
});

test("recent unlocked achievements sort by real date and stop at four", () => {
  const recent = pickRecentUnlockedAchievements(
    [
      row({ id: "locked" }),
      row({ id: "old", unlocked: true, unlockedAt: "2026-01-01T00:00:00.000Z" }),
      row({ id: "mid", unlocked: true, unlockedAt: "2026-03-01T00:00:00.000Z" }),
      row({ id: "undated", unlocked: true, unlockedAt: null }),
      row({ id: "new", unlocked: true, unlockedAt: "2026-06-01T00:00:00.000Z" }),
      row({ id: "newer", unlocked: true, unlockedAt: "2026-08-01T00:00:00.000Z" }),
      row({ id: "newest", unlocked: true, unlockedAt: "2026-09-01T00:00:00.000Z" }),
    ],
    4,
  );
  assert.deepEqual(
    recent.map((item) => item.id),
    ["newest", "newer", "new", "mid"],
  );
  assert.equal(pickRecentUnlockedAchievements(null).length, 0);
  assert.equal(pickRecentUnlockedAchievements([row({ id: "locked" })]).length, 0);
});

test("recent unlocked achievements keep catalog order on equal dates and do not mutate input", () => {
  const same = "2026-04-01T12:00:00.000Z";
  const rows = [
    row({ id: "beta", unlocked: true, unlockedAt: same }),
    row({ id: "alpha", unlocked: true, unlockedAt: same }),
    row({ id: "invalid", unlocked: true, unlockedAt: "not-a-date" }),
    row({
      id: "missing",
      unlocked: true,
      unlockedAt: undefined as unknown as string | null,
    }),
  ];
  const snapshot = rows.map((item) => item.id);
  const recent = pickRecentUnlockedAchievements(rows, 4);
  assert.deepEqual(
    recent.map((item) => item.id),
    ["beta", "alpha", "invalid", "missing"],
  );
  assert.deepEqual(
    rows.map((item) => item.id),
    snapshot,
  );
  assert.equal(recent[0], rows[0]);
});

test("featured unlocked achievement breaks same-tier ties on unlockedAt", () => {
  const featured = pickFeaturedUnlockedAchievement([
    row({
      id: "gold-old",
      tier: "gold",
      unlocked: true,
      unlockedAt: "2026-01-01T00:00:00.000Z",
    }),
    row({
      id: "gold-new",
      tier: "gold",
      unlocked: true,
      unlockedAt: "2026-04-01T00:00:00.000Z",
    }),
  ]);
  assert.equal(featured?.id, "gold-new");
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
  const view = readFileSync(new URL("./achievements-view.ts", import.meta.url), "utf8");
  assert.match(view, /quantifiableAchievementProgress/);
  assert.match(page, /describeAchievement/);
  assert.equal(page.includes("daysToReachCurveProgress"), false);
  assert.equal(view.includes("daysToReachCurveProgress"), false);
});

test("achievements page localizes catalog titles through i18n keys", () => {
  const page = readFileSync(new URL("../pages/AchievementsPage.tsx", import.meta.url), "utf8");
  assert.match(page, /useTranslation\("achievements"\)/);
  assert.match(page, /\$\{item\.id\}\.title/);
  assert.match(page, /\$\{item\.id\}\.description/);
});

test("home next-milestone fixture stays calculable without a competing progress bar", () => {
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
  assert.equal(home.includes("nextProgress"), false);
  assert.equal(home.includes("homeNextMilestoneProgress"), false);
  assert.equal(home.includes("towardPercent"), false);
  assert.match(home, /homeDiscoveryHint/);
  assert.match(home, /homeDiscoveryTitle/);
  assert.match(home, /NextTemporalMedalCard/);
  assert.match(home, /pickNextLockedAchievement/);
  assert.match(home, /pickRecentUnlockedAchievements/);
  assert.match(home, /liveEnabled = Boolean\(user\) && base === "\/app"/);
  assert.equal(home.includes("demoAchievements"), false);
  assert.match(home, /lg:grid-cols-3/);
  assert.match(home, /HeroFigure/);
  assert.match(home, /HeroFilaments/);
});
