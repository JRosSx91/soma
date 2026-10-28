import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  PROGRESS_LEVEL_MAX,
  progressFromTotalXp,
  totalXpToReach,
} from "@soma/shared-types";
import {
  DEMO_PROGRESS,
  DEMO_PROGRESS_EQUIPPED_TITLE_ID,
  DEMO_PROGRESS_LEVEL,
  DEMO_PROGRESS_TOTAL_XP,
  buildDemoProgress,
} from "./progress-demo.ts";
import { equipProgressView, progressViewFromTotalXp } from "./progress-model.ts";

const identity = readFileSync(new URL("./HomeProgressIdentity.tsx", import.meta.url), "utf8");
const home = readFileSync(
  new URL("../recovery-dashboard/components/PreviewHome.tsx", import.meta.url),
  "utf8",
);
const hook = readFileSync(new URL("./useProgress.ts", import.meta.url), "utf8");

test("DEMO identity fixture is level 12 cartographer at 4435 XP from the shared curve", () => {
  assert.equal(DEMO_PROGRESS_TOTAL_XP, 4435);
  assert.equal(DEMO_PROGRESS.totalXp, 4435);
  assert.equal(DEMO_PROGRESS.level, DEMO_PROGRESS_LEVEL);
  assert.equal(DEMO_PROGRESS.level, progressFromTotalXp(4435).level);
  assert.equal(DEMO_PROGRESS.equippedTitleId, DEMO_PROGRESS_EQUIPPED_TITLE_ID);
  assert.equal(DEMO_PROGRESS.percentToNextLevel, progressFromTotalXp(4435).percentToNextLevel);
  assert.deepEqual(DEMO_PROGRESS.unlockedTitleIds, progressFromTotalXp(4435).unlockedTitleIds);
});

test("equipped title stays independent from the highest unlocked title", () => {
  const walker = equipProgressView(DEMO_PROGRESS, "walker");
  assert.equal(walker.level, 12);
  assert.equal(walker.totalXp, 4435);
  assert.equal(walker.equippedTitleId, "walker");
  assert.ok(walker.unlockedTitleIds.includes("cartographer"));
  assert.notEqual(walker.equippedTitleId, walker.unlockedTitleIds.at(-1));
  assert.match(identity, /progress\.equippedTitleId/);
  assert.equal(identity.includes("unlockedTitleIds.at"), false);
  assert.equal(identity.includes("unlockedTitleIds["), false);
});

test("identity uses contract percent, remaining XP and cap copy without local formulas", () => {
  assert.match(identity, /percentToNextLevel/);
  assert.match(identity, /xpToNextLevel/);
  assert.match(identity, /xpIntoLevel/);
  assert.match(identity, /xpForNextLevel/);
  assert.match(identity, /role="progressbar"/);
  assert.match(identity, /aria-valuenow=\{percent\}/);
  assert.match(identity, /progress:levelCap/);
  assert.match(identity, /progress:xpRemaining/);
  assert.equal(identity.includes("totalXpToReach"), false);
  assert.equal(identity.includes("progressFromTotalXp"), false);
  assert.equal(identity.includes("DEMO_PROGRESS"), false);
  const capXp = totalXpToReach(PROGRESS_LEVEL_MAX);
  const cap = progressViewFromTotalXp(capXp, "expeditioner");
  assert.equal(cap.level, PROGRESS_LEVEL_MAX);
  assert.equal(cap.percentToNextLevel, 100);
  assert.equal(cap.xpToNextLevel, 0);
});

