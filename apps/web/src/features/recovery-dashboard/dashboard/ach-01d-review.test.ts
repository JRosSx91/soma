import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import enAchievements from "../../../i18n/locales/en/achievements.json" with { type: "json" };
import esAchievements from "../../../i18n/locales/es/achievements.json" with { type: "json" };
import { achievementCatalog } from "../achievement-catalog.generated.ts";
import type { AchievementWithUnlockState } from "../../achievements/types.js";
import {
  catalogFamilyCounts,
  catalogSharePercent,
  countProgressStats,
  hasUnlockRule,
  describeAchievement,
  filterCatalog,
  pickAchievementHighlights,
  type CatalogItem,
} from "./achievements-view.ts";
import { pickNextLockedAchievement, quantifiableAchievementProgress } from "./home-progress.ts";

const REVIEW_IDS = [
  "cocaine-hippocampus-gold-1",
  "caffeine-vta-bronze-1",
  "caffeine-vta-bronze-2",
  "caffeine-vta-silver-1",
  "caffeine-vta-silver-2",
  "caffeine-vta-silver-3",
  "caffeine-vta-silver-4",
] as const;

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
    triggerOrganId: "brain-vta",
    triggerSubstanceId: "caffeine",
    triggerRecoveryThreshold: 0.1,
    hidden: false,
    unlocked: false,
    unlockedAt: null,
    notifiedAt: null,
    family: "curve",
    achievementProgress: null,
    progressAvailability: "pending_review",
    ...partial,
  };
}

test("exactly seven catalog medals lack a grantable curve pair", () => {
  const review = achievementCatalog.filter((row) => row.ruleReview);
  assert.deepEqual(
    review.map((row) => row.id).sort(),
    [...REVIEW_IDS].sort(),
  );
  assert.equal(review.length, 7);
  assert.equal(achievementCatalog.length, 156);
  assert.equal(new Set(achievementCatalog.map((row) => row.id)).size, 156);
  for (const id of REVIEW_IDS) {
    assert.equal(item(id).family, "curve");
    assert.equal(item(id).ruleReview, true);
  }
  assert.equal(item("cocaine-hippocampus-gold-1").organId, "brain-hippocampus");
  assert.equal(item("cocaine-hippocampus-gold-1").substanceId, "cocaine");
  assert.equal(item("caffeine-vta-bronze-1").organId, "brain-vta");
  assert.equal(item("caffeine-heart-bronze").ruleReview, false);
  assert.equal(item("cocaine-vta-gold-1").ruleReview, false);
});

test("ruleReview medals are unavailable without invented progress", () => {
  const row = item("caffeine-vta-silver-1");
  const view = describeAchievement(row, undefined, null);
  assert.equal(view.review, true);
  assert.equal(view.unlocked, false);
  assert.equal(view.bucket, "unavailable");
  assert.equal(view.curveProgress, null);
  assert.equal(
    quantifiableAchievementProgress({
      unlocked: false,
      hidden: false,
      review: true,
      progressAvailability: "pending_review",
      achievementProgress: 0.8,
      threshold: 0.55,
    }),
    null,
  );
  const liveReview = describeAchievement(
    row,
    live({
      id: row.id,
      achievementProgress: 0.8,
      progressAvailability: "pending_review",
      triggerRecoveryThreshold: 0.55,
    }),
    null,
  );
  assert.equal(liveReview.bucket, "unavailable");
  assert.equal(liveReview.curveProgress, null);
});

test("an already earned medal is not relabeled unavailable", () => {
  const earned = describeAchievement(
    item("caffeine-vta-bronze-1"),
    live({
      id: "caffeine-vta-bronze-1",
      unlocked: true,
      unlockedAt: "2026-01-01T00:00:00.000Z",
      progressAvailability: "pending_review",
    }),
    null,
  );
  assert.equal(earned.unlocked, true);
  assert.equal(earned.review, false);
  assert.equal(earned.bucket, "unlocked");
});

