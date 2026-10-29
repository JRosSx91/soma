import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import en from "../../i18n/locales/en/landing-v2.json" with { type: "json" };
import es from "../../i18n/locales/es/landing-v2.json" with { type: "json" };

const origin = readFileSync(
  new URL("./LandingV2Origin.tsx", import.meta.url),
  "utf8",
);
const hero = readFileSync(
  new URL("./LandingV2Hero.tsx", import.meta.url),
  "utf8",
);

test("origin section uses the approved decorative background", () => {
  assert.match(origin, /\/images\/landing-v2\/soma-origin-bg\.png/);
  assert.match(origin, /alt=""/);
  assert.match(origin, /aria-hidden="true"/);
  assert.equal(
    existsSync(
      fileURLToPath(
        new URL("../../../public/images/landing-v2/soma-origin-bg.png", import.meta.url),
      ),
    ),
    true,
  );
});

test("origin copy stays etymological and educational in ES and EN", () => {
  assert.equal(es.origin.title, "¿Por qué Soma?");
  assert.equal(en.origin.title, "Why Soma?");
  assert.equal(es.origin.word, "σῶμα");
  assert.equal(en.origin.word, "σῶμα");
  assert.equal(es.origin.etymology, "Del griego antiguo: cuerpo.");
  assert.equal(en.origin.etymology, "From Ancient Greek: body.");
  assert.match(es.origin.p1, /constante transformación/);
  assert.match(en.origin.p1, /constant transformation/);
  assert.match(es.origin.p2, /hacer visibles y comprensibles/);
  assert.match(en.origin.p2, /visible and understandable/);
  assert.match(es.origin.p3, /dar sentido al camino/);
  assert.match(en.origin.p3, /make sense of the path/);
  const blob = `${JSON.stringify(es.origin)}${JSON.stringify(en.origin)}${origin}`;
  assert.doesNotMatch(blob, /diagnóstic|diagnos/i);
  assert.doesNotMatch(origin, /hero-holographic/);
});

test("origin follows the landing one-screen height pattern on large viewports", () => {
  assert.match(origin, /lg:h-svh/);
  assert.match(origin, /lg:flex-col/);
  assert.match(origin, /lg:min-h-0/);
  assert.doesNotMatch(origin, /min-h-\[3[48]rem\]/);
});

test("origin reuses landing motion once and skips motion on the anatomy image", () => {
  assert.match(origin, /useReducedMotion/);
  assert.match(origin, /whileInView=\{\{ opacity: 1, y: 0 \}\}/);
  assert.match(origin, /viewport=\{\{ once: true/);
  const imgBlock = origin.slice(origin.indexOf("<img"), origin.indexOf("/>") + 2);
  assert.doesNotMatch(imgBlock, /motion/);
});

test("origin does not rewrite the approved hero", () => {
  assert.match(hero, /hero-holographic-anatomy/);
  assert.doesNotMatch(hero, /soma-origin-bg/);
});
