import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { narrativeCatalogPairs } from "../anatomy/narrative-catalog.ts";
import { recoveryCatalogPairs } from "../anatomy/recovery-catalog.ts";
import { atlasSystems } from "../anatomy/atlas-config.ts";
import {
  anatomyExplorerHrefForOrgan,
  atlasSystemIdForOrgan,
} from "../anatomy/anatomy-explorer-query.ts";
import enExplore from "../../../i18n/locales/en/explore.json" with { type: "json" };
import esExplore from "../../../i18n/locales/es/explore.json" with { type: "json" };
import enOrgans from "../../../i18n/locales/en/organs.json" with { type: "json" };
import esOrgans from "../../../i18n/locales/es/organs.json" with { type: "json" };
import enSubstances from "../../../i18n/locales/en/substances.json" with { type: "json" };
import esSubstances from "../../../i18n/locales/es/substances.json" with { type: "json" };
import {
  groupEducationalOrgansByAtlasSystem,
  joinOrganLabels,
  uniqueOrganIdsForSubstance,
} from "./explore-organs.ts";

function educationalPairs() {
  return [...narrativeCatalogPairs(), ...recoveryCatalogPairs()];
}

const VISIBLE_COPY_KEYS = [
  "description",
  "searchLabel",
  "loading",
  "loadError",
  "noResults",
  "substancesHint",
  "systemEmpty",
  "catalogCategory",
  "educationalOrgansTitle",
  "educationalOrgansHint",
  "educationalOrgansEmpty",
  "ntEmpty",
  "systemNoOrgans",
] as const;

test("substance cards copy uses localized descriptions, not catalog counters", () => {
  assert.ok(esSubstances.alcohol.shortDescription.length > 40);
  assert.ok(enSubstances.alcohol.shortDescription.length > 40);
  assert.notEqual(esSubstances.alcohol.shortDescription, enSubstances.alcohol.shortDescription);
  assert.equal("coverageCounts" in esExplore, false);
  assert.equal("indexedCoverage" in enExplore, false);
  assert.equal(esExplore.educationalOrgansTitle, "Órganos y zonas");
  assert.equal(enExplore.educationalOrgansTitle, "Organs and regions");
});

test("visible explore copy does not saturate catalog wording", () => {
  for (const key of VISIBLE_COPY_KEYS) {
    assert.equal(esExplore[key].toLowerCase().includes("catálogo"), false, key);
    assert.equal(enExplore[key].toLowerCase().includes("catalog"), false, key);
  }
  assert.match(esExplore.ntPhaseNotice, /catálogo/);
  assert.match(enExplore.ntPhaseNotice, /catalog/);
  assert.equal(esExplore.description.includes("canónicos"), false);
  assert.equal(enExplore.description.toLowerCase().includes("canonical"), false);
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

test("alcohol and cannabis include the hippocampus from educational indexes", () => {
  const alcohol = uniqueOrganIdsForSubstance("alcohol", educationalPairs());
  const cannabis = uniqueOrganIdsForSubstance("cannabis", educationalPairs());
  const caffeine = uniqueOrganIdsForSubstance("caffeine", educationalPairs());
  assert.equal(alcohol.includes("brain-hippocampus"), true);
  assert.equal(cannabis.includes("brain-hippocampus"), true);
  assert.equal(caffeine.includes("brain-hippocampus"), false);
  assert.equal(esOrgans["brain-hippocampus"], "Hipocampo");
  assert.equal(enOrgans["brain-hippocampus"], "Hippocampus");
});

test("educational organs group by atlas system order without duplicates", () => {
  const ids = uniqueOrganIdsForSubstance("alcohol", educationalPairs());
  const groups = groupEducationalOrgansByAtlasSystem([...ids, ids[0]!]);
  const flattened = groups.flatMap((group) => [...group.organIds]);
  assert.equal(new Set(flattened).size, flattened.length);
  assert.deepEqual(
    groups.map((group) => group.systemId),
    atlasSystems
      .map((system) => system.id)
      .filter((systemId) => groups.some((group) => group.systemId === systemId)),
  );
  const nervous = groups.find((group) => group.systemId === "nervous-central");
  assert.ok(nervous);
  assert.equal(nervous.organIds.includes("brain-hippocampus"), true);
  const nervousOrder = atlasSystems
    .find((system) => system.id === "nervous-central")!
    .organs.map((organ) => organ.id)
    .filter((organId) => ids.includes(organId));
  assert.deepEqual([...nervous.organIds], nervousOrder);
  const hepaticIndex = groups.findIndex((group) => group.systemId === "hepatic");
  const nervousIndex = groups.findIndex((group) => group.systemId === "nervous-central");
  assert.ok(nervousIndex >= 0 && hepaticIndex > nervousIndex);
});

test("organs absent from the atlas stay ungrouped and unlinkable", () => {
  const groups = groupEducationalOrgansByAtlasSystem(["liver", "not-an-atlas-organ"]);
  assert.deepEqual(groups[groups.length - 1], {
    systemId: null,
    organIds: ["not-an-atlas-organ"],
  });
  assert.equal(atlasSystemIdForOrgan("not-an-atlas-organ"), null);
  assert.equal(anatomyExplorerHrefForOrgan("/preview", "not-an-atlas-organ"), null);
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
  assert.deepEqual(groupEducationalOrgansByAtlasSystem([]), []);
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
  assert.match(joinOrganLabels(esLabels), /Hipocampo/);
  assert.match(joinOrganLabels(enLabels), /Hippocampus/);
});

test("explore page no longer renders internal catalog counters (source)", () => {
  const page = readFileSync(new URL("../pages/ExplorePage.tsx", import.meta.url), "utf8");
  assert.match(page, /uniqueOrganIdsForSubstance/);
  assert.match(page, /groupEducationalOrgansByAtlasSystem/);
  assert.match(page, /anatomyExplorerHrefForOrgan/);
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
  assert.equal(page.includes("educational-withdrawal-symptoms"), false);
  assert.equal(page.includes('searchParams.get("substance")'), false);
  assert.equal(page.includes('searchParams.get("phase")'), false);
  assert.equal(page.includes('searchParams.get("tab")'), false);
});
