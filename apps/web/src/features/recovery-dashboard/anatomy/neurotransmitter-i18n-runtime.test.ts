import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import enMechanisms from "../../../i18n/locales/en/mechanisms.json" with { type: "json" };
import esMechanisms from "../../../i18n/locales/es/mechanisms.json" with { type: "json" };
import enPhases from "../../../i18n/locales/en/neurotransmitter-phases.json" with { type: "json" };
import esPhases from "../../../i18n/locales/es/neurotransmitter-phases.json" with { type: "json" };
import { educationalNtProfiles } from "./neurotransmitter-education.ts";
import { narrativePhases } from "./narrative-catalog.ts";

const config = readFileSync(new URL("../../../i18n/config.ts", import.meta.url), "utf8");
const selector = readFileSync(new URL("../../../components/LanguageSelector.tsx", import.meta.url), "utf8");
const card = readFileSync(
  new URL("../components/EducationalSignalingCard.tsx", import.meta.url),
  "utf8",
);
const legacyPanel = readFileSync(
  new URL("../../neurotransmitter-state/components/NeurotransmitterPanel.tsx", import.meta.url),
  "utf8",
);

const REGISTERED = ["en", "es", "ca", "gl", "eu", "fr", "it", "de"] as const;
const ES_BRIDGE = ["ca", "gl", "eu"] as const;
const EN_BRIDGE = ["fr", "it", "de"] as const;
const UNPUBLISHED_LOCALES = [...ES_BRIDGE, ...EN_BRIDGE] as const;

const STALE_PHRASES = [
  "El teu sistema GABA estava suprimit",
  "O teu sistema GABA estaba suprimido",
  "zapalduta zegoen",
  "Votre système GABA était supprimé",
  "Il tuo sistema GABA era soppresso",
  "Ihr GABA-System war durch die hemmende Wirkung des Alkohols unterdrückt",
  "setmanes 2 i 8",
  "semanas 2 e 8",
  "semaines 2 et 8",
  "settimane 2 e 8",
  "desinhibe les neurones dopaminèrgiques",
  "desinhibe as neuronas dopaminérxicas",
  "disinibisce i neuroni dopaminergici",
  "dopaminerge Neuronen enthemmt",
] as const;

type Nested = Record<string, unknown>;

function flattenKeys(value: unknown, prefix = ""): string[] {
  if (value == null || typeof value !== "object") return prefix ? [prefix] : [];
  return Object.entries(value as Nested).flatMap(([key, nested]) =>
    flattenKeys(nested, prefix ? `${prefix}.${key}` : key),
  );
}

function resourceBlock(lang: string): string {
  const startToken = `      ${lang}: {`;
  const start = config.indexOf(startToken);
  assert.ok(start >= 0, `missing resources.${lang}`);
  const from = start + startToken.length;
  const nextLang = REGISTERED.find((code) => {
    if (REGISTERED.indexOf(code) <= REGISTERED.indexOf(lang as (typeof REGISTERED)[number])) {
      return false;
    }
    return config.indexOf(`      ${code}: {`, from) >= 0;
  });
  const end = nextLang
    ? config.indexOf(`      ${nextLang}: {`, from)
    : config.indexOf("\n    },", from);
  assert.ok(end > start, lang);
  return config.slice(start, end);
}

function readLocaleJson(lang: string, file: "neurotransmitter-phases" | "mechanisms"): unknown {
  const url = new URL(`../../../i18n/locales/${lang}/${file}.json`, import.meta.url);
  assert.equal(existsSync(url), true, `${lang}/${file}.json`);
  return JSON.parse(readFileSync(url, "utf8"));
}

test("the eight languages stay registered and selectable", () => {
  for (const lang of REGISTERED) {
    assert.match(config, new RegExp(`"${lang}"`));
    assert.match(selector, new RegExp(`code: "${lang}"`));
  }
  assert.match(config, /fallbackLng:\s*"en"/);
  assert.match(config, /supportedLngs:\s*\[\.\.\.SUPPORTED_LANGUAGES\]/);
});