test("loading, error retry and updating states are represented", () => {
  assert.match(identity, /state === "loading"/);
  assert.match(identity, /state === "error"/);
  assert.match(identity, /live && !progress/);
  assert.match(identity, /t\("loadError"\)/);
  assert.match(identity, /t\("retry"\)/);
  assert.match(identity, /onClick=\{reload\}/);
  assert.match(identity, /aria-busy=\{updatingTitle/);
  assert.match(identity, /progress:updatingTitle/);
  assert.match(identity, /size=\{64\}/);
  assert.match(identity, /size=\{80\}/);
});

test("PreviewHome wires LIVE /app to useProgress and DEMO /preview to the local fixture", () => {
  assert.match(home, /useProgress/);
  assert.match(home, /HomeProgressIdentity/);
  assert.match(home, /live \? \(user\?\.id \?\? null\) : null/);
  assert.match(home, /dashboard\.mode === "live"/);
  assert.equal(home.includes("fetchMyProgress"), false);
  assert.equal(home.includes("/me/progress"), false);
  assert.equal(home.includes("patchEquippedTitle"), false);
  assert.equal(home.includes("TitlePicker"), false);
  assert.equal(home.includes("equipTitle"), false);
  assert.match(hook, /if \(!live\)/);
  assert.match(hook, /buildDemoProgress\(\)/);
  assert.match(hook, /setProgress\(null\);\s*setState\("error"\)/);
});

test("progress identity stays mounted while the recovery dashboard loads", () => {
  const loading = home.slice(home.indexOf("if (dashboard.loading)"), home.indexOf("if (dashboard.error)"));
  assert.match(loading, /HomeLead/);
  assert.match(loading, /progression=\{progression\}/);
  assert.match(loading, /recovery:loading/);
  assert.equal(loading.includes("NextTemporalMedalCard"), false);
  assert.equal(loading.includes("DEMO_PROGRESS"), false);
  assert.equal(loading.includes("buildDemoProgress"), false);
});

test("progress identity stays mounted when the recovery dashboard errors", () => {
  const failed = home.slice(home.indexOf("if (dashboard.error)"), home.indexOf("dashboard.emptyUsages"));
  assert.match(failed, /HomeLead/);
  assert.match(failed, /progression=\{progression\}/);
  assert.match(failed, /dashboard\.reload/);
  assert.match(failed, /recovery:loadError/);
  assert.equal(failed.includes("NextTemporalMedalCard"), false);
  assert.equal(failed.includes("DEMO_PROGRESS"), false);
});

test("Inicio without substances still mounts progress identity and keeps NextTemporalMedalCard elsewhere", () => {
  assert.match(home, /dashboard\.emptyUsages/);
  assert.match(home, /homeEmptyBody/);
  assert.match(home, /tracked=\{0\}/);
  assert.match(home, /progression=\{progression\}/);
  assert.match(home, /NextTemporalMedalCard/);
  assert.match(home, /HeroFigure/);
  assert.equal(home.includes("soma-hero.png"), false);
  assert.equal(home.includes("homeExplorerBar"), false);
  assert.equal(home.includes("homeExplorerNext"), false);
  const emptySlice = home.slice(
    home.indexOf("dashboard.emptyUsages"),
    home.indexOf("dashboard.substances.length === 0"),
  );
  assert.match(emptySlice, /HomeLead/);
  assert.match(emptySlice, /homeEmptyBody/);
  assert.equal(emptySlice.includes("NextTemporalMedalCard"), false);
});

test("progress error is handled by HomeProgressIdentity while the recovery board stays mounted", () => {
  const board = home.slice(home.indexOf("relative flex min-w-0 flex-col gap-2"));
  assert.match(board, /HomeLead/);
  assert.match(board, /progression=\{progression\}/);
  assert.match(board, /NextTemporalMedalCard/);
  assert.match(board, /SubstanceRow/);
  assert.match(identity, /state === "error"/);
  assert.match(identity, /live && !progress/);
  assert.equal(identity.includes("DEMO_PROGRESS"), false);
  assert.equal(home.includes("fetchMyProgress"), false);
});

test("DEMO builder remains local and does not call the progress API", () => {
  const demo = readFileSync(new URL("./progress-demo.ts", import.meta.url), "utf8");
  assert.equal(demo.includes("apiRequest"), false);
  assert.equal(demo.includes("/me/progress"), false);
  assert.equal(buildDemoProgress().equippedTitleId, "cartographer");
});
