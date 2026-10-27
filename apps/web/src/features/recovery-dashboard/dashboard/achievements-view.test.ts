import assert from "node:assert/strict";
import { test } from "node:test";
import type { TemporalMilestoneState } from "@soma/shared-types";
import { achievementCatalog } from "../achievement-catalog.generated.js";
import type { AchievementWithUnlockState } from "../../achievements/types.js";
import {
  catalogFamilyCounts,
  catalogSharePercent,
  countProgressStats,
  describeAchievement,
  filterCatalog,
  isSealedAchievement,
  matchesSearch,
  pickAchievementHighlights,
  platinumIdsOf,
  sortCatalog,
  temporalProgressForItem,
  type CatalogItem,
} from "./achievements-view.ts";

function item(id: string): CatalogItem {
  const found = achievementCatalog.find((row) => row.id === id);
  assert.ok(found, id);
  return found;
}

function live(
  partial: Partial<AchievementWithUnlockState> & Pick<AchievementWithUnlockState, "id">,
): AchievementWithUnlockState {
  return {
    tier: "bronze",
    titleKey: "x",
    descriptionKey: "y",
    triggerOrganId: "liver",
    triggerSubstanceId: "alcohol",
    triggerRecoveryThreshold: 0.1,
    hidden: false,
    unlocked: false,
    unlockedAt: null,
    notifiedAt: null,
    family: "curve",
    achievementProgress: 0.4,
    progressAvailability: "ready",
    ...partial,
  };
}

function upcoming(substanceId: string, days: number, remainingMs: number): TemporalMilestoneState {
  return {
    substanceId,
    status: "upcoming",
    daysAbstinent: Math.max(0, days - 1),
    next: {
      achievementId: `${substanceId}-temporal-${days}`,
      titleKey: `${substanceId}-temporal-${days}.title`,
      thresholdDays: days,
      dueAt: new Date("2026-12-01T00:00:00.000Z"),
      remainingMs,
      progress: 0.7,
      tier: days >= 60 ? "gold" : days >= 14 ? "silver" : "bronze",
    },
  };
}

test("catalog is 156 achievements split 106 curve and 50 temporal", () => {
  const counts = catalogFamilyCounts(achievementCatalog);
  assert.equal(counts.total, 156);
  assert.equal(counts.curve, 106);
  assert.equal(counts.temporal, 50);
  assert.equal(counts.curve + counts.temporal, 156);
});

test("secret bronzes stay sealed and platinums stay visible", () => {
  assert.equal(isSealedAchievement(item("alcohol-acute-survival-bronze"), false), true);
  assert.equal(isSealedAchievement(item("alcohol-sovereignty-platinum"), false), false);
  const platinum = platinumIdsOf(achievementCatalog);
  assert.equal(platinum.length, 4);
  assert.ok(platinum.includes("alcohol-sovereignty-platinum"));
  const view = describeAchievement(item("alcohol-sovereignty-platinum"), null, null);
  assert.equal(view.sealed, false);
  assert.equal(view.unlocked, false);
});

test("search does not match sealed secret titles", () => {
  const secret = item("alcohol-acute-survival-bronze");
  assert.equal(matchesSearch(secret, "tormenta", secret.title, true), false);
  assert.equal(matchesSearch(secret, "alcohol", secret.title, true), true);
  assert.equal(matchesSearch(item("alcohol-liver-bronze-1"), "Mordor", item("alcohol-liver-bronze-1").title, false), true);
});

test("combined filters keep temporal in-progress separate from curve percentages", () => {
  const liveById = new Map([
    [
      "alcohol-liver-bronze-1",
      live({
        id: "alcohol-liver-bronze-1",
        achievementProgress: 0.5,
        triggerRecoveryThreshold: 0.1,
      }),
    ],
  ]);
  const temporalBySubstance = new Map([["cannabis", upcoming("cannabis", 60, 8_000_000)]]);
  const filtered = filterCatalog({
    catalog: achievementCatalog,
    liveById,
    temporalBySubstance,
    showingLive: true,
    family: "temporal",
    substance: "cannabis",
    tier: "all",
    status: "in_progress",
    query: "",
    titleFor: (row) => row.title,
  });
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0]?.id, "cannabis-temporal-60");
  const curve = describeAchievement(
    item("alcohol-liver-bronze-1"),
    liveById.get("alcohol-liver-bronze-1") ?? null,
    null,
  );
  assert.equal(curve.bucket, "in_progress");
  assert.ok(curve.curveProgress);
  assert.equal(curve.temporal, null);
});

test("DEMO counts zero unlocks and only current temporal next as in progress", () => {
  const temporalBySubstance = new Map([["cannabis", upcoming("cannabis", 60, 4_000_000)]]);
  const stats = countProgressStats(achievementCatalog, new Map(), temporalBySubstance, false);
  assert.equal(stats.unlocked, 0);
  assert.equal(stats.inProgress, 1);
  const past = temporalProgressForItem(item("cannabis-temporal-7"), {
    substanceId: "cannabis",
    status: "upcoming",
    daysAbstinent: 42,
    next: upcoming("cannabis", 60, 1).next,
  });
  assert.equal(past?.isCurrentNext, false);
  assert.equal(past?.clockPassed, true);
});

test("highlights prefer real unlocks then next temporal then curve and never pad", () => {
  const ids = pickAchievementHighlights({
    catalogIds: new Set([
      "nicotine-temporal-7",
      "cannabis-temporal-60",
      "alcohol-liver-bronze-1",
      "cocaine-temporal-180",
    ]),
    recentUnlockedIds: ["nicotine-temporal-7"],
    temporalStates: [upcoming("cannabis", 60, 1000), upcoming("cocaine", 180, 5000)],
    nextCurveId: "alcohol-liver-bronze-1",
    limit: 4,
  });
  assert.deepEqual(ids, [
    "nicotine-temporal-7",
    "cannabis-temporal-60",
    "alcohol-liver-bronze-1",
    "cocaine-temporal-180",
  ]);
  const short = pickAchievementHighlights({
    catalogIds: new Set(["cannabis-temporal-60"]),
    recentUnlockedIds: [],
    temporalStates: [upcoming("cannabis", 60, 1000)],
    nextCurveId: "missing-curve",
    limit: 4,
  });
  assert.deepEqual(short, ["cannabis-temporal-60"]);
});

test("recent sort uses persisted unlockedAt and catalog share is against 156", () => {
  const liveById = new Map([
    [
      "alcohol-liver-bronze-1",
      live({ id: "alcohol-liver-bronze-1", unlocked: true, unlockedAt: "2026-10-01T00:00:00.000Z" }),
    ],
    [
      "alcohol-vta-bronze",
      live({ id: "alcohol-vta-bronze", unlocked: true, unlockedAt: "2026-10-20T00:00:00.000Z" }),
    ],
  ]);
  const sorted = sortCatalog(
    [item("alcohol-liver-bronze-1"), item("alcohol-vta-bronze")],
    "recent",
    liveById,
  );
  assert.equal(sorted[0]?.id, "alcohol-vta-bronze");
  assert.equal(catalogSharePercent(32, 156), 21);
  assert.equal(catalogSharePercent(0, 156), 0);
});
