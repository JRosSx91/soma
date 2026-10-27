import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import i18n from "i18next";
import { educationalNtProfiles } from "../anatomy/neurotransmitter-education.ts";
import enExploreEdu from "../../../i18n/locales/en/explore-edu.json" with { type: "json" };
import esExploreEdu from "../../../i18n/locales/es/explore-edu.json" with { type: "json" };
import {
  exploreEduHiddenMechanismTokens,
  exploreEduNtSheets,
  exploreEduRelatedI18nKey,
  exploreEduRelatedKey,
  exploreEduRelatedSheet,
  exploreEduSectionIds,
  exploreEduSheetIds,
  hasExploreEduNtSheet,
  isExploreEduNtSheetId,
  isPublishedExploreEduNtSheet,
  isPublishedExploreEduSheet,
  isPublishedExploreProcess,
  publishedExploreEduNtSheets,
  publishedExploreEduSheets,
  publishedExploreProcessSheets,
} from "./explore-edu.ts";
import { exploreProcessTopics } from "./explore-art.ts";
import { exploreNtPhases, featuredExploreNeurotransmitters } from "./explore-neurotransmitters.ts";

const page = readFileSync(new URL("../pages/ExplorePage.tsx", import.meta.url), "utf8");
const article = readFileSync(
  new URL("../components/ExploreEducationalArticle.tsx", import.meta.url),
  "utf8",
);
const sheet = readFileSync(new URL("../components/DetailSheet.tsx", import.meta.url), "utf8");
const config = readFileSync(new URL("../../../i18n/config.ts", import.meta.url), "utf8");

type LocaleBundle = typeof esExploreEdu;
const draftNtSheets = ["serotonin", "gaba", "glutamate", "norepinephrine"] as const;

function sheetSectionIds(bundle: LocaleBundle, id: keyof LocaleBundle["sheets"]): string[] {
  return Object.keys(bundle.sheets[id].sections);
}

async function eduI18n(lng: "es" | "en") {
  const instance = i18n.createInstance();
  await instance.init({
    lng,
    fallbackLng: "en",
    defaultNS: "explore-edu",
    ns: ["explore-edu"],
    resources: {
      es: { "explore-edu": esExploreEdu },
      en: { "explore-edu": enExploreEdu },
    },
    interpolation: { escapeValue: false },
  });
  return instance;
}

