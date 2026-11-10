import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import enJournal from "../../i18n/locales/en/journal.json" with { type: "json" };
import esJournal from "../../i18n/locales/es/journal.json" with { type: "json" };
import enSubstances from "../../i18n/locales/en/substances.json" with { type: "json" };
import esSubstances from "../../i18n/locales/es/substances.json" with { type: "json" };

const CATALOG_IDS = ["alcohol", "caffeine", "cannabis", "cocaine", "nicotine"] as const;

const form = readFileSync(new URL("./JournalEntryForm.tsx", import.meta.url), "utf8");
const page = readFileSync(
  new URL("../recovery-dashboard/pages/JournalPage.tsx", import.meta.url),
  "utf8",
);
const api = readFileSync(new URL("./journal-api.ts", import.meta.url), "utf8");
const demo = readFileSync(new URL("./journal-demo.ts", import.meta.url), "utf8");
const model = readFileSync(new URL("./journal-model.ts", import.meta.url), "utf8");

test("journal substance options use shared i18n names, not catalog English labels", () => {
  assert.match(form, /useTranslation\(\["journal", "substances"\]\)/);
  assert.match(form, /t\(`substances:\$\{item\.id\}\.name`, \{ defaultValue: item\.name \}\)/);
  assert.match(form, /<option key=\{item\.id\} value=\{item\.id\}>/);
  assert.match(form, /substances\.map\(\(item\) =>/);
  assert.equal(form.includes(".sort("), false);
  assert.match(form, /t\("form\.substanceNone"\)/);
  assert.equal(esJournal.form.substanceNone, "Ninguna");
  assert.equal(enJournal.form.substanceNone, "None");
});

test("substance display names match Spanish and English catalogs", () => {
  const expectedEs = {
    alcohol: "Alcohol",
    caffeine: "Cafeína",
    cannabis: "Cannabis",
    cocaine: "Cocaína",
    nicotine: "Nicotina",
  } as const;
  const expectedEn = {
    alcohol: "Alcohol",
    caffeine: "Caffeine",
    cannabis: "Cannabis",
    cocaine: "Cocaine",
    nicotine: "Nicotine",
  } as const;
  for (const id of CATALOG_IDS) {
    assert.equal(esSubstances[id].name, expectedEs[id], id);
    assert.equal(enSubstances[id].name, expectedEn[id], id);
  }
});

test("journal keep substance ids in state, save payloads and existing demo rows", () => {
  assert.match(form, /cravingSubstanceId,/);
  assert.match(form, /entry\?\.cravingSubstanceId \?\? null/);
  assert.match(form, /setCravingSubstanceId\(event\.target\.value === "" \? null : event\.target\.value\)/);
  assert.match(page, /cravingSubstanceId: draft\.cravingSubstanceId \?\? null/);
  assert.match(page, /createJournalEntry\(draft/);
  assert.match(page, /patchJournalEntry\(editing\.id, draft\)/);
  assert.match(api, /apiRequest<JournalEntry>\("\/me\/journal"/);
  assert.match(api, /method: "PATCH"/);
  assert.match(model, /cravingSubstanceId: string \| null/);
  assert.match(demo, /cravingSubstanceId: "alcohol"/);
  assert.equal(demo.includes("Cafeína"), false);
  assert.equal(demo.includes("Caffeine"), false);
  assert.equal(form.includes("/me/journal"), false);
});

test("DEMO and LIVE journal still isolate catalog names from persisted ids", () => {
  assert.match(page, /base === "\/preview"/);
  assert.match(page, /base === "\/app"/);
  assert.match(page, /JOURNAL_DEMO_ENTRIES/);
  assert.match(page, /createJournalEntry\(draft/);
  assert.equal(demo.includes("apiRequest"), false);
  assert.equal(page.includes("cravingSubstanceName"), false);
  assert.equal(form.includes("cravingSubstanceName"), false);
});
