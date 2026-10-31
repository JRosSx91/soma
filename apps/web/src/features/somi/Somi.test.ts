import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  SOMI_IDLE_SRC,
  SOMI_SIZE_PX,
  SOMI_SIZES,
  SOMI_SRC_BY_STATE,
  SOMI_STATES,
  isSomiSize,
  isSomiState,
  resolveSomiSize,
  resolveSomiState,
  somiSrcFor,
} from "./somi-model.ts";

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = join(here, "../../../public/assets/somi");
const masterPath = join(here, "./masters/somi-idle.png");
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const riff = Buffer.from("RIFF");
const webp = Buffer.from("WEBP");
const component = readFileSync(new URL("./SomiView.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("./somi.css", import.meta.url), "utf8");
const account = readFileSync(
  new URL("../recovery-dashboard/pages/AccountPage.tsx", import.meta.url),
  "utf8",
);
const app = readFileSync(new URL("../../App.tsx", import.meta.url), "utf8");
const enAccount = JSON.parse(
  readFileSync(new URL("../../i18n/locales/en/account.json", import.meta.url), "utf8"),
) as Record<string, unknown>;
const esAccount = JSON.parse(
  readFileSync(new URL("../../i18n/locales/es/account.json", import.meta.url), "utf8"),
) as Record<string, unknown>;

test("six static WebP illustrations exist and map 1:1 to states", () => {
  assert.deepEqual([...SOMI_STATES], [
    "idle",
    "celebrating",
    "thinking",
    "sleeping",
    "waving",
    "supportive",
  ]);
  assert.equal(SOMI_IDLE_SRC, "/assets/somi/somi-idle.webp");
  assert.equal(somiSrcFor(undefined), SOMI_SRC_BY_STATE.idle);
  assert.equal(existsSync(masterPath), true, masterPath);
  for (const state of SOMI_STATES) {
    const src = SOMI_SRC_BY_STATE[state];
    assert.equal(src, `/assets/somi/somi-${state}.webp`);
    assert.equal(somiSrcFor(state), src);
    const pngFile = join(publicDir, `somi-${state}.png`);
    const webpFile = join(publicDir, `somi-${state}.webp`);
    assert.equal(existsSync(pngFile), true, pngFile);
    assert.equal(existsSync(webpFile), true, webpFile);
    const png = readFileSync(pngFile);
    assert.deepEqual(png.subarray(0, 8), pngSignature);
    assert.equal(png[25], 6, `${state} PNG should be RGBA`);
    const buf = readFileSync(webpFile);
    assert.deepEqual(buf.subarray(0, 4), riff);
    assert.deepEqual(buf.subarray(8, 12), webp);
  }
});

test("Somi states and sizes are closed unions with idle/medium fallbacks", () => {
  assert.deepEqual([...SOMI_SIZES], ["small", "medium", "large"]);
  assert.deepEqual(SOMI_SIZE_PX, { small: 72, medium: 112, large: 160 });
  assert.equal(isSomiState("idle"), true);
  assert.equal(isSomiState("waving"), true);
  assert.equal(isSomiState("happy"), false);
  assert.equal(isSomiSize("medium"), true);
  assert.equal(isSomiSize("xl"), false);
  assert.equal(resolveSomiState(undefined), "idle");
  assert.equal(resolveSomiSize(undefined), "medium");
});

test("component is static: one src per state, no CSS motion", () => {
  assert.match(component, /somiSrcFor\(resolvedState\)/);
  assert.equal(component.includes("animated"), false);
  assert.equal(component.includes("@keyframes"), false);
  assert.equal(css.includes("@keyframes"), false);
  assert.equal(css.includes("animation:"), false);
  assert.equal(css.includes("translateY"), false);
  assert.match(css, /object-fit:\s*contain/);
  assert.match(css, /pointer-events:\s*none/);
});

test("Somi stays decorative unless a label is provided", () => {
  assert.match(component, /aria-hidden=\{decorative \? true : undefined\}/);
  assert.match(component, /alt=\{decorative \? "" : label\}/);
});

test("Somi is not mounted on Account; App routes stay unchanged", () => {
  assert.equal(account.includes("SomiAccountPreview"), false);
  assert.equal(account.includes("Somi"), false);
  assert.equal(account.includes("somi"), false);
  assert.equal(app.includes("Somi"), false);
  assert.equal(app.includes("somi"), false);
  assert.equal("somiPreviewTitle" in esAccount, false);
  assert.equal("somiPreviewHint" in esAccount, false);
  assert.equal("somiPreviewTitle" in enAccount, false);
  assert.equal("somiPreviewHint" in enAccount, false);
});