test("authored educational sheets cover dopamine, four drafts and receptors in ES and EN", () => {
  assert.deepEqual([...exploreEduSheetIds], [
    "dopamine",
    "serotonin",
    "gaba",
    "glutamate",
    "norepinephrine",
    "receptors",
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

test("new neurotransmitter drafts keep structural parity between Spanish and English", () => {
  for (const sheetId of draftNtSheets) {
    assert.deepEqual(sheetSectionIds(esExploreEdu, sheetId), sheetSectionIds(enExploreEdu, sheetId));
    assert.equal(
      esExploreEdu.sheets[sheetId].bibliography.length,
      enExploreEdu.sheets[sheetId].bibliography.length,
    );
    for (const sectionId of exploreEduSectionIds[sheetId]) {
      const esSection = esExploreEdu.sheets[sheetId].sections[sectionId];
      const enSection = enExploreEdu.sheets[sheetId].sections[sectionId];
      assert.equal(esSection.paragraphs.length, enSection.paragraphs.length, `${sheetId}.${sectionId}`);
      assert.equal(Boolean(esSection.analogies), Boolean(enSection.analogies), `${sheetId}.${sectionId} analogies`);
    }
  }
});

test("real i18n resources resolve educational titles and body copy instead of keys", async () => {
  const es = await eduI18n("es");
  const en = await eduI18n("en");
  const expected = {
    es: {
      serotonin: "¿Qué es la serotonina?",
      gaba: "¿Qué es el GABA?",
      glutamate: "¿Qué es el glutamato?",
      norepinephrine: "¿Qué es la noradrenalina?",
      dopamine: "¿Qué es la dopamina?",
      receptors: "¿Qué es un receptor?",
    },
    en: {
      serotonin: "What is serotonin?",
      gaba: "What is GABA?",
      glutamate: "What is glutamate?",
      norepinephrine: "What is noradrenaline?",
      dopamine: "What is dopamine?",
      receptors: "What is a receptor?",
    },
  } as const;
  for (const [lng, instance] of [
    ["es", es],
    ["en", en],
  ] as const) {
    for (const sheetId of exploreEduSheetIds) {
      const titleKey = `sheets.${sheetId}.sections.what.title`;
      const title = instance.t(titleKey);
      assert.equal(title, expected[lng][sheetId]);
      assert.notEqual(title, titleKey);
      const paragraphs = instance.t(`sheets.${sheetId}.sections.what.paragraphs`, { returnObjects: true });
      assert.equal(Array.isArray(paragraphs), true);
      assert.ok((paragraphs as string[])[0].length > 40);
      const relatedKey = `related.${exploreEduRelatedKey(sheetId)}`;
      const related = instance.t(relatedKey);
      assert.notEqual(related, relatedKey);
      assert.ok(related.length > 8);
    }
  }
  assert.match(es.t("sheets.gaba.sections.stopping.paragraphs.1"), /dependencia física/);
  assert.match(en.t("sheets.gaba.sections.stopping.paragraphs.1"), /physical dependence/);
  assert.match(es.t("sheets.serotonin.sections.what.paragraphs.1"), /enterocromafines/);
  assert.match(en.t("sheets.serotonin.sections.what.paragraphs.1"), /enterochromaffin/);
  assert.match(es.t("sheets.gaba.sections.drugs.paragraphs.0"), /algunos subtipos/);
  assert.match(en.t("sheets.gaba.sections.drugs.paragraphs.0"), /some subtypes/);
});

test("educational analogies are present in copy and rendered visible by default", () => {
  assert.equal(esExploreEdu.analogyHeading.includes("Para entenderlo mejor"), true);
  assert.equal(enExploreEdu.analogyHeading.includes("To picture this more clearly"), true);
  assert.ok(esExploreEdu.sheets.dopamine.sections.how.analogies?.[0]?.length);
  assert.ok(esExploreEdu.sheets.serotonin.sections.how.analogies?.[0]?.length);
  assert.ok(esExploreEdu.sheets.gaba.sections.how.analogies?.[0]?.length);
  assert.ok(esExploreEdu.sheets.glutamate.sections.how.analogies?.[0]?.length);
  assert.ok(esExploreEdu.sheets.norepinephrine.sections.how.analogies?.[0]?.length);
  assert.ok(enExploreEdu.sheets.serotonin.sections.how.analogies?.[0]?.length);
  assert.ok(esExploreEdu.sheets.receptors.sections.what.analogies?.[0]?.length);
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

test("six educational sheets are published; remaining cards stay unpublished", () => {
  assert.deepEqual([...publishedExploreEduNtSheets], [
    "dopamine",
    "serotonin",
    "gaba",
    "glutamate",
    "norepinephrine",
  ]);
  assert.deepEqual([...publishedExploreProcessSheets], ["receptors"]);
  assert.deepEqual([...publishedExploreEduSheets], [
    "dopamine",
    "serotonin",
    "gaba",
    "glutamate",
    "norepinephrine",
    "receptors",
  ]);
  for (const id of publishedExploreEduSheets) {
    assert.equal(isPublishedExploreEduSheet(id), true, id);
  }
  for (const id of draftNtSheets) {
    assert.equal(hasExploreEduNtSheet(id), true, id);
    assert.equal(isPublishedExploreEduNtSheet(id), true, id);
  }
  assert.equal(hasExploreEduNtSheet("acetylcholine"), false);
  assert.equal(isPublishedExploreEduNtSheet("acetylcholine"), false);
  assert.equal(isPublishedExploreEduSheet("endocannabinoid"), false);
  assert.equal(isPublishedExploreEduSheet("endorphin"), false);
  assert.equal(isPublishedExploreEduSheet("adenosine"), false);
  for (const id of exploreProcessTopics) {
    if (id === "receptors") continue;
    assert.equal(isPublishedExploreProcess(id), false);
  }
  assert.match(page, /isPublishedExploreEduNtSheet/);
  assert.match(page, /isPublishedExploreEduSheet/);
  assert.match(page, /isPublishedExploreProcess/);
  assert.match(page, /processesPreparing/);
});

test("article selection and related navigation use sheet identifiers instead of pilot literals", () => {
  assert.equal(exploreEduRelatedSheet.dopamine, "receptors");
  assert.equal(exploreEduRelatedSheet.receptors, "dopamine");
  assert.equal(exploreEduRelatedKey("dopamine"), "toReceptors");
  assert.equal(exploreEduRelatedKey("receptors"), "toDopamine");
  assert.equal(exploreEduRelatedKey("serotonin"), exploreEduRelatedI18nKey[exploreEduRelatedSheet.serotonin]);
  assert.equal(isExploreEduNtSheetId("glutamate"), true);
  assert.equal(isExploreEduNtSheetId("receptors"), false);
  assert.deepEqual([...exploreEduNtSheets], [
    "dopamine",
    "serotonin",
    "gaba",
    "glutamate",
    "norepinephrine",
  ]);
  assert.match(page, /sheetId=\{eduTarget\.id\}/);
  assert.equal(page.includes('sheetId="dopamine"'), false);
  assert.equal(page.includes('sheetId="receptors"'), false);
  assert.match(page, /isExploreEduNtSheetId\(id\)/);
  assert.match(page, /openRelatedEduSheet/);
  assert.equal(page.includes('id === "dopamine"'), false);
  assert.match(article, /onOpenRelated\(relatedId\)/);
  assert.match(article, /exploreEduRelatedKey\(sheetId\)/);
  assert.match(sheet, /size === "article"/);
});

test("cards without a published long sheet keep the previous short behaviour", () => {
  assert.equal(featuredExploreNeurotransmitters.includes("acetylcholine"), true);
  assert.equal(isPublishedExploreEduNtSheet("acetylcholine"), false);
  assert.match(page, /NeurotransmitterDetail/);
  assert.match(page, /isPublishedExploreEduNtSheet/);
  assert.match(page, /processesPreparing/);
  assert.equal(page.includes("openPublishedProcess(\"tolerance\")"), false);
});

test("educational articles open from keyboard-focusable buttons, not only neurotransmitter cards", () => {
  const index = readFileSync(
    new URL("../components/ExploreNeurotransmitterIndex.tsx", import.meta.url),
    "utf8",
  );
  assert.match(index, /type="button"/);
  assert.match(index, /onClick=\{\(\) => onOpen\(id\)\}/);
  assert.match(page, /onClick=\{\(\) => openPublishedProcess\(id\)\}/);
  assert.match(page, /type="button"/);
  assert.match(sheet, /useLayoutEffect/);
  assert.match(sheet, /readOpener/);
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
