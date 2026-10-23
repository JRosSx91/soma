import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import i18n from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { test } from "node:test";
import enLanding from "../../i18n/locales/en/landing-v2.json" with { type: "json" };
import esLanding from "../../i18n/locales/es/landing-v2.json" with { type: "json" };
import {
  LANDING_FLATLINE_PATH,
  LANDING_PULSE_PATH,
  LANDING_TWO_PEAK_PATH,
  LandingPulseWave,
} from "./LandingPulseWave.js";
import {
  pulseRevealOffsets,
  SPARK_CORE,
  SPARK_HEAD,
  SPARK_TRAIL,
} from "./pulseRevealOffsets.js";
import { NotFoundPage } from "../../pages/NotFoundPage.js";

const pulse = readFileSync(
  fileURLToPath(new URL("./LandingPulseWave.tsx", import.meta.url)),
  "utf8",
);
const closing = readFileSync(
  fileURLToPath(new URL("./LandingV2Closing.tsx", import.meta.url)),
  "utf8",
);
const app = readFileSync(
  fileURLToPath(new URL("../../App.tsx", import.meta.url)),
  "utf8",
);

test("closing section reuses the live pulse without inlining the SVG path", () => {
  assert.match(closing, /LandingPulseWave/);
  assert.match(closing, /variant="live"/);
  assert.equal(closing.includes("M0 200 H540"), false);
  assert.equal(closing.includes("function ClosingPulse"), false);
  assert.match(pulse, /landing-v2-closing-pulse-armed/);
  assert.match(pulse, /landing-v2-closing-spark/);
  assert.equal(pulse.includes(LANDING_PULSE_PATH), true);
});

test("flatline 404 uses three reveal passes instead of a path morph", () => {
  assert.match(pulse, /LANDING_TWO_PEAK_PATH/);
  assert.equal(pulse.includes(LANDING_TWO_PEAK_PATH), true);
  assert.match(pulse, /landing-v2-flatline-pass-1/);
  assert.match(pulse, /landing-v2-flatline-pass-2/);
  assert.match(pulse, /landing-v2-flatline-pass-3/);
  assert.match(pulse, /landing-v2-flatline-draw/);
  assert.match(pulse, /landing-v2-flatline-spark/);
  assert.match(pulse, /getTotalLength\(\)/);
  assert.match(pulse, /pulseRevealOffsets/);
  assert.match(pulse, /from "\.\/pulseRevealOffsets\.js"/);
  assert.equal(pulse.includes("animate={{ d: LANDING_FLATLINE_PATH }}"), false);
  assert.equal(pulse.includes("@keyframes landing-v2-flatline-spark"), false);
  assert.match(pulse, /LivePulseSpark/);
  assert.match(pulse, /data-pulse-variant=\{variant\}/);
});

test("spark and stroke share one path progress for every spark layer", () => {
  const length = 1000;
  const mid = pulseRevealOffsets(0.5, length);
  assert.equal(mid.drawnLength, 500);
  assert.equal(mid.drawDashoffset, 500);
  assert.equal(SPARK_HEAD - mid.sparkHeadDashoffset, mid.drawnLength);
  assert.equal(SPARK_CORE - mid.sparkCoreDashoffset, mid.drawnLength);
  assert.equal(SPARK_TRAIL - mid.sparkTrailDashoffset, mid.drawnLength);

  const start = pulseRevealOffsets(0, length);
  assert.equal(start.drawDashoffset, length);
  assert.equal(start.sparkHeadDashoffset, SPARK_HEAD);

  const end = pulseRevealOffsets(1, length);
  assert.equal(end.drawDashoffset, 0);
  assert.equal(end.sparkHeadDashoffset, SPARK_HEAD - length);
});

