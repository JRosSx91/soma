import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { photoPlateFor } from "./photo-plate.ts";

const publicDir = join(dirname(fileURLToPath(import.meta.url)), "../../../public");

test("nature plates expose WebP srcset and keep the PNG fallback path", () => {
  const plate = photoPlateFor("/images/decoration/nature-7.png");
  assert.ok(plate);
  assert.equal(plate.png, "/images/decoration/nature-7.png");
  assert.equal(plate.width, 2142);
  assert.equal(plate.height, 734);
  assert.match(plate.webpSrcSet, /nature-7-960\.webp 960w/);
  assert.match(plate.webpSrcSet, /nature-7-1600\.webp 1600w/);
  assert.match(plate.webpSrcSet, /nature-7\.webp 2142w/);
  assert.equal(photoPlateFor("/images/decoration/expedition-map.png"), null);
});

test("generated WebP files exist next to PNG masters", () => {
  const nature1 = photoPlateFor("/images/decoration/nature-1.png");
  assert.ok(nature1);
  assert.equal(nature1.webpSrcSet.includes("1600w"), false);
  const files = [
    "images/decoration/nature-1.webp",
    "images/decoration/nature-1-960.webp",
    "images/decoration/nature-10.webp",
    "images/decoration/expedition-map.webp",
    "images/expedition/icons/knowledge-neuroscience-96.webp",
    "images/expedition/icons/knowledge-recovery-192.webp",
  ];
  for (const file of files) {
    assert.equal(existsSync(join(publicDir, file)), true, file);
  }
  assert.equal(existsSync(join(publicDir, "images/decoration/nature-1.png")), true);
  assert.equal(existsSync(join(publicDir, "images/decoration/expedition-map.png")), true);
});
