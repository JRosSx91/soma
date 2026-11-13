import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { landingPhotoFor } from "./landing-photo.js";

const publicRoot = fileURLToPath(new URL("../../../public", import.meta.url));

function publicFile(urlPath: string): string {
  return `${publicRoot}${urlPath}`;
}

test("hero plate exposes responsive WebP srcset without lazy requirement", () => {
  const plate = landingPhotoFor("/images/landing-v2/hero-holographic-anatomy.png");
  assert.ok(plate);
  assert.match(plate!.webpSrcSet, /hero-holographic-anatomy-768\.webp 768w/);
  assert.match(plate!.webpSrcSet, /hero-holographic-anatomy-1280\.webp 1280w/);
  assert.match(plate!.webpSrcSet, /hero-holographic-anatomy\.webp 1828w/);
  assert.equal(existsSync(publicFile("/images/landing-v2/hero-holographic-anatomy.webp")), true);
  assert.equal(existsSync(publicFile("/images/landing-v2/hero-holographic-anatomy-768.webp")), true);
});

test("decorative backgrounds keep PNG masters and ship WebP steps", () => {
  for (const id of [
    "soma-journey-bg",
    "soma-atlas-bg",
    "soma-science-bg",
    "soma-methodology-bg",
    "soma-origin-bg",
    "soma-missions-journal-bg",
    "soma-achievements-bg",
  ]) {
    const png = `/images/landing-v2/${id}.png`;
    const plate = landingPhotoFor(png);
    assert.ok(plate, id);
    assert.equal(existsSync(publicFile(png)), true, png);
    assert.equal(existsSync(publicFile(`/images/landing-v2/${id}.webp`)), true, `${id}.webp`);
    assert.equal(existsSync(publicFile(`/images/landing-v2/${id}-960.webp`)), true, `${id}-960`);
  }
});

test("showcase medals keep alpha PNG masters with compact WebP thumbs", () => {
  for (const id of [
    "nicotine-bronze",
    "alcohol-bronze",
    "alcohol-gold",
    "nicotine-gold",
    "cannabis-gold",
  ]) {
    const plate = landingPhotoFor(`/images/achievements/${id}.png`);
    assert.ok(plate, id);
    assert.match(plate!.webpSrcSet, new RegExp(`${id}-256\\.webp 256w`));
    assert.match(plate!.webpSrcSet, new RegExp(`${id}-512\\.webp 512w`));
    assert.equal(existsSync(publicFile(`/images/achievements/${id}.png`)), true);
    assert.equal(existsSync(publicFile(`/images/achievements/${id}-256.webp`)), true);
  }
});

test("unknown or non-landing PNG paths stay without WebP catalog entry", () => {
  assert.equal(landingPhotoFor("/images/decoration/nature-10.png"), null);
  assert.equal(landingPhotoFor("/images/achievements/caffeine-bronze.png"), null);
});
