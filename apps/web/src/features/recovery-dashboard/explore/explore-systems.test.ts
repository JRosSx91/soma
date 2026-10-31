import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { atlasSystems } from "../anatomy/atlas-config.ts";
import {
  canExpandExploreList,
  collapseExploreIds,
  exploreSystemArtOverride,
  exploreSystemCardSources,
  exploreSystemOrganFallback,
  featuredExploreSystemIds,
  firstEducationalSentence,
} from "./explore-systems.ts";

const publicRoot = join(dirname(fileURLToPath(import.meta.url)), "../../../../public");

test("featured explore systems are the first five atlas systems", () => {
  assert.deepEqual([...featuredExploreSystemIds], [
    "nervous-central",
    "cardiovascular",
    "respiratory",
    "digestive",
    "hepatic",
  ]);
  assert.equal(atlasSystems.length, 12);
  assert.equal(Object.keys(exploreSystemArtOverride).length, 0);
});

test("explore system cards fall back to existing organ plates, not new files", () => {
  assert.deepEqual(exploreSystemCardSources("nervous-central", "/images/anatomy/system-central-nervous.png"), [
    "/images/anatomy/brain.png",
  ]);
  assert.deepEqual(exploreSystemCardSources("digestive", "/images/anatomy/system-digestive.png"), [
    "/images/anatomy/digestive.png",
  ]);
  assert.deepEqual(exploreSystemCardSources("renal", "/images/anatomy/system-renal.png"), [
    "/images/anatomy/kidneys.png",
  ]);
  assert.deepEqual(exploreSystemCardSources("immune", "/images/anatomy/system-immune.png"), [
    "/images/anatomy/spleen.png",
  ]);
  assert.deepEqual(exploreSystemCardSources("reproductive", "/images/anatomy/system-reproductive.png"), [
    "/images/anatomy/reproductive.png",
  ]);
  assert.deepEqual(exploreSystemCardSources("integumentary", "/images/anatomy/system-integumentary.png"), [
    "/images/anatomy/skin.png",
  ]);
  assert.deepEqual(exploreSystemCardSources("sensory", "/images/anatomy/system-sensory.png"), [
    "/images/anatomy/eyes.png",
  ]);
  assert.deepEqual(exploreSystemCardSources("endocrine", "/images/anatomy/system-endocrine.png"), [
    "/images/anatomy/endocrine.png",
  ]);
  assert.deepEqual(
    exploreSystemCardSources("nervous-peripheral", "/images/anatomy/system-peripheral-nervous.png"),
    ["/images/anatomy/peripheral-nerves.png"],
  );
  for (const srcs of Object.values(exploreSystemOrganFallback)) {
    for (const src of srcs) {
      assert.equal(existsSync(join(publicRoot, src.replace(/^\//, ""))), true, src);
      assert.equal(src.includes("/images/anatomy/system-"), false, src);
    }
  }
  for (const system of atlasSystems) {
    const srcs = exploreSystemCardSources(system.id, system.plates.anterior?.src);
    assert.ok(srcs.length > 0, system.id);
    assert.equal(srcs.some((src) => src.includes("/images/anatomy/system-")), false, system.id);
  }
});

test("system cards reuse the first sentence of an existing intro", () => {
  assert.equal(
    firstEducationalSentence(
      "El sistema cardiovascular hace circular la sangre. El corazón impulsa oxígeno.",
    ),
    "El sistema cardiovascular hace circular la sangre.",
  );
  assert.equal(firstEducationalSentence(""), "");
  assert.equal(firstEducationalSentence("Sin punto"), "Sin punto");
});

test("collapse keeps featured systems until expand or search", () => {
  const matched = atlasSystems.map((system) => system.id);
  assert.deepEqual(collapseExploreIds(matched, featuredExploreSystemIds, false, ""), [
    ...featuredExploreSystemIds,
  ]);
  assert.equal(collapseExploreIds(matched, featuredExploreSystemIds, true, "").length, 12);
  assert.deepEqual(collapseExploreIds(["renal", "hepatic"], featuredExploreSystemIds, false, "riñ"), [
    "renal",
    "hepatic",
  ]);
  assert.equal(canExpandExploreList(12, 5, false, ""), true);
  assert.equal(canExpandExploreList(12, 12, true, ""), false);
  assert.equal(canExpandExploreList(1, 1, false, "higado"), false);
});
