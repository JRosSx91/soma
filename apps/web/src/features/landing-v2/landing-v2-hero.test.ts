import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const hero = readFileSync(
  fileURLToPath(new URL("./LandingV2Hero.tsx", import.meta.url)),
  "utf8",
);
const css = readFileSync(
  fileURLToPath(new URL("./landing-v2-hero.css", import.meta.url)),
  "utf8",
);
const page = readFileSync(
  fileURLToPath(new URL("./LandingV2Page.tsx", import.meta.url)),
  "utf8",
);

test("short viewports reuse the xl overlay crop instead of stacked md", () => {
  assert.match(hero, /landing-v2-hero\.css/);
  assert.match(hero, /className="landing-v2-hero /);
  assert.match(css, /max-height:\s*31\.25rem/);
  assert.match(css, /object-position:\s*70%\s*42%/);
  assert.match(hero, /xl:object-\[70%_42%\]/);
  assert.equal((hero.match(/object-\[/g) ?? []).length, 5);
  assert.equal(css.includes("orientation:"), false);
});

test("hero titles over the photograph use the shared photo copy veil", () => {
  const veil = readFileSync(
    fileURLToPath(new URL("../recovery-dashboard/components/photo-copy.css", import.meta.url)),
    "utf8",
  );
  assert.match(hero, /soma-photo-copy-veil/);
  assert.match(hero, /soma-photo-copy-veil__plate/);
  assert.match(hero, /landing-v2-hero__title soma-photo-copy/);
  assert.match(hero, /landing-v2-hero__subtitle soma-photo-copy/);
  assert.match(veil, /soma-photo-copy-veil__plate/);
  assert.match(veil, /rgb\(8 16 24 \/ 0\.74\)/);
  assert.match(veil, /filter:\s*blur\(44px\)/);
  assert.match(veil, /overflow:\s*visible/);
});

test("mobile disclaimer stays under the primary actions", () => {
  const ctaAt = hero.indexOf("LandingRegistrationActions");
  const disclaimerAt = hero.indexOf("landing-v2-hero__disclaimer");
  assert.ok(ctaAt >= 0 && disclaimerAt > ctaAt);
  assert.match(css, /margin-top:\s*1\.25rem/);
  assert.equal(css.includes("2.75rem + 55px"), false);
});

test("short hero copy can grow instead of clipping CTAs", () => {
  assert.match(hero, /overflow-x-hidden/);
  assert.equal(hero.includes("overflow-hidden bg-[#081018]"), false);
  assert.match(hero, /landing-v2-hero__art[^"]*overflow-hidden/);
  assert.match(css, /overflow-y:\s*visible/);
  assert.match(css, /justify-content:\s*flex-start/);
});

test("landing intro first-paint gate is unchanged", () => {
  assert.match(page, /shouldPlayLandingV2Intro\(\)/);
  assert.equal(page.includes("shouldPlayLandingV2Intro,"), false);
});

test("landing still mounts the existing page tree", () => {
  assert.match(page, /<LandingV2Header \/>/);
  assert.match(page, /<LandingV2Hero \/>/);
  assert.match(page, /<LandingV2Journey \/>/);
  assert.match(page, /<LandingV2Atlas \/>/);
  assert.match(page, /<LandingV2Science \/>/);
  assert.match(page, /<LandingV2Methodology \/>/);
  assert.match(page, /<LandingV2Origin \/>/);
  assert.match(page, /<LandingV2MissionsJournal \/>/);
  assert.match(page, /<LandingV2Achievements \/>/);
  assert.match(page, /<LandingV2Closing \/>/);
  const originAt = page.indexOf("<LandingV2Origin />");
  const pathAt = page.indexOf("<LandingV2MissionsJournal />");
  const methodAt = page.indexOf("<LandingV2Methodology />");
  const achievementsAt = page.indexOf("<LandingV2Achievements />");
  assert.ok(
    methodAt >= 0 &&
      originAt > methodAt &&
      pathAt > originAt &&
      achievementsAt > pathAt,
  );
});
