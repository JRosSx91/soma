/**
 * SUP-ASSET-01 — one WebP per Support centre illustration. The cards never
 * show them wider than ~360 CSS px, so 768 px covers 2x screens and a srcset
 * would add files without a real saving. Does not replace PNG masters.
 * Re-runnable.
 */
import { spawnSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
const magick =
  process.env.MAGICK_BIN ??
  "C:\\Program Files\\ImageMagick-7.1.2-Q16-HDRI\\magick.exe";

if (!existsSync(magick)) {
  console.error("ImageMagick not found:", magick);
  process.exit(1);
}

const ART_QUALITY = "86";
const WIDTH = 768;

const illustrations = [
  "support-breathing",
  "support-mindfulness",
  "support-activity",
  "support-craving",
  "support-learning",
  "support-reading",
  "support-audio",
];

function kb(path) {
  return (statSync(path).size / 1024).toFixed(1);
}

console.log("SUP-ASSET-01 using", magick);
for (const id of illustrations) {
  const dir = join(webRoot, "public/images/support");
  const png = join(dir, `${id}.png`);
  const out = join(dir, `${id}.webp`);
  const result = spawnSync(
    magick,
    [png, "-strip", "-resize", `${WIDTH}x`, "-quality", ART_QUALITY, "-define", "webp:method=6", out],
    { stdio: "inherit" },
  );
  if (result.status !== 0) throw new Error(`magick failed for ${id}`);
  console.log(`${id}.webp ${kb(out)} KB`);
}
console.log("done");
