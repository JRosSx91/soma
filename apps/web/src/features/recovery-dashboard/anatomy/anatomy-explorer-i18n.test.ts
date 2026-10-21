import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { atlasSystems } from "./atlas-config.ts";
import { resolveOrganSheet } from "./organ-sheet.ts";
import { resolveEducationalSignaling } from "./neurotransmitter-education.ts";
import enAnatomy from "../../../i18n/locales/en/anatomy.json" with { type: "json" };
import esAnatomy from "../../../i18n/locales/es/anatomy.json" with { type: "json" };
import enOrgans from "../../../i18n/locales/en/organs.json" with { type: "json" };
import esOrgans from "../../../i18n/locales/es/organs.json" with { type: "json" };
import enSubstances from "../../../i18n/locales/en/substances.json" with { type: "json" };
import esSubstances from "../../../i18n/locales/es/substances.json" with { type: "json" };
import enPhases from "../../../i18n/locales/en/phases.json" with { type: "json" };
import esPhases from "../../../i18n/locales/es/phases.json" with { type: "json" };

function flattenKeys(value: unknown, prefix = ""): string[] {
  if (value == null || typeof value !== "object") return prefix ? [prefix] : [];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, nested]) =>
    flattenKeys(nested, prefix ? `${prefix}.${key}` : key),
  );
}

function systemById(id: string) {
  const system = atlasSystems.find((item) => item.id === id);
  assert.ok(system, id);
  return system;
}

test("spanish and english anatomy bundles expose the same keys", () => {
  assert.deepEqual(flattenKeys(esAnatomy).sort(), flattenKeys(enAnatomy).sort());
  assert.notEqual(esAnatomy.eyebrow, enAnatomy.eyebrow);
  assert.notEqual(esAnatomy.viewEffects, enAnatomy.viewEffects);
  assert.notEqual(esAnatomy.signalingInEffectsHint, enAnatomy.signalingInEffectsHint);
  assert.notEqual(esAnatomy.signalingMarkLegend, enAnatomy.signalingMarkLegend);
  assert.notEqual(esAnatomy.catalogEstimateNotice, enAnatomy.catalogEstimateNotice);
  assert.notEqual(esAnatomy.referenceStatus.pending, enAnatomy.referenceStatus.pending);
  assert.equal(typeof esAnatomy.phaseCategoryNote, "string");
  assert.notEqual(esAnatomy.phaseCategoryNote, enAnatomy.phaseCategoryNote);
  assert.equal("phaseWindow" in esAnatomy, false);
  assert.equal("phaseWindow" in enAnatomy, false);
});

test("an organ with signaling and no narrative offers Effects access", () => {
  const nervous = systemById("nervous-central");
  const vta = nervous.organs.find((organ) => organ.id === "brain-vta");
  assert.ok(vta);
  const sheet = resolveOrganSheet(nervous, vta);
  assert.equal(sheet.availability.hasNarratives, false);
  assert.equal(sheet.availability.hasEducationalSignaling, true);
  const summary = readFileSync(new URL("../components/OrganSheetSummary.tsx", import.meta.url), "utf8");
  assert.match(summary, /hasEducationalSignaling/);
  assert.match(summary, /viewEffects/);
  assert.match(summary, /signalingInEffectsHint/);
});

test("an organ without narrative or signaling keeps an honest empty effects state", () => {
  const reproductive = systemById("reproductive");
  const testes = reproductive.organs.find((organ) => organ.id === "testes");
  assert.ok(testes);
  const sheet = resolveOrganSheet(reproductive, testes);
  assert.equal(sheet.availability.hasNarratives, false);
  assert.equal(sheet.availability.hasEducationalSignaling, false);
  const summary = readFileSync(new URL("../components/OrganSheetSummary.tsx", import.meta.url), "utf8");
  assert.match(summary, /noEducationalEffects/);
});

test("catalog labels change with language for organs, substances and phases", () => {
  assert.equal(esOrgans["brain-vta"], "Área tegmental ventral");
  assert.equal(enOrgans["brain-vta"], "Ventral tegmental area");
  assert.notEqual(esSubstances.caffeine.name, enSubstances.caffeine.name);
  assert.notEqual(esPhases.during_use, enPhases.during_use);
});

test("scientific resolvers keep the same associations after atlas i18n", () => {
  const ids = resolveEducationalSignaling("brain-vta", "alcohol", "during_use").map(
    (entry) => entry.neurotransmitter,
  );
  assert.deepEqual(ids, ["dopamine", "gaba"]);
  assert.deepEqual(resolveEducationalSignaling("liver", "alcohol", "during_use"), []);
  assert.equal(
    resolveEducationalSignaling("brain-vta", "caffeine", "during_use").some(
      (entry) => entry.neurotransmitter === "gaba",
    ),
    false,
  );
});

test("atlas chrome uses the anatomy namespace without forced spanish lookups", () => {
  const page = readFileSync(new URL("../pages/AnatomyExplorerPage.tsx", import.meta.url), "utf8");
  const summary = readFileSync(new URL("../components/OrganSheetSummary.tsx", import.meta.url), "utf8");
  const atlas = readFileSync(new URL("./AnatomyAtlas2D.tsx", import.meta.url), "utf8");
  assert.match(page, /useTranslation\(\["anatomy"/);
  assert.equal(page.includes('lng: "es"'), false);
  assert.equal(summary.includes('lng: "es"'), false);
  assert.equal(atlas.includes('lng: "es"'), false);
  assert.match(atlas, /useTranslation\("anatomy"\)/);
  for (const token of ["Vista anterior", "Explorador anatómico", "Ver efectos", "Cuerpo humano"]) {
    assert.equal(page.includes(token), false, token);
  }
});

test("the atlas stage does not offer an anterior/posterior view selector", () => {
  const page = readFileSync(new URL("../pages/AnatomyExplorerPage.tsx", import.meta.url), "utf8");
  const atlas = readFileSync(new URL("./AnatomyAtlas2D.tsx", import.meta.url), "utf8");
  assert.equal(atlas.includes("ViewButton"), false);
  assert.equal(atlas.includes("onViewChange"), false);
  assert.equal(atlas.includes("viewPosterior"), false);
  assert.equal(atlas.includes("viewGroup"), false);
  assert.equal(page.includes("setView"), false);
  assert.equal(page.includes("posteriorAvailable"), false);
  assert.equal(page.includes("AtlasViewId"), false);
  assert.match(atlas, /viewAnterior/);
  assert.equal("viewAnterior" in esAnatomy, true);
  assert.equal("viewAnterior" in enAnatomy, true);
  for (const key of ["viewGroup", "viewPosterior", "posteriorUnavailable", "posteriorUnavailableShort"]) {
    assert.equal(key in esAnatomy, false, key);
    assert.equal(key in enAnatomy, false, key);
  }
});

test("anatomy json values are not unresolved i18n key paths", () => {
  for (const [bundle, label] of [
    [enAnatomy, "en"],
    [esAnatomy, "es"],
  ] as const) {
    for (const key of flattenKeys(bundle)) {
      const parts = key.split(".");
      let cursor: unknown = bundle;
      for (const part of parts) {
        cursor = (cursor as Record<string, unknown>)[part];
      }
      assert.equal(typeof cursor, "string", `${label}:${key}`);
      assert.notEqual(cursor, key, `${label}:${key}`);
      assert.equal(String(cursor).includes(`anatomy:${key}`), false, `${label}:${key}`);
    }
  }
});