test("english and spanish keep their reviewed neurotransmitter bundles", () => {
  const en = resourceBlock("en");
  const es = resourceBlock("es");
  assert.match(en, /"neurotransmitter-phases": enNeurotransmitterPhases/);
  assert.match(en, /mechanisms: enMechanisms/);
  assert.match(es, /"neurotransmitter-phases": esNeurotransmitterPhases/);
  assert.match(es, /mechanisms: esMechanisms/);
  assert.equal(flattenKeys(enPhases).length, 56);
  assert.equal(flattenKeys(esPhases).length, 56);
  assert.deepEqual(flattenKeys(enPhases).sort(), flattenKeys(esPhases).sort());
  assert.equal(Object.keys(enMechanisms).length, 14);
  assert.deepEqual(Object.keys(enMechanisms).sort(), Object.keys(esMechanisms).sort());
});

test("catalan galician and basque register reviewed spanish neurotransmitter copy", () => {
  for (const lang of ES_BRIDGE) {
    const block = resourceBlock(lang);
    assert.match(block, /"neurotransmitter-phases": esNeurotransmitterPhases/);
    assert.match(block, /mechanisms: esMechanisms/);
    assert.equal(block.includes(`${lang}NeurotransmitterPhases`), false);
    assert.equal(block.includes(`${lang}Mechanisms`), false);
  }
});

test("french italian and german register reviewed english neurotransmitter copy", () => {
  for (const lang of EN_BRIDGE) {
    const block = resourceBlock(lang);
    assert.match(block, /"neurotransmitter-phases": enNeurotransmitterPhases/);
    assert.match(block, /mechanisms: enMechanisms/);
    assert.equal(block.includes(`${lang}NeurotransmitterPhases`), false);
    assert.equal(block.includes(`${lang}Mechanisms`), false);
  }
});

test("all educational phase and mechanism keys still resolve", () => {
  assert.equal(educationalNtProfiles.length, 14);
  assert.equal(narrativePhases.length, 4);
  for (const profile of educationalNtProfiles) {
    for (const phase of narrativePhases) {
      const path = `${profile.substanceId}.${profile.neurotransmitter}.${phase}`;
      assert.equal(flattenKeys(enPhases).includes(path), true, path);
      assert.equal(flattenKeys(esPhases).includes(path), true, path);
      const enText = path.split(".").reduce<unknown>((cursor, key) => {
        return cursor && typeof cursor === "object" ? (cursor as Nested)[key] : undefined;
      }, enPhases);
      const esText = path.split(".").reduce<unknown>((cursor, key) => {
        return cursor && typeof cursor === "object" ? (cursor as Nested)[key] : undefined;
      }, esPhases);
      assert.equal(typeof enText, "string");
      assert.equal(typeof esText, "string");
      assert.notEqual(String(enText).trim(), "");
      assert.notEqual(String(esText).trim(), "");
    }
    assert.equal(profile.mechanismKey in enMechanisms, true, profile.mechanismKey);
    assert.equal(profile.mechanismKey in esMechanisms, true, profile.mechanismKey);
  }
});

test("unpublished locale files remain on disk and are not registered for NT namespaces", () => {
  for (const lang of UNPUBLISHED_LOCALES) {
    const phases = readLocaleJson(lang, "neurotransmitter-phases");
    const mechanisms = readLocaleJson(lang, "mechanisms");
    assert.deepEqual(flattenKeys(phases).sort(), flattenKeys(enPhases).sort());
    assert.deepEqual(Object.keys(mechanisms as object).sort(), Object.keys(enMechanisms).sort());
    assert.equal(config.includes(`import ${lang}NeurotransmitterPhases`), false);
    assert.equal(config.includes(`import ${lang}Mechanisms`), false);
  }
  const runtimeSource = [
    config,
    resourceBlock("ca"),
    resourceBlock("gl"),
    resourceBlock("eu"),
    resourceBlock("fr"),
    resourceBlock("it"),
    resourceBlock("de"),
  ].join("\n");
  for (const phrase of STALE_PHRASES) {
    assert.equal(runtimeSource.includes(phrase), false, phrase);
  }
  const caDisk = JSON.stringify(readLocaleJson("ca", "neurotransmitter-phases"));
  assert.equal(caDisk.includes("El teu sistema GABA estava suprimit"), true);
  const frDisk = JSON.stringify(readLocaleJson("fr", "neurotransmitter-phases"));
  assert.equal(frDisk.includes("semaines 2 et 8"), true);
});