test("unavailable medals stay out of next-up highlights and home next-curve", () => {
  const blocked = pickAchievementHighlights({
    catalogIds: new Set([...REVIEW_IDS, "alcohol-liver-bronze-1"]),
    recentUnlockedIds: [],
    temporalStates: [],
    nextCurveId: "caffeine-vta-bronze-1",
    excludeIds: new Set(REVIEW_IDS),
    limit: 4,
  });
  assert.deepEqual(blocked, []);
  const ids = pickAchievementHighlights({
    catalogIds: new Set([...REVIEW_IDS, "alcohol-liver-bronze-1"]),
    recentUnlockedIds: [],
    temporalStates: [],
    nextCurveId: "alcohol-liver-bronze-1",
    excludeIds: new Set(REVIEW_IDS),
    limit: 4,
  });
  assert.deepEqual(ids, ["alcohol-liver-bronze-1"]);
  const next = pickNextLockedAchievement(
    [
      live({
        id: "caffeine-vta-bronze-1",
        triggerSubstanceId: "caffeine",
        progressAvailability: "pending_review",
        achievementProgress: 0.9,
      }),
      live({
        id: "caffeine-heart-bronze",
        triggerOrganId: "heart",
        triggerSubstanceId: "caffeine",
        triggerRecoveryThreshold: 0.5,
        progressAvailability: "ready",
        achievementProgress: 0.4,
      }),
    ],
    ["caffeine"],
  );
  assert.equal(next?.id, "caffeine-heart-bronze");
});

test("filters separate unavailable medals from pending ones", () => {
  const liveById = new Map<string, AchievementWithUnlockState>();
  const unavailable = filterCatalog({
    catalog: achievementCatalog,
    liveById,
    temporalBySubstance: new Map(),
    showingLive: true,
    family: "all",
    substance: "all",
    tier: "all",
    status: "unavailable",
    query: "",
    titleFor: (row) => row.title,
  });
  assert.equal(unavailable.length, 7);
  assert.deepEqual(
    unavailable.map((row) => row.id).sort(),
    [...REVIEW_IDS].sort(),
  );
  const pending = filterCatalog({
    catalog: achievementCatalog,
    liveById,
    temporalBySubstance: new Map(),
    showingLive: false,
    family: "curve",
    substance: "caffeine",
    tier: "all",
    status: "locked",
    query: "",
    titleFor: (row) => row.title,
  });
  assert.equal(
    pending.some((row) => (REVIEW_IDS as readonly string[]).includes(row.id)),
    false,
  );
  assert.equal(pending.some((row) => row.id === "caffeine-heart-bronze"), true);
});

test("unavailable copy is ES/EN and never pending or clinical", () => {
  const es = (esAchievements as { ui: Record<string, string> }).ui;
  const en = (enAchievements as { ui: Record<string, string> }).ui;
  assert.equal(es.statusReview, "No disponible");
  assert.equal(en.statusReview, "Unavailable");
  assert.equal(es.unavailable, "No disponible");
  assert.equal(en.unavailable, "Unavailable");
  assert.equal(es.catalogLabel, "Disponibles");
  assert.equal(en.catalogLabel, "Available");
  assert.match(es.collectionPercentHint, /alcanzables/);
  assert.match(en.collectionPercentHint, /reachable/);
  assert.match(es.unavailableHint, /criterio de desbloqueo/);
  assert.match(en.unavailableHint, /unlock criterion/);
  assert.match(es.reviewDetail, /todavía no hay un criterio de desbloqueo/);
  assert.match(en.reviewDetail, /no unlock criterion available yet/);
  assert.doesNotMatch(es.statusReview, /Pendiente|ruleReview|Prisma/i);
  assert.doesNotMatch(en.statusReview, /Pending|ruleReview|Prisma/i);
  assert.doesNotMatch(es.reviewDetail, /Prisma|ruleReview/);
  assert.doesNotMatch(en.reviewDetail, /Prisma|ruleReview/);
});

