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

test("atlas 2.0 chrome uses RecoveryHero, nature-8, and drops the illustrated systems grid", () => {
  const page = readFileSync(new URL("../pages/AnatomyExplorerPage.tsx", import.meta.url), "utf8");
  assert.match(page, /RecoveryHero/);
  assert.match(page, /nature-8\.png/);
  assert.match(page, /generalDisclaimer/);
  assert.match(page, /relatedContentForSystem/);
  assert.match(page, /SystemSheetSummary/);
  assert.equal(page.includes("illustratedSystems"), false);
  assert.equal(page.includes("PageHeading"), false);
  assert.equal(page.includes("BodyDiagram3D"), false);
  assert.equal(typeof esAnatomy.selectedSystem, "string");
  assert.notEqual(esAnatomy.selectedSystem, enAnatomy.selectedSystem);
  assert.notEqual(esAnatomy.exploreThisSystem, enAnatomy.exploreThisSystem);
  assert.notEqual(esAnatomy.relatedTitle, enAnatomy.relatedTitle);
  assert.equal(esAnatomy.quotes.length, enAnatomy.quotes.length);
  assert.match(page, /compactBand/);
  assert.match(page, /exploreSystemCardSources/);
  assert.match(page, /lg:grid-cols-\[minmax\(0,7fr\)_minmax\(16\.5rem,3fr\)\]/);
  assert.match(page, /repeat\(auto-fill,minmax\(11\.5rem,13rem\)\)/);
  assert.match(page, /self-start/);
  assert.match(esAnatomy.organCount_one, /Órganos en el atlas/);
  assert.match(esAnatomy.relatedSubstanceCount_one, /Sustancias analizadas/);
  assert.match(enAnatomy.organCount_one, /Organs in the atlas/);
  assert.match(enAnatomy.relatedSubstanceCount_one, /Substances analyzed/);
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

test("each atlas system has a useful spanish and english educational intro", () => {
  const page = readFileSync(new URL("../pages/AnatomyExplorerPage.tsx", import.meta.url), "utf8");
  assert.match(page, /t\(`systemIntro\.\$\{system\.id\}`\)/);
  assert.match(page, /introLungs/);
  assert.equal(page.includes("introSystemIncludes"), false);

  for (const system of atlasSystems) {
    const es = esAnatomy.systemIntro[system.id as keyof typeof esAnatomy.systemIntro];
    const en = enAnatomy.systemIntro[system.id as keyof typeof enAnatomy.systemIntro];
    assert.equal(typeof es, "string", system.id);
    assert.equal(typeof en, "string", system.id);
    assert.ok(es.trim().length > 80, system.id);
    assert.ok(en.trim().length > 80, system.id);
    assert.notEqual(es, en, system.id);
    assert.equal(es.includes(system.name), false, system.id);
    assert.match(es, /\. .+[.]/);
    assert.match(en, /\. .+[.]/);
  }
});

test("recovery and effects keep technical catalog details behind a closed disclosure", () => {
  const page = readFileSync(new URL("../pages/AnatomyExplorerPage.tsx", import.meta.url), "utf8");
  const recovery = page.slice(page.indexOf("function RecoveryPanel"), page.indexOf("function atlasOrganName"));
  const effects = page.slice(page.indexOf("function EffectsPanel"), page.indexOf("function RecoveryPanel"));

  assert.match(recovery, /recoveryAspect/);
  assert.match(recovery, /recoveryMeaning/);
  assert.match(recovery, /recoveryPlainEstimate/);
  assert.match(recovery, /catalogEstimateNotice/);
  assert.match(recovery, /recoveryDetailsSummary/);
  assert.match(recovery, /CatalogDetails/);
  assert.match(page, /<details className=/);
  assert.equal(page.includes("<details open"), false);
  const recoveryPrimary = recovery.slice(0, recovery.indexOf("CatalogDetails"));
  assert.equal(recoveryPrimary.includes("curveShape"), false);
  assert.equal(recoveryPrimary.includes('t("daysTo95")'), false);
  assert.equal(recoveryPrimary.includes('t("ceiling")'), false);
  assert.equal(recoveryPrimary.includes("CatalogEvidenceNote"), false);
  assert.match(recovery, /curveShape/);
  assert.match(recovery, /t\("daysTo95"\)/);
  assert.match(recovery, /t\("ceiling"\)/);
  assert.match(recovery, /recoveryDisclaimer/);
  assert.match(recovery, /CatalogEvidenceNote/);
  assert.equal(recovery.includes("NEEDS-VERIFICATION"), false);
  assert.equal(recovery.includes("pending"), false);

  assert.match(effects, /effectsNotice/);
  assert.match(effects, /effectsDetailsSummary/);
  assert.equal(effects.includes("generalDisclaimer"), false);
  assert.equal(effects.includes("phaseCategoryNote"), false);
  const effectsPrimary = effects.slice(0, effects.indexOf("CatalogDetails"));
  assert.equal(effectsPrimary.includes("signalingAttribution"), false);
  assert.equal(effectsPrimary.includes("CatalogEvidenceNote"), false);
  assert.match(effects, /signalingAttribution/);
  assert.match(effects, /CatalogEvidenceNote/);
  assert.equal(effects.includes("NEEDS-VERIFICATION"), false);

  for (const key of [
    "effectsNotice",
    "effectsDetailsSummary",
    "recoveryDetailsSummary",
    "recoveryAspect",
    "recoveryPlainEstimate",
  ] as const) {
    assert.equal(typeof esAnatomy[key], "string", key);
    assert.equal(typeof enAnatomy[key], "string", key);
    assert.notEqual(esAnatomy[key], enAnatomy[key], key);
  }
  for (const shape of ["logarithmic", "sigmoidal", "linear", "stepwise"] as const) {
    assert.notEqual(esAnatomy.recoveryMeaning[shape], enAnatomy.recoveryMeaning[shape], shape);
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
