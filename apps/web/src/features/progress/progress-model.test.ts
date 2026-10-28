import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import {
  isProgressTitleUnlocked,
  progressFromTotalXp,
  unlockedProgressTitleIds,
} from "@soma/shared-types";
import {
  equipProgressView,
  parseProgressPayload,
  progressViewFromTotalXp,
} from "./progress-model.ts";
import {
  DEMO_PROGRESS,
  DEMO_PROGRESS_EQUIPPED_TITLE_ID,
  DEMO_PROGRESS_LEVEL,
  DEMO_PROGRESS_TOTAL_XP,
  buildDemoProgress,
} from "./progress-demo.ts";

test("LIVE payload is interpreted with shared contracts, not client formulas", () => {
  const parsed = parseProgressPayload({
    totalXp: 70,
    level: 99,
    xpIntoLevel: 0,
    xpToNextLevel: 1,
    xpForNextLevel: 1,
    percentToNextLevel: 50,
    unlockedTitleIds: ["expeditioner"],
    equippedTitleId: "walker",
  });
  const expected = progressFromTotalXp(70);
  assert.equal(parsed.level, expected.level);
  assert.equal(parsed.level, 2);
  assert.deepEqual(parsed.unlockedTitleIds, expected.unlockedTitleIds);
  assert.equal(parsed.equippedTitleId, "walker");
  assert.equal(parsed.percentToNextLevel, expected.percentToNextLevel);
});

test("invalid LIVE payloads are rejected instead of showing DEMO", () => {
  assert.throws(() => parseProgressPayload(null), /Invalid progress/);
  assert.throws(() => parseProgressPayload({ totalXp: -1, equippedTitleId: "walker" }));
  assert.throws(() =>
    parseProgressPayload({ totalXp: 0, equippedTitleId: "jedi" }),
  );
});

test("DEMO fixture is level 12 cartographer inside the shared curve band", () => {
  assert.equal(DEMO_PROGRESS.level, DEMO_PROGRESS_LEVEL);
  assert.equal(DEMO_PROGRESS.level, 12);
  assert.equal(DEMO_PROGRESS.equippedTitleId, DEMO_PROGRESS_EQUIPPED_TITLE_ID);
  assert.equal(DEMO_PROGRESS.equippedTitleId, "cartographer");
  assert.equal(DEMO_PROGRESS.totalXp, DEMO_PROGRESS_TOTAL_XP);
  const expected = progressFromTotalXp(DEMO_PROGRESS_TOTAL_XP);
  assert.equal(expected.level, 12);
  assert.ok(DEMO_PROGRESS.xpIntoLevel > 0);
  assert.ok(DEMO_PROGRESS.xpIntoLevel < DEMO_PROGRESS.xpForNextLevel);
  assert.deepEqual(DEMO_PROGRESS.unlockedTitleIds, unlockedProgressTitleIds(12));
  assert.deepEqual(DEMO_PROGRESS.unlockedTitleIds, [
    "walker",
    "explorer",
    "cartographer",
  ]);
  assert.equal(isProgressTitleUnlocked("cartographer", 12), true);
  assert.equal(isProgressTitleUnlocked("naturalist", 12), false);
});

test("DEMO title changes stay local and keep the same XP", () => {
  const explorer = equipProgressView(DEMO_PROGRESS, "explorer");
  assert.equal(explorer.equippedTitleId, "explorer");
  assert.equal(explorer.totalXp, DEMO_PROGRESS.totalXp);
  assert.equal(explorer.level, 12);
  assert.throws(() => equipProgressView(DEMO_PROGRESS, "naturalist"));
  const rebuilt = buildDemoProgress("walker");
  assert.equal(rebuilt.equippedTitleId, "walker");
  assert.equal(rebuilt.totalXp, DEMO_PROGRESS_TOTAL_XP);
});

test("locked equipped ids in a payload fall back without trusting the body level", () => {
  const view = progressViewFromTotalXp(0, "expeditioner");
  assert.equal(view.level, 1);
  assert.equal(view.equippedTitleId, "walker");
});

test("DEMO and model modules never call the progress API", () => {
  const demo = readFileSync(new URL("./progress-demo.ts", import.meta.url), "utf8");
  const model = readFileSync(new URL("./progress-model.ts", import.meta.url), "utf8");
  assert.equal(demo.includes("apiRequest"), false);
  assert.equal(demo.includes("fetchMyProgress"), false);
  assert.equal(model.includes("apiRequest"), false);
  assert.equal(model.includes("fetch("), false);
});