test("collection progress uses reachable medals, not the 156 catalog ids", () => {
  const counts = catalogFamilyCounts(achievementCatalog);
  assert.equal(counts.total, 156);
  assert.equal(counts.unavailable, 7);
  assert.equal(counts.available, 149);
  assert.equal(achievementCatalog.filter((row) => !hasUnlockRule(row)).length, 7);
  const empty = countProgressStats(achievementCatalog, new Map(), new Map(), false);
  assert.equal(empty.catalogTotal, 156);
  assert.equal(empty.availableTotal, 149);
  assert.equal(empty.unavailableTotal, 7);
  assert.equal(empty.unlockedTotal, 0);
  assert.equal(empty.collectionTotal, 149);
  assert.equal(empty.collectionPercent, 0);
  const oneEarned = new Map([
    [
      "cannabis-temporal-1",
      live({
        id: "cannabis-temporal-1",
        family: "temporal",
        unlocked: true,
        unlockedAt: "2026-01-01T00:00:00.000Z",
        triggerOrganId: null,
        triggerSubstanceId: "cannabis",
        triggerRecoveryThreshold: null,
        progressAvailability: "ready",
        achievementProgress: 1,
      }),
    ],
  ]);
  const partial = countProgressStats(achievementCatalog, oneEarned, new Map(), true);
  assert.equal(partial.unlockedTotal, 1);
  assert.equal(partial.collectionTotal, 149);
  assert.equal(partial.collectionPercent, 1);
  const liveById = new Map<string, AchievementWithUnlockState>();
  for (const row of achievementCatalog) {
    if (!hasUnlockRule(row)) continue;
    liveById.set(
      row.id,
      live({
        id: row.id,
        family: row.family,
        unlocked: true,
        unlockedAt: "2026-01-01T00:00:00.000Z",
        triggerOrganId: row.organId,
        triggerSubstanceId: row.substanceId,
        triggerRecoveryThreshold: row.threshold,
        progressAvailability: "ready",
        achievementProgress: 1,
      }),
    );
  }
  const complete = countProgressStats(achievementCatalog, liveById, new Map(), true);
  assert.equal(complete.unlockedTotal, 149);
  assert.equal(complete.collectionTotal, 149);
  assert.equal(complete.collectionPercent, 100);
  liveById.set(
    "caffeine-vta-bronze-1",
    live({
      id: "caffeine-vta-bronze-1",
      unlocked: true,
      unlockedAt: "2025-01-01T00:00:00.000Z",
      triggerOrganId: "brain-vta",
      triggerSubstanceId: "caffeine",
      triggerRecoveryThreshold: 0.1,
      progressAvailability: "pending_review",
    }),
  );
  const withHistory = countProgressStats(achievementCatalog, liveById, new Map(), true);
  assert.equal(withHistory.unlockedTotal, 150);
  assert.equal(withHistory.availableTotal, 149);
  assert.equal(withHistory.unavailableTotal, 7);
  assert.equal(withHistory.collectionTotal, 150);
  assert.equal(withHistory.collectionPercent, 100);
  assert.equal(catalogSharePercent(150, 150), 100);
  assert.equal(catalogSharePercent(151, 150), 100);
});

test("ACH-01D does not change unlock persistence or shared math", () => {
  const adapter = readFileSync(
    new URL("../../../../../../packages/shared-types/src/recovery-math.ts", import.meta.url),
    "utf8",
  );
  const persist = readFileSync(
    new URL("../../../../../api/src/achievements/user-achievement-persist.ts", import.meta.url),
    "utf8",
  );
  const seed = readFileSync(
    new URL("../../../../../api/prisma/seed/achievements.ts", import.meta.url),
    "utf8",
  );
  const curves = readFileSync(
    new URL("../../../../../api/prisma/seed/recovery-curves.ts", import.meta.url),
    "utf8",
  );
  assert.match(adapter, /export function planAchievementUnlocks/);
  assert.match(persist, /ON CONFLICT \("userId", "achievementId"\) DO NOTHING/);
  assert.match(seed, /caffeine-vta-bronze-1/);
  assert.match(seed, /cocaine-hippocampus-gold-1/);
  assert.doesNotMatch(curves, /substanceId: "caffeine",\s*\n\s*organId: "brain-vta"/);
  assert.doesNotMatch(curves, /substanceId: "cocaine",\s*\n\s*organId: "brain-hippocampus"/);
});
