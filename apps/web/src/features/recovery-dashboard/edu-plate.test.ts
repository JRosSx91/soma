import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { eduPlateFor } from "./edu-plate.ts";
import { exploreMissionsArt, exploreProcessTopics } from "./explore/explore-art.ts";

const publicDir = join(dirname(fileURLToPath(import.meta.url)), "../../../public");

test("process plates expose a 240w thumb and native WebP with PNG fallback", () => {
  const plate = eduPlateFor("/images/processes/process-receptors.png");
  assert.ok(plate);
  assert.equal(plate.png, "/images/processes/process-receptors.png");
  assert.equal(plate.width, 499);
  assert.equal(plate.height, 656);
  assert.match(plate.webpSrcSet, /process-receptors-240\.webp 240w/);
  assert.match(plate.webpSrcSet, /process-receptors\.webp 499w/);
  assert.equal(eduPlateFor("/images/neurotransmitters/neurotransmitter-dopamine.png"), null);
});

test("missions banner exposes 960w and native WebP", () => {
  const plate = eduPlateFor(exploreMissionsArt);
  assert.ok(plate);
  assert.equal(plate.width, 1774);
  assert.equal(plate.height, 887);
  assert.match(plate.webpSrcSet, /educational-missions-960\.webp 960w/);
  assert.match(plate.webpSrcSet, /educational-missions\.webp 1774w/);
});

test("generated process and missions WebP sit next to PNG masters", () => {
  for (const id of exploreProcessTopics) {
    assert.equal(existsSync(join(publicDir, `images/processes/process-${id}.png`)), true, id);
    assert.equal(existsSync(join(publicDir, `images/processes/process-${id}.webp`)), true, id);
    assert.equal(
      existsSync(join(publicDir, `images/processes/process-${id}-240.webp`)),
      true,
      `${id}-240`,
    );
  }
  assert.equal(existsSync(join(publicDir, "images/missions/educational-missions.png")), true);
  assert.equal(existsSync(join(publicDir, "images/missions/educational-missions.webp")), true);
  assert.equal(existsSync(join(publicDir, "images/missions/educational-missions-960.webp")), true);
});
