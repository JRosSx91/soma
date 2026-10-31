import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { atlasSystems } from "./atlas-config.ts";
import {
  relatedArticlesForSystem,
  relatedContentForSystem,
  relatedMissionsForSystem,
  relatedSubstancesForSystem,
} from "./atlas-related-content.ts";
import { exploreEduSheetForOrgan, exploreEduSheetForSystem } from "../explore/explore-edu-anatomy.ts";

function systemById(id: string) {
  const system = atlasSystems.find((item) => item.id === id);
  assert.ok(system, id);
  return system;
}

test("related articles invert the published explore atlas map only", () => {
  const nervous = systemById("nervous-central");
  const articles = relatedArticlesForSystem(nervous).map((item) => item.sheetId);
  assert.equal(exploreEduSheetForSystem("nervous-central"), "neuroadaptation");
  assert.equal(exploreEduSheetForOrgan("brain-vta"), "dopamine");
  assert.equal(exploreEduSheetForOrgan("brain-hippocampus"), "glutamate");
  assert.deepEqual(articles.sort(), ["dopamine", "glutamate", "neuroadaptation"]);

  const hepatic = systemById("hepatic");
  assert.deepEqual(
    relatedArticlesForSystem(hepatic).map((item) => item.sheetId),
    ["metabolism"],
  );

  const endocrine = systemById("endocrine");
  assert.deepEqual(relatedArticlesForSystem(endocrine), []);
});

test("related substances come from catalog organ indexes, not invented lists", () => {
  const nervous = systemById("nervous-central");
  const substances = relatedSubstancesForSystem(nervous).map((item) => item.id);
  assert.ok(substances.includes("alcohol"));
  assert.ok(substances.includes("caffeine"));
  assert.equal(new Set(substances).size, substances.length);

  const endocrine = systemById("endocrine");
  assert.deepEqual(relatedSubstancesForSystem(endocrine), []);
});

test("related missions require a published sheet already linked to the system", () => {
  const nervous = systemById("nervous-central");
  const missionIds = relatedMissionsForSystem(nervous).map((item) => item.id);
  assert.ok(missionIds.includes("edu-dopamine-01"));
  assert.ok(missionIds.includes("edu-neuroadaptation-01"));
  assert.equal(missionIds.includes("edu-serotonin-01"), false);

  const endocrine = systemById("endocrine");
  assert.deepEqual(relatedMissionsForSystem(endocrine), []);
});

test("related content helper does not invent recovery percentages", () => {
  const source = readFileSync(new URL("./atlas-related-content.ts", import.meta.url), "utf8");
  assert.equal(source.includes("%"), false);
  assert.equal(source.includes("illustratedSystems"), false);
  const respiratory = relatedContentForSystem(systemById("respiratory"));
  assert.equal(Array.isArray(respiratory.articles), true);
  assert.equal(Array.isArray(respiratory.substances), true);
  assert.equal(Array.isArray(respiratory.missions), true);
});
