import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { educationalNtProfiles } from "../anatomy/neurotransmitter-education.ts";
import enExploreEdu from "../../../i18n/locales/en/explore-edu.json" with { type: "json" };
import esExploreEdu from "../../../i18n/locales/es/explore-edu.json" with { type: "json" };
import {
  exploreEduHiddenMechanismTokens,
  exploreEduNtSheets,
  exploreEduRelatedSheet,
  exploreEduSectionIds,
  exploreEduSheetIds,
  hasExploreEduNtSheet,
  isPublishedExploreProcess,
  publishedExploreProcessSheets,
} from "./explore-edu.ts";
import { exploreProcessTopics } from "./explore-art.ts";
import { exploreNtPhases } from "./explore-neurotransmitters.ts";

const page = readFileSync(new URL("../pages/ExplorePage.tsx", import.meta.url), "utf8");
const article = readFileSync(
  new URL("../components/ExploreEducationalArticle.tsx", import.meta.url),
  "utf8",
);
const sheet = readFileSync(new URL("../components/DetailSheet.tsx", import.meta.url), "utf8");
const config = readFileSync(new URL("../../../i18n/config.ts", import.meta.url), "utf8");

type LocaleBundle = typeof esExploreEdu;

function sheetSectionIds(bundle: LocaleBundle, id: keyof LocaleBundle["sheets"]): string[] {
  return Object.keys(bundle.sheets[id].sections);
}

test("dopamine and receptors sheets expose every approved section in ES and EN", () => {
  assert.deepEqual([...exploreEduSheetIds], ["dopamine", "receptors"]);
  assert.deepEqual([...exploreEduSectionIds.dopamine], [
    "what",
    "how",
    "purpose",
    "pathways",
    "drugs",
    "repeated",
    "stopping",
    "caveats",
  ]);
  assert.deepEqual([...exploreEduSectionIds.receptors], [
    "what",
    "how",
    "agonists",
    "transmitters",
    "drugs",
    "change",
    "tolerance",
    "caveats",
  ]);
  for (const locale of [esExploreEdu, enExploreEdu] as const) {
    for (const sheetId of exploreEduSheetIds) {
      assert.deepEqual(sheetSectionIds(locale, sheetId), [...exploreEduSectionIds[sheetId]]);
      for (const sectionId of exploreEduSectionIds[sheetId]) {
        const section = locale.sheets[sheetId].sections[sectionId];
        assert.ok(section.title.trim().length > 0, `${sheetId}.${sectionId} title`);
        assert.ok(section.paragraphs.length > 0, `${sheetId}.${sectionId} paragraphs`);
      }
      assert.ok(locale.sheets[sheetId].bibliography.length >= 2);
    }
  }
});

test("educational analogies are present in copy and rendered visible by default", () => {
  assert.equal(esExploreEdu.analogyHeading.includes("Para entenderlo mejor"), true);
  assert.equal(enExploreEdu.analogyHeading.includes("To picture this more clearly"), true);
  assert.ok(esExploreEdu.sheets.dopamine.sections.how.analogies?.[0]?.length);
  assert.ok(enExploreEdu.sheets.dopamine.sections.how.analogies?.[0]?.length);
  assert.ok(esExploreEdu.sheets.receptors.sections.what.analogies?.[0]?.length);
  assert.ok(esExploreEdu.sheets.receptors.sections.agonists.analogies?.[0]?.length);
  assert.ok(enExploreEdu.sheets.receptors.sections.what.analogies?.[0]?.length);
  assert.ok(enExploreEdu.sheets.receptors.sections.agonists.analogies?.[0]?.length);
  assert.match(article, /data-edu-analogy/);
  assert.equal(article.includes("<aside"), true);
  assert.equal(article.includes("hidden"), false);
});

test("reader-facing educational copy does not leak catalog mechanism ids", () => {
  const visible = [
    JSON.stringify(esExploreEdu),
    JSON.stringify(enExploreEdu),
    article,
  ].join("\n");
  for (const token of exploreEduHiddenMechanismTokens) {
    assert.equal(visible.includes(token), false, token);
  }
});

test("receptors is the only published process and the other four stay unavailable", () => {
  assert.deepEqual([...publishedExploreProcessSheets], ["receptors"]);
  assert.equal(isPublishedExploreProcess("receptors"), true);
  for (const id of exploreProcessTopics) {
    if (id === "receptors") continue;
    assert.equal(isPublishedExploreProcess(id), false);
  }
  assert.match(page, /isPublishedExploreProcess/);
  assert.match(page, /openPublishedProcess/);
  assert.match(page, /processesPreparing/);
  assert.equal(page.includes("openPublishedProcess(\"tolerance\")"), false);
});

test("dopamine and receptors share one DetailSheet and can navigate to each other", () => {
  assert.equal(exploreEduRelatedSheet.dopamine, "receptors");
  assert.equal(exploreEduRelatedSheet.receptors, "dopamine");
  assert.equal(hasExploreEduNtSheet("dopamine"), true);
  assert.equal(hasExploreEduNtSheet("serotonin"), false);
  assert.deepEqual([...exploreEduNtSheets], ["dopamine"]);
  assert.match(page, /ExploreEducationalArticle/);
  assert.match(page, /openRelatedEduSheet/);
  assert.match(page, /eduTarget/);
  assert.equal(page.includes("role=\"dialog\""), false);
  assert.match(sheet, /role="dialog"/);
  assert.match(sheet, /size === "article"/);
  assert.match(article, /onOpenRelated\(relatedId\)/);
  assert.match(article, /scroller\.scrollTop = 0/);
});

test("closing the educational panel still uses the shared accessible DetailSheet", () => {
  assert.match(sheet, /aria-modal="true"/);
  assert.match(sheet, /t\("close"\)/);
  assert.match(page, /onClose=\{\(\) => setEduTarget\(null\)\}/);
  assert.match(page, /setEduTarget\(null\)/);
});

test("educational sheets do not rewrite existing profiles or phases", () => {
  assert.equal(educationalNtProfiles.length, 14);
  assert.deepEqual([...exploreNtPhases], [
    "during_use",
    "acute_withdrawal",
    "post_acute",
    "normalizing",
  ]);
  assert.match(page, /ExploreNeurotransmitters/);
  assert.match(config, /"explore-edu"/);
  assert.equal(page.includes("authoredEducationalNtEvidenceCatalog"), false);
  assert.equal(page.includes("/me/neurotransmitter-state"), false);
});
