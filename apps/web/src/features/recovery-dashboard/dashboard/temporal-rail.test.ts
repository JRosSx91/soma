import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import {
  nextTemporalMilestone,
  TEMPORAL_THRESHOLDS,
  temporalAchievementId,
} from "@soma/shared-types";
import {
  buildTemporalRail,
  temporalRailProgressRatio,
  temporalRailReachedCount,
} from "./temporal-rail.ts";

const lastUse = new Date("2026-01-01T00:00:00.000Z");

test("rail lists the ten GAME-01 thresholds for one substance", () => {
  const state = nextTemporalMilestone({
    usage: { substanceId: "cannabis", status: "abstinent", lastUseDate: lastUse },
    now: new Date(lastUse.getTime() + 47 * 86_400_000),
  });
  const nodes = buildTemporalRail(state);
  assert.equal(nodes.length, 10);
  assert.deepEqual(
    nodes.map((node) => node.thresholdDays),
    [...TEMPORAL_THRESHOLDS],
  );
  assert.equal(state.next?.thresholdDays, 60);
  assert.equal(nodes.find((node) => node.thresholdDays === 60)?.mark, "current");
  assert.equal(nodes.find((node) => node.thresholdDays === 30)?.mark, "complete");
  assert.equal(nodes.find((node) => node.thresholdDays === 90)?.mark, "upcoming");
  assert.equal(temporalRailReachedCount(nodes), 6);
});

test("rail does not invent persisted unlocks", () => {
  const state = nextTemporalMilestone({
    usage: { substanceId: "cannabis", status: "abstinent", lastUseDate: lastUse },
    now: new Date(lastUse.getTime() + 47 * 86_400_000),
  });
  const unlocked = temporalAchievementId("cannabis", 7);
  const nodes = buildTemporalRail(state, new Set([unlocked]));
  assert.equal(nodes.find((node) => node.thresholdDays === 7)?.persistedUnlock, true);
  assert.equal(nodes.find((node) => node.thresholdDays === 1)?.persistedUnlock, false);
  assert.equal(nodes.find((node) => node.thresholdDays === 30)?.clockReached, true);
});

test("rail fill interpolates between adjacent GAME-01 thresholds", () => {
  const last = TEMPORAL_THRESHOLDS.length - 1;
  const at = (days: number) => temporalRailProgressRatio(days);
  const indexOf = (days: number) => TEMPORAL_THRESHOLDS.indexOf(days);

  assert.equal(at(Number.NaN), 0);
  assert.equal(temporalRailProgressRatio(null), 0);
  assert.equal(at(0), 0);
  assert.equal(at(1), indexOf(1) / last);
  assert.equal(at(2), (indexOf(1) + (2 - 1) / (3 - 1)) / last);
  assert.equal(at(30), indexOf(30) / last);
  assert.equal(at(90), indexOf(90) / last);
  const ninetyFive = (indexOf(90) + (95 - 90) / (180 - 90)) / last;
  assert.equal(at(95), ninetyFive);
  assert.ok(at(95) > at(90));
  assert.ok(at(95) < at(180));
  assert.equal(at(179), (indexOf(90) + (179 - 90) / (180 - 90)) / last);
  assert.equal(at(180), indexOf(180) / last);
  assert.equal(at(365), 1);
  assert.equal(at(400), 1);
  assert.ok(at(95) < 1);
});

test("recovery 2.0 page keeps GAME-02 helpers and omits XP", () => {
  const page = readFileSync(new URL("../pages/RecoveryPage.tsx", import.meta.url), "utf8");
  const card = readFileSync(new URL("../components/SubstanceCard.tsx", import.meta.url), "utf8");
  const hero = readFileSync(new URL("../components/RecoveryHero.tsx", import.meta.url), "utf8");
  assert.match(page, /RecoveryHero/);
  assert.match(page, /compactHeader/);
  assert.match(hero, /compactHeader/);
  assert.match(hero, /SHELL_HERO_BLEED_EXPANDED_CLASS/);
  assert.match(hero, /nature-2\.png/);
  assert.match(page, /TemporalThresholdRail/);
  assert.match(page, /RecoveryFocusPanel/);
  assert.equal((page.match(/<TemporalThresholdRail/g) ?? []).length, 1);
  assert.match(page, /useTemporalMilestones/);
  assert.equal(page.includes("Nivel"), false);
  assert.equal(page.includes("XP"), false);
  assert.equal(card.includes("substance.bar"), false);
  assert.match(card, /temporalBarFill/);
  assert.equal(page.includes('tab !== "timeline"'), false);
});
