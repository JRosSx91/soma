import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import enRecovery from "../../../i18n/locales/en/recovery.json" with { type: "json" };
import esRecovery from "../../../i18n/locales/es/recovery.json" with { type: "json" };

const home = readFileSync(new URL("./PreviewHome.tsx", import.meta.url), "utf8");

test("home 2.0 answers where I am, what I earned, and what comes next", () => {
  assert.match(home, /homeRecoveryTitle/);
  assert.match(home, /NextTemporalMedalCard/);
  assert.match(home, /TemporalEmpty/);
  assert.match(home, /homeExploreTitle/);
  assert.match(home, /homeDiscoveryTitle/);
  assert.match(home, /homeRecentTitle/);
  assert.match(home, /homeActivityTitle/);
  assert.match(home, /homeAdviceTitle/);
  assert.match(home, /HorizonCard/);
  assert.match(home, /pickNextLockedAchievement/);
  assert.match(home, /pickRecentUnlockedAchievements\(achievements\.rows, 4\)/);
  assert.equal(home.includes("quantifiableAchievementProgress"), false);
  assert.equal(home.includes("XP"), false);
  assert.equal(home.includes("nivel"), false);
  assert.equal(home.includes("demoAchievements"), false);
});

test("home keeps DEMO catalog-only medals and LIVE account unlocks", () => {
  assert.match(home, /liveEnabled = Boolean\(user\) && base === "\/app"/);
  assert.match(home, /liveEnabled \? pickRecentUnlockedAchievements/);
  assert.match(home, /homeRecentEmptyDemo/);
  assert.match(home, /homeRecentEmptyLive/);
  assert.match(home, /homeActivityEmptyDemo/);
  assert.match(home, /homeExplorerMedalsNone/);
  assert.match(home, /homeRecentLoading/);
  assert.match(home, /homeRecentError/);
  assert.match(home, /dashboard\.loading/);
  assert.match(home, /dashboard\.error/);
  assert.match(home, /homeEmptyBody/);
  assert.match(home, /goOnboarding/);
  assert.match(home, /dashboard\.substances\.length === 0\) return null/);
});

test("home 2.0 uses a three-band expedition board", () => {
  assert.match(home, /lg:grid-cols-3/);
  assert.match(home, /AnatomyColumn/);
  assert.match(home, /ExplorerSummary/);
  assert.match(home, /SubstanceRow/);
  assert.match(home, /RecommendedExploration/);
  assert.match(home, /HomeSubstanceCard/);
  assert.match(home, /recoveryHref\(basePath, substance\.id\)/);
  assert.match(home, /temporalById\.get\(substance\.id\)/);
  assert.match(home, /\$\{base\}\/achievements/);
  assert.match(home, /\$\{base\}\/anatomy/);
  assert.match(home, /max-w-\[16rem\]/);
  assert.match(home, /nature-1\.png/);
  assert.match(home, /temporalBarFill\(remainingProgressPercent\(next\.progress\)\)/);
  assert.match(home, /backgroundColor: "rgb\(var\(--soma-shell-accent\)\)"/);
  assert.match(home, /remainingProgressPercent\(next\.progress\)/);
  assert.equal(home.includes("substance.bar"), false);
  assert.match(home, /layout="home"/);
  assert.match(home, /homeExplorerBar/);
  assert.match(home, /homeAnatomyBody/);
  assert.equal(home.includes("lg:hidden"), false);
  assert.equal(home.includes("homeHorizonCaption"), false);
});

test("home 2.0 copy exists in spanish and english", () => {
  const keys = [
    "homeNextMedal",
    "homeNextMedalDays",
    "homeNextMedalLead",
    "homeExplorerTitle",
    "homeExplorerIdentity",
    "homeExplorerBar",
    "homeExplorerTracked",
    "homeExplorerMedals",
    "homeExplorerMedalsNone",
    "homeExplorerNext",
    "homeExplorerNextNone",
    "homeExploreTitle",
    "homeExploreFallback",
    "homeDiscoveryTitle",
    "homeDiscoveryHint",
    "homeDiscoveryCta",
    "homeRecentTitle",
    "homeActivityTitle",
    "homeActivityUnlock",
    "homeActivityEmptyLive",
    "homeActivityEmptyDemo",
    "homeAdviceTitle",
    "homeAdviceEyebrow",
    "homeHorizonCaption",
  ] as const;
  for (const key of keys) {
    assert.equal(typeof esRecovery[key], "string", key);
    assert.equal(typeof enRecovery[key], "string", key);
    assert.notEqual(esRecovery[key], enRecovery[key], key);
  }
});
