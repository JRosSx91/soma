import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { exploreNeurotransmitters } from "./explore-neurotransmitters.ts";
import {
  allExploreGraphicSources,
  exploreMissionsArt,
  exploreProcessArt,
  exploreProcessTopics,
  exploreNeurotransmitterArt,
} from "./explore-art.ts";

const publicRoot = join(dirname(fileURLToPath(import.meta.url)), "../../../../public");

test("explorer 2.0 ships fifteen graphic assets on disk", () => {
  const sources = allExploreGraphicSources();
  assert.equal(sources.length, 15);
  assert.equal(new Set(sources).size, 15);
  assert.equal(exploreNeurotransmitters.length, 9);
  assert.equal(exploreProcessTopics.length, 5);
  for (const id of exploreNeurotransmitters) {
    assert.match(exploreNeurotransmitterArt[id], new RegExp(`neurotransmitter-${id}\\.png$`));
  }
  for (const id of exploreProcessTopics) {
    assert.match(exploreProcessArt[id], new RegExp(`process-${id}\\.png$`));
  }
  assert.equal(exploreMissionsArt, "/images/missions/educational-missions.png");
  for (const src of sources) {
    assert.equal(existsSync(join(publicRoot, src.replace(/^\//, ""))), true, src);
  }
});
