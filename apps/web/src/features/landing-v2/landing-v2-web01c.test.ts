import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import en from "../../i18n/locales/en/landing-v2.json" with { type: "json" };
import es from "../../i18n/locales/es/landing-v2.json" with { type: "json" };

const publicDir = fileURLToPath(
  new URL("../../../public/images/landing-v2/", import.meta.url),
);

function source(name: string): string {
  return readFileSync(new URL(`./${name}`, import.meta.url), "utf8");
}

test("approved decorative backgrounds exist and are wired as decorative images", () => {
  const files = {
    journey: "soma-journey-bg.png",
    atlas: "soma-atlas-bg.png",
    science: "soma-science-bg.png",
    methodology: "soma-methodology-bg.png",
    achievements: "soma-achievements-bg.png",
  } as const;
  const sources = {
    journey: source("LandingV2Journey.tsx"),
    atlas: source("LandingV2Atlas.tsx"),
    science: source("LandingV2Science.tsx"),
    methodology: source("LandingV2Methodology.tsx"),
    achievements: source("LandingV2Achievements.tsx"),
  };
  for (const [key, file] of Object.entries(files)) {
    assert.equal(existsSync(`${publicDir}${file}`), true, file);
    assert.match(sources[key as keyof typeof sources], new RegExp(`/images/landing-v2/${file}`));
    assert.match(sources[key as keyof typeof sources], /alt=""/);
  }
});

test("hero origin and missions-journal stay on their own assets", () => {
  const hero = source("LandingV2Hero.tsx");
  const origin = source("LandingV2Origin.tsx");
  const path = source("LandingV2MissionsJournal.tsx");
  assert.match(hero, /hero-holographic-anatomy/);
  assert.doesNotMatch(
    hero,
    /soma-journey-bg|soma-atlas-bg|soma-science-bg|soma-methodology-bg|soma-achievements-bg/,
  );
  assert.match(origin, /soma-origin-bg/);
  assert.match(path, /soma-missions-journal-bg/);
});

test("achievements intro drops the obsolete 106 count", () => {
  const achievements = source("LandingV2Achievements.tsx");
  assert.equal(achievements.includes("CATALOG_COUNT"), false);
  assert.equal(achievements.includes("106"), false);
  assert.equal(es.achievements.intro.includes("106"), false);
  assert.equal(en.achievements.intro.includes("106"), false);
  assert.match(es.achievements.intro, /hitos ligados/);
  assert.match(en.achievements.intro, /milestones tied/);
});

test("hidden showcase medals show a lock label without a tier", () => {
  const achievements = source("LandingV2Achievements.tsx");
  assert.match(achievements, /sealedLabel/);
  assert.match(achievements, /SealedMedalDisk/);
  assert.equal(es.achievements.sealedLabel, "Oculto");
  assert.equal(en.achievements.sealedLabel, "Hidden");
  assert.match(achievements, /bg-\[rgb\(8_16_24_\/_0\.92\)\]/);
  assert.match(
    achievements,
    /item\.kind === "sealed" \? \(\s*t\("landing-v2:achievements\.sealedLabel"\)/,
  );
});

test("journey timeline card uses the same dark panel as missions", () => {
  const journey = source("LandingV2Journey.tsx");
  assert.match(journey, /bg-\[rgb\(8_16_24_\/_0\.92\)\]/);
});

test("science header is centered over the three cards", () => {
  const science = source("LandingV2Science.tsx");
  assert.match(science, /mx-auto w-full max-w-\[850px\] shrink-0 text-center/);
  assert.match(science, /bg-\[#081018\]\/95/);
});

test("spanish footer tagline is translated", () => {
  assert.equal(es.closing.tagline, "Comprender la recuperación, un día a la vez.");
  assert.equal(en.closing.tagline, "Understanding recovery, one day at a time.");
});
