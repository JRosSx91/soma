import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  SOMI_IDLE_SRC,
  SOMI_SIZE_PX,
  SOMI_SIZES,
  SOMI_STATES,
  isSomiSize,
  isSomiState,
  resolveSomiSize,
  resolveSomiState,
} from "./somi-model.ts";

const here = dirname(fileURLToPath(import.meta.url));
const webpPath = join(here, "../../../public/assets/somi/somi-idle.webp");
const masterPath = join(here, "./masters/somi-idle.png");
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const component = readFileSync(new URL("./SomiView.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("./somi.css", import.meta.url), "utf8");
const preview = readFileSync(new URL("./SomiAccountPreview.tsx", import.meta.url), "utf8");
const account = readFileSync(
  new URL("../recovery-dashboard/pages/AccountPage.tsx", import.meta.url),
  "utf8",
);
const app = readFileSync(new URL("../../App.tsx", import.meta.url), "utf8");
const enAccount = JSON.parse(
  readFileSync(new URL("../../i18n/locales/en/account.json", import.meta.url), "utf8"),
) as Record<string, string>;
const esAccount = JSON.parse(
  readFileSync(new URL("../../i18n/locales/es/account.json", import.meta.url), "utf8"),
) as Record<string, string>;

test("idle sprite is a lossless-alpha WebP; PNG master stays off the public tree", () => {
  assert.equal(SOMI_IDLE_SRC, "/assets/somi/somi-idle.webp");
  assert.equal(existsSync(webpPath), true, webpPath);
  assert.equal(existsSync(masterPath), true, masterPath);
  const webp = readFileSync(webpPath);
  assert.equal(webp.toString("ascii", 0, 4), "RIFF");
  assert.equal(webp.toString("ascii", 8, 12), "WEBP");
  assert.equal(webp.includes(Buffer.from("VP8X")), true, "VP8X chunk marks a WebP with extra features (alpha)");
  assert.equal(webp.includes(Buffer.from("ALPH")), true, "ALPH chunk should carry transparency");
  assert.ok(webp.length < 150 * 1024, `webp should stay under 150KB, got ${webp.length}`);
  const master = readFileSync(masterPath);
  assert.deepEqual(master.subarray(0, 8), pngSignature);
  assert.equal(master[25], 6, "master PNG color type should be RGBA");
  assert.equal(existsSync(join(here, "../../../public/assets/somi/somi-idle.png")), false);
});

test("Somi states and sizes are closed unions with fallbacks", () => {
  assert.deepEqual([...SOMI_STATES], [
    "idle",
    "happy",
    "celebrating",
    "supportive",
    "sleeping",
  ]);
  assert.deepEqual([...SOMI_SIZES], ["small", "medium", "large"]);
  assert.deepEqual(SOMI_SIZE_PX, { small: 72, medium: 112, large: 160 });
  assert.equal(isSomiState("idle"), true);
  assert.equal(isSomiState("sad"), false);
  assert.equal(isSomiSize("medium"), true);
  assert.equal(isSomiSize("xl"), false);
  assert.equal(resolveSomiState(undefined), "idle");
  assert.equal(resolveSomiSize(undefined), "medium");
});

test("one idle image for every mood; motion is CSS transform only", () => {
  assert.match(component, /SOMI_IDLE_SRC/);
  assert.equal(component.includes("filter:"), false);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /transform:/);
  assert.equal(css.includes("filter:"), false);
  for (const state of SOMI_STATES) {
    assert.match(css, new RegExp(`somi-motion-${state}`));
  }
});

test("Somi stays decorative unless a label is provided", () => {
  assert.match(component, /aria-hidden=\{decorative \? true : undefined\}/);
  assert.match(component, /alt=\{decorative \? "" : label\}/);
});

test("account hosts an isolated preview; landing and App routes stay unchanged", () => {
  assert.match(account, /SomiAccountPreview/);
  assert.match(preview, /useTranslation\("account"\)/);
  assert.equal(app.includes("Somi"), false);
  assert.equal(app.includes("somi"), false);
  assert.equal(typeof esAccount.somiPreviewTitle, "string");
  assert.equal(typeof enAccount.somiPreviewTitle, "string");
  assert.equal(typeof esAccount.somiPreviewHint, "string");
  assert.equal(typeof enAccount.somiPreviewHint, "string");
  assert.match(esAccount.somiPreviewHint, /salud|recuperación/i);
  assert.match(enAccount.somiPreviewHint, /health|recovery/i);
});
