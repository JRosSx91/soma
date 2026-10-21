import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { narrativeCatalogPairs } from "../anatomy/narrative-catalog.ts";
import { recoveryCatalogPairs } from "../anatomy/recovery-catalog.ts";
import enExplore from "../../../i18n/locales/en/explore.json" with { type: "json" };
import esExplore from "../../../i18n/locales/es/explore.json" with { type: "json" };
import enOrgans from "../../../i18n/locales/en/organs.json" with { type: "json" };
import esOrgans from "../../../i18n/locales/es/organs.json" with { type: "json" };
import enSubstances from "../../../i18n/locales/en/substances.json" with { type: "json" };
import esSubstances from "../../../i18n/locales/es/substances.json" with { type: "json" };
import { joinOrganLabels, uniqueOrganIdsForSubstance } from "./explore-organs.ts";

function educationalPairs() {
  return [...narrativeCatalogPairs(), ...recoveryCatalogPairs()];
}

test("substance cards copy uses localized descriptions, not catalog counters", () => {
  assert.ok(esSubstances.alcohol.shortDescription.length > 40);
  assert.ok(enSubstances.alcohol.shortDescription.length > 40);
  assert.notEqual(esSubstances.alcohol.shortDescription, enSubstances.alcohol.shortDescription);
  assert.equal("coverageCounts" in esExplore, false);
  assert.equal("indexedCoverage" in enExplore, false);
  assert.equal(esExplore.educationalOrgansTitle, "Órganos con información educativa");
  assert.equal(enExplore.educationalOrgansTitle, "Organs with educational information");
});

test("organ lists come from existing index associations without duplicates", () => {
  const pairs = [
    { organId: "liver", substanceId: "alcohol" },
    { organId: "stomach", substanceId: "alcohol" },
    { organId: "liver", substanceId: "alcohol" },
    { organId: "heart", substanceId: "caffeine" },
  ];
  const alcohol = uniqueOrganIdsForSubstance("alcohol", pairs);
  assert.deepEqual(alcohol, ["liver", "stomach"]);
  assert.equal(new Set(alcohol).size, alcohol.length);
});

test("alcohol includes the liver when the educational indexes do", () => {
  const ids = uniqueOrganIdsForSubstance("alcohol", educationalPairs());
  assert.equal(ids.includes("liver"), true);
  assert.equal(esOrgans.liver, "Hígado");
  assert.equal(enOrgans.liver, "Liver");
  assert.notEqual(esOrgans.liver, enOrgans.liver);
});

test("caffeine does not receive organs absent from the indexes", () => {
  const ids = uniqueOrganIdsForSubstance("caffeine", educationalPairs());
  assert.equal(ids.includes("liver"), false);
  assert.equal(ids.includes("testes"), false);
  assert.equal(ids.includes("ovaries"), false);
  assert.equal(ids.includes("heart"), true);
});

test("empty educational association stays empty", () => {
  assert.deepEqual(uniqueOrganIdsForSubstance("unknown", educationalPairs()), []);
  assert.ok(esExplore.educationalOrgansEmpty.length > 20);
  assert.ok(esExplore.systemNoOrgans.length > 20);
  assert.ok(enExplore.systemEmpty.length > 10);
});

test("organ labels change with the active language", () => {
  const ids = uniqueOrganIdsForSubstance("alcohol", educationalPairs());
  const esLabels = ids.map((id) => esOrgans[id as keyof typeof esOrgans] ?? id);
  const enLabels = ids.map((id) => enOrgans[id as keyof typeof enOrgans] ?? id);
  assert.notEqual(joinOrganLabels(esLabels), joinOrganLabels(enLabels));
  assert.match(joinOrganLabels(esLabels), /Hígado/);
  assert.match(joinOrganLabels(enLabels), /Liver/);
});

test("explore page no longer renders internal catalog counters (source)", () => {
  const page = readFileSync(new URL("../pages/ExplorePage.tsx", import.meta.url), "utf8");
  assert.match(page, /uniqueOrganIdsForSubstance/);
  assert.match(page, /shortDescription/);
  assert.match(page, /educationalOrgansTitle/);
  assert.equal(page.includes("damageProfiles"), false);
  assert.equal(page.includes("achievements.length"), false);
  assert.equal(page.includes("narrativePhases"), false);
  assert.equal(page.includes("coverageCounts"), false);
  assert.equal(page.includes("systemCoverage"), false);
  assert.equal(page.includes("organIndexCounts"), false);
  assert.equal(page.includes("narrativas"), false);
  assert.equal(page.includes("curvas"), false);
});
