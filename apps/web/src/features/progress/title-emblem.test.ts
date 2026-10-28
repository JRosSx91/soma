import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { PROGRESS_TITLE_IDS } from "@soma/shared-types";
import {
  TITLE_EMBLEM_SIZES,
  TITLE_EMBLEM_SRC,
  TITLE_EMBLEM_VARIANT_PX,
  isTitleEmblemSize,
  resolveTitleEmblemSize,
  resolveTitleEmblemSrc,
  titleEmblemVariantPx,
} from "./title-emblem.ts";

const here = dirname(fileURLToPath(import.meta.url));
const emblemsDir = join(here, "../../../public/images/progress/emblems");
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const webpRiff = Buffer.from("RIFF");
const webpWebp = Buffer.from("WEBP");

const component = readFileSync(new URL("./TitleEmblem.tsx", import.meta.url), "utf8");
const resolver = readFileSync(new URL("./title-emblem.ts", import.meta.url), "utf8");
const home = readFileSync(
  new URL("../recovery-dashboard/components/PreviewHome.tsx", import.meta.url),
  "utf8",
);
const explorer = home.slice(home.indexOf("function ExplorerSummary"));
const header = home.slice(home.indexOf("function HomeHeader"));
const hero = readFileSync(
  new URL("../recovery-dashboard/components/HeroFigure.tsx", import.meta.url),
  "utf8",
);
const nextMedal = readFileSync(
  new URL("../recovery-dashboard/components/NextTemporalMedalCard.tsx", import.meta.url),
  "utf8",
);

function assertWebp(file: string) {
  const head = readFileSync(file).subarray(0, 12);
  assert.deepEqual(head.subarray(0, 4), webpRiff);
  assert.deepEqual(head.subarray(8, 12), webpWebp);
}

test("nine catalog ids map to PNG masters and WebP variants", () => {
  assert.deepEqual(Object.keys(TITLE_EMBLEM_SRC), [...PROGRESS_TITLE_IDS]);
  assert.deepEqual([...TITLE_EMBLEM_VARIANT_PX], [128, 512]);
  for (const id of PROGRESS_TITLE_IDS) {
    const png = join(emblemsDir, `${id}.png`);
    assert.equal(existsSync(png), true, png);
    assert.deepEqual(readFileSync(png).subarray(0, 8), pngSignature);
    for (const px of TITLE_EMBLEM_VARIANT_PX) {
      assert.equal(TITLE_EMBLEM_SRC[id][px], `/images/progress/emblems/${id}-${px}.webp`);
      const webp = join(emblemsDir, `${id}-${px}.webp`);
      assert.equal(existsSync(webp), true, webp);
      assertWebp(webp);
    }
  }
});

test("TitleEmblem selects 128 WebP for small sizes and 512 WebP for 80+", () => {
  assert.equal(titleEmblemVariantPx(24), 128);
  assert.equal(titleEmblemVariantPx(40), 128);
  assert.equal(titleEmblemVariantPx(64), 128);
  assert.equal(titleEmblemVariantPx(80), 512);
  assert.equal(titleEmblemVariantPx(128), 512);
  assert.equal(
    resolveTitleEmblemSrc("cartographer", 40),
    "/images/progress/emblems/cartographer-128.webp",
  );
  assert.equal(
    resolveTitleEmblemSrc("cartographer", 128),
    "/images/progress/emblems/cartographer-512.webp",
  );
  assert.match(component, /resolveTitleEmblemSrc\(titleId, size\)/);
});

test("only the five approved display sizes are accepted", () => {
  assert.deepEqual([...TITLE_EMBLEM_SIZES], [24, 40, 64, 80, 128]);
  for (const size of TITLE_EMBLEM_SIZES) {
    assert.equal(isTitleEmblemSize(size), true);
    assert.equal(resolveTitleEmblemSize(size), size);
  }
  assert.equal(isTitleEmblemSize(32), false);
  assert.throws(() => resolveTitleEmblemSize(32 as never));
  assert.throws(() => titleEmblemVariantPx(32 as never));
});

test("emblem resolver rejects arbitrary client paths and unknown ids", () => {
  assert.throws(() => resolveTitleEmblemSrc("jedi" as never, 64));
  assert.throws(() =>
    resolveTitleEmblemSrc("/images/progress/emblems/walker-128.webp" as never, 64),
  );
  assert.equal(resolver.includes("src?:"), false);
  assert.equal(component.includes("src?:"), false);
  assert.equal(component.includes("props.src"), false);
});

test("TitleEmblem stays decorative unless a label is provided", () => {
  assert.match(component, /label\?: string/);
  assert.match(component, /decorative \? "" : label/);
  assert.match(component, /aria-hidden=\{decorative \? true : undefined\}/);
  assert.match(component, /object-contain/);
  assert.match(component, /overflow-visible/);
  assert.equal(component.includes("drop-shadow"), false);
  assert.equal(component.includes("box-shadow"), false);
  assert.equal(component.includes("rounded-full"), false);
});

test("Home, ExplorerSummary, HeroFigure and NextTemporalMedalCard do not mount emblems yet", () => {
  assert.equal(home.includes("TitleEmblem"), false);
  assert.equal(home.includes("HomeProgressIdentity"), false);
  assert.equal(home.includes("TitlePicker"), false);
  assert.equal(explorer.includes("TitleEmblem"), false);
  assert.equal(header.includes("TitleEmblem"), false);
  assert.equal(hero.includes("TitleEmblem"), false);
  assert.equal(nextMedal.includes("TitleEmblem"), false);
});