test("reviewed spanish and english keep alcohol and cocaine medical warnings", () => {
  assert.match(enPhases.alcohol.gaba.acute_withdrawal, /seizures/i);
  assert.match(enPhases.alcohol.gaba.acute_withdrawal, /Medical supervision is recommended in the first week/);
  assert.match(enPhases.alcohol.glutamate.acute_withdrawal, /Seek medical care if symptoms intensify/);
  assert.match(enPhases.cocaine.norepinephrine.during_use, /cardiovascular risks/);
  assert.match(esPhases.alcohol.gaba.acute_withdrawal, /convulsiones/);
  assert.match(esPhases.alcohol.gaba.acute_withdrawal, /Se recomienda supervisión médica durante la primera semana/);
  assert.match(esPhases.alcohol.glutamate.acute_withdrawal, /Busca atención médica si los síntomas se intensifican/);
  assert.match(esPhases.cocaine.norepinephrine.during_use, /riesgos cardiovasculares/);
});

test("advice recovery explore anatomy and organ narratives keep their previous resource mapping", () => {
  for (const lang of UNPUBLISHED_LOCALES) {
    const block = resourceBlock(lang);
    assert.match(block, /recovery: enRecovery/);
    assert.match(block, /explore: enExplore/);
    assert.match(block, /anatomy: enAnatomy/);
    const narrativeIdent =
      lang === "ca"
        ? "caOrganNarrative"
        : lang === "gl"
          ? "glOrganNarrative"
          : lang === "eu"
            ? "euOrganNarrative"
            : lang === "fr"
              ? "frOrganNarrative"
              : lang === "it"
                ? "itOrganNarrative"
                : "deOrganNarrative";
    assert.match(block, new RegExp(`"organ-narrative": ${narrativeIdent}`));
  }
  const es = resourceBlock("es");
  assert.match(es, /recovery: esRecovery/);
  assert.match(es, /explore: esExplore/);
  assert.match(es, /anatomy: esAnatomy/);
  assert.match(es, /"organ-narrative": esOrganNarrative/);
  assert.equal(config.includes("advice-drafts"), false);
});

test("the signaling card still reads the shared namespaces without a language override", () => {
  assert.match(card, /useTranslation\(\["anatomy", "neurotransmitters", "neurotransmitter-phases", "mechanisms"\]\)/);
  assert.match(card, /t\(`neurotransmitter-phases:\$\{entry\.phaseKey\}`/);
  assert.match(card, /t\(`mechanisms:\$\{entry\.mechanismKey\}`/);
  assert.equal(card.includes("changeLanguage"), false);
  assert.equal(card.includes('lng:'), false);
});

test("the legacy neurotransmitter panel shares the remapped namespaces", () => {
  assert.match(legacyPanel, /"neurotransmitter-phases"/);
  assert.match(legacyPanel, /"mechanisms"/);
  assert.match(legacyPanel, /t\(\s*`neurotransmitter-phases:\$\{entry\.resultingSymptomKey\}`/);
  assert.match(legacyPanel, /t\(`mechanisms:\$\{s\.mechanismKey\}`/);
  assert.equal(legacyPanel.includes('lng: "ca"'), false);
  assert.equal(legacyPanel.includes("caNeurotransmitterPhases"), false);
});