test("catch-all routes stay public except unknown /app paths behind auth", () => {
  assert.match(app, /path="\*" element=\{<NotFoundPage \/>\}/);
  const previewBlock = app.slice(app.indexOf('path="/preview"'));
  assert.match(previewBlock, /path="\*" element=\{<NotFoundPage \/>\}/);
  assert.match(app, /element=\{<ProtectedLayout \/>\}/);
  const protectedBlock = app.slice(app.indexOf("ProtectedLayout"));
  const appBlock = protectedBlock.slice(protectedBlock.indexOf('path="/app"'));
  assert.match(appBlock, /path="\*" element=\{<NotFoundPage \/>\}/);
  assert.equal(app.includes("AuthShell"), false);
  assert.equal(app.includes("PreviewShell") && app.includes("NotFoundPage"), true);
});

test("landing-v2 notFound copy exists in Spanish and English", () => {
  assert.equal(esLanding.notFound.eyebrow, "Señal interrumpida");
  assert.equal(esLanding.notFound.title, "Aquí se perdió el pulso.");
  assert.equal(esLanding.notFound.ctaPrimary, "Volver al inicio");
  assert.equal(esLanding.notFound.ctaSecondary, "Explorar la demo");
  assert.equal(enLanding.notFound.code, "404");
  assert.equal(enLanding.notFound.ctaPrimary, "Back to home");
});

const i18n404 = i18n.createInstance();
void i18n404.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  resources: { en: { "landing-v2": enLanding } },
  interpolation: { escapeValue: false },
  initImmediate: false,
});

function wrap(node: ReactNode) {
  return createElement(
    I18nextProvider,
    { i18n: i18n404 },
    createElement(MemoryRouter, { initialEntries: ["/missing"] }, node),
  );
}

test("NotFoundPage is a public landing-styled screen with home and demo links", () => {
  const html = renderToStaticMarkup(wrap(createElement(NotFoundPage)));
  assert.match(html, /Signal interrupted/i);
  assert.match(html, />404</);
  assert.match(html, /href="\/"/);
  assert.match(html, /href="\/preview"/);
  assert.match(html, /data-pulse-variant="flatline"/);
  assert.match(html, /preserveAspectRatio="xMidYMid meet"/);
  assert.match(html, /viewBox="0 44 1600 252"/);
  assert.equal(html.includes("AuthShell"), false);
  assert.equal(html.includes("lg:pl-60"), false);
});

test("404 pulse fits the full viewBox so QRS peaks are not sliced", () => {
  assert.match(pulse, /isLive \? "xMidYMid slice" : "xMidYMid meet"/);
  assert.match(pulse, /LIVE_VIEWBOX = "0 0 1600 400"/);
  assert.match(pulse, /FLATLINE_VIEWBOX = "0 44 1600 252"/);
  const page = readFileSync(
    fileURLToPath(new URL("../../pages/NotFoundPage.tsx", import.meta.url)),
    "utf8",
  );
  assert.match(page, /w-screen/);
  assert.match(page, /max-w-\[100vw\]/);
  assert.match(page, /-translate-x-1\/2/);
  assert.equal(page.includes("h-[clamp(8.5rem, 26vw, 18rem)]"), false);
  assert.equal(page.includes("top-[42%]"), false);
  assert.equal(page.includes("h-[min(18rem,46%)]"), false);
});

test("reduced motion renders the flatline path without a morph", () => {
  const html = renderToStaticMarkup(
    createElement(LandingPulseWave, {
      variant: "flatline",
      reduceMotion: true,
    }),
  );
  assert.equal(html.includes(LANDING_FLATLINE_PATH), true);
  assert.equal(html.includes("landing-v2-flatline-spark"), false);
  assert.equal(html.includes("landing-v2-flatline-armed"), false);
  assert.equal(html.includes(LANDING_TWO_PEAK_PATH), false);
});

test("live pulse still draws the original waveform path", () => {
  const html = renderToStaticMarkup(
    createElement(LandingPulseWave, {
      variant: "live",
      reduceMotion: true,
      live: false,
    }),
  );
  assert.equal(html.includes(LANDING_PULSE_PATH), true);
  assert.match(html, /data-pulse-variant="live"/);
  assert.match(html, /preserveAspectRatio="xMidYMid slice"/);
  assert.match(html, /viewBox="0 0 1600 400"/);
});
