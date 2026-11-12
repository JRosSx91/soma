import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import en from "../../i18n/locales/en/landing-v2.json" with { type: "json" };
import es from "../../i18n/locales/es/landing-v2.json" with { type: "json" };
import { LANDING_FEATURE_ITEMS } from "./landing-features.js";
import {
  EXPEDITION_MAP_SRC,
  EXPEDITION_MAP_WEBP_SRC,
} from "../recovery-dashboard/expedition/expedition-map-layout.js";

function source(name: string): string {
  return readFileSync(new URL(`./${name}`, import.meta.url), "utf8");
}

function publicFile(path: string): string {
  return fileURLToPath(new URL(`../../../public${path}`, import.meta.url));
}

const page = source("LandingV2Page.tsx");
const expedition = source("LandingV2Expedition.tsx");
const features = source("LandingV2Features.tsx");
const app = readFileSync(new URL("../../App.tsx", import.meta.url), "utf8");

test("landing mounts features after the hero and expedition before achievements", () => {
  const order = [
    "<LandingV2Hero />",
    "<LandingV2Features />",
    "<LandingV2Journey />",
    "<LandingV2MissionsJournal />",
    "<LandingV2Expedition />",
    "<LandingV2Achievements />",
    "<LandingV2Closing />",
  ].map((tag) => page.indexOf(tag));
  for (const index of order) assert.ok(index > 0);
  assert.deepEqual([...order].sort((a, b) => a - b), order);
});

test("expedition section reuses the real map artwork and route icons", () => {
  assert.match(expedition, /EXPEDITION_MAP_WEBP_SRC/);
  assert.match(expedition, /EXPEDITION_MAP_SRC/);
  assert.match(expedition, /EXPEDITION_MAP_WIDTH/);
  assert.match(expedition, /EXPEDITION_MAP_HEIGHT/);
  assert.match(expedition, /loading="lazy"/);
  assert.equal(existsSync(publicFile(EXPEDITION_MAP_SRC)), true);
  assert.equal(existsSync(publicFile(EXPEDITION_MAP_WEBP_SRC)), true);
  for (const stem of ["knowledge-neuroscience", "perseverance-alcohol"]) {
    assert.match(expedition, new RegExp(stem));
    for (const px of [96, 192]) {
      assert.equal(
        existsSync(publicFile(`/images/expedition/icons/${stem}-${px}.webp`)),
        true,
        `${stem}-${px}`,
      );
    }
  }
  assert.match(expedition, /alt=\{t\("expedition\.mapAlt"\)\}/);
});

test("expedition CTA opens the public demo route", () => {
  assert.match(expedition, /to="\/preview\/expedition"/);
  assert.match(app, /path="expedition" element=\{<ExpeditionPage \/>\}/);
});

test("feature links target existing demo routes", () => {
  const routes = new Set(
    [...app.matchAll(/<Route path="([a-z-]+)" element=/g)].map((m) => m[1]),
  );
  assert.equal(LANDING_FEATURE_ITEMS.length, 8);
  for (const item of LANDING_FEATURE_ITEMS) {
    const segment = item.to.replace(/^\/preview\//, "");
    assert.ok(routes.has(segment), item.to);
  }
  assert.match(features, /previewFocus/);
  assert.match(features, /useReducedMotion/);
});

test("expedition and feature copy is present in ES and EN", () => {
  for (const id of LANDING_FEATURE_ITEMS.map((item) => item.id)) {
    assert.ok(es.features.items[id].title.length > 0, id);
    assert.ok(en.features.items[id].title.length > 0, id);
  }
  assert.match(es.expedition.routes.knowledge.title, /conocimiento/);
  assert.match(es.expedition.routes.perseverance.title, /perseverancia/);
  assert.match(en.expedition.routes.knowledge.title, /Knowledge/);
  assert.match(en.expedition.routes.perseverance.title, /Perseverance/);
  assert.match(es.expedition.intro, /educativa e interactiva/);
  assert.match(en.expedition.intro, /educational, interactive/);
  assert.match(es.expedition.badge, /beta pública/);
  assert.match(en.expedition.badge, /public beta/);
  assert.match(es.features.items.neurotransmitters.body, /Nueve perfiles cualitativos/);
  assert.match(en.features.items.neurotransmitters.body, /Nine qualitative/);
});

test("new landing copy stays educational and invents no features", () => {
  const blob = JSON.stringify([es.features, es.expedition, en.features, en.expedition]);
  assert.match(es.features.note, /no es un dispositivo médico/);
  assert.match(en.features.note, /not a medical device/);
  assert.match(es.expedition.note, /no una evaluación clínica/);
  assert.match(en.expedition.note, /not a clinical assessment/);
  assert.doesNotMatch(
    blob,
    /próximamente|coming soon|pr[oó]xima(?:s)? función|ranking|leaderboard|racha|streak|reward|recompensa|premio|prize|cura|cure|garantiza|guarantee|Android|Play Store|App Store/i,
  );
});
