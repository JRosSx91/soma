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
  exploreEduProcessSheets,
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
const newlyPublishedNtSheets = ["acetylcholine", "endocannabinoid", "endorphin", "adenosine"] as const;
const processKeyDraftSheets = ["tolerance", "dependence", "neuroadaptation", "metabolism"] as const;

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

test("authored educational sheets cover nine neurotransmitters, receptors and four process drafts in ES and EN", () => {
  assert.deepEqual([...exploreEduSheetIds], [
    "dopamine",
    "serotonin",
    "gaba",
    "glutamate",
    "norepinephrine",
    "acetylcholine",
    "endocannabinoid",
    "endorphin",
    "adenosine",
    "receptors",
    "tolerance",
    "dependence",
    "neuroadaptation",
    "metabolism",
  ]);
  assert.deepEqual([...exploreEduProcessSheets], [
    "receptors",
    "tolerance",
    "dependence",
    "neuroadaptation",
    "metabolism",
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
  for (const sheetId of newlyPublishedNtSheets) {
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

test("process key drafts keep structural parity between Spanish and English", () => {
  for (const sheetId of processKeyDraftSheets) {
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
      acetylcholine: "¿Qué es la acetilcolina?",
      endocannabinoid: "¿Qué es el sistema endocannabinoide?",
      endorphin: "¿Qué son las endorfinas?",
      adenosine: "¿Qué es la adenosina?",
      receptors: "¿Qué es un receptor?",
      tolerance: "¿Qué es la tolerancia farmacológica?",
      dependence: "¿Qué es la dependencia física?",
      neuroadaptation: "¿Qué es la neuroadaptación?",
      metabolism: "¿Qué es el metabolismo de una sustancia?",
    },
    en: {
      serotonin: "What is serotonin?",
      gaba: "What is GABA?",
      glutamate: "What is glutamate?",
      norepinephrine: "What is noradrenaline?",
      dopamine: "What is dopamine?",
      acetylcholine: "What is acetylcholine?",
      endocannabinoid: "What is the endocannabinoid system?",
      endorphin: "What are endorphins?",
      adenosine: "What is adenosine?",
      receptors: "What is a receptor?",
      tolerance: "What is pharmacological tolerance?",
      dependence: "What is physical dependence?",
      neuroadaptation: "What is neuroadaptation?",
      metabolism: "What is the metabolism of a substance?",
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
  assert.match(es.t("sheets.acetylcholine.sections.what.paragraphs.2"), /no es acetilcolina/);
  assert.match(en.t("sheets.acetylcholine.sections.what.paragraphs.2"), /is not acetylcholine/);
  assert.match(es.t("sheets.endocannabinoid.sections.what.paragraphs.2"), /no es anandamida/);
  assert.match(en.t("sheets.endocannabinoid.sections.what.paragraphs.2"), /not anandamide/);
  assert.match(es.t("sheets.endorphin.sections.caveats.paragraphs.0"), /no son el placer/);
  assert.match(en.t("sheets.endorphin.sections.caveats.paragraphs.0"), /are not pleasure/);
  assert.match(es.t("sheets.adenosine.sections.what.paragraphs.1"), /Confundir adenosina con ATP/);
  assert.match(en.t("sheets.adenosine.sections.what.paragraphs.1"), /Confusing adenosine with ATP/);
  assert.match(es.t("sheets.acetylcholine.sections.repeated.paragraphs.0"), /disponibilidad o la expresión/);
  assert.match(en.t("sheets.acetylcholine.sections.repeated.paragraphs.0"), /availability or expression/);
  assert.match(
    JSON.stringify(es.t("sheets.endocannabinoid.sections.how.analogies", { returnObjects: true })),
    /No hace falta un alud/,
  );
  assert.match(
    JSON.stringify(en.t("sheets.endocannabinoid.sections.how.analogies", { returnObjects: true })),
    /flood of paper is not required/,
  );
  assert.match(es.t("sheets.endocannabinoid.sections.stopping.paragraphs.0"), /radioligando/);
  assert.match(en.t("sheets.endocannabinoid.sections.stopping.paragraphs.0"), /radioligand/);
  assert.match(es.t("sheets.endorphin.sections.drugs.paragraphs.0"), /naltrexona/);
  assert.match(en.t("sheets.endorphin.sections.drugs.paragraphs.0"), /naltrexone/);
  assert.match(es.t("sheets.adenosine.sections.repeated.paragraphs.0"), /se han propuesto/);
  assert.match(en.t("sheets.adenosine.sections.repeated.paragraphs.0"), /have been proposed/);
  assert.match(es.t("sheets.tolerance.sections.what.paragraphs.2"), /no significa necesariamente adicción/);
  assert.match(en.t("sheets.tolerance.sections.what.paragraphs.2"), /does not necessarily mean addiction/);
  assert.match(es.t("sheets.tolerance.sections.where.paragraphs.1"), /no son sinónimos universales/);
  assert.match(en.t("sheets.tolerance.sections.where.paragraphs.1"), /not universal synonyms/);
  assert.match(es.t("sheets.tolerance.sections.stopping.paragraphs.0"), /ejemplo relevante, no el único/);
  assert.match(en.t("sheets.tolerance.sections.stopping.paragraphs.0"), /relevant example, not the only one/);
  assert.match(es.t("sheets.dependence.sections.what.paragraphs.0"), /intensidad variable/);
  assert.match(en.t("sheets.dependence.sections.what.paragraphs.0"), /variable intensity/);
  assert.match(es.t("sheets.dependence.sections.kinds.paragraphs.0"), /deseo intenso de consumir \(craving\)/);
  assert.match(es.t("sheets.dependence.sections.kinds.paragraphs.0"), /no determina un diagnóstico/);
  assert.match(en.t("sheets.dependence.sections.kinds.paragraphs.0"), /does not determine a diagnosis/);
  assert.match(es.t("sheets.dependence.sections.substances.paragraphs.0"), /atención médica urgente/);
  assert.match(en.t("sheets.dependence.sections.substances.paragraphs.0"), /urgent medical care/);
  assert.match(es.t("sheets.neuroadaptation.sections.what.paragraphs.0"), /modificaciones estructurales de las conexiones sinápticas/);
  assert.match(en.t("sheets.neuroadaptation.sections.what.paragraphs.0"), /structural modifications of synaptic connections/);
  assert.match(es.t("sheets.neuroadaptation.sections.kinds.paragraphs.0"), /no significa necesariamente daño neuronal/);
  assert.match(en.t("sheets.neuroadaptation.sections.kinds.paragraphs.0"), /does not necessarily mean neuronal damage/);
  assert.match(es.t("sheets.neuroadaptation.sections.stopping.paragraphs.0"), /calendarios universales/);
  assert.match(en.t("sheets.neuroadaptation.sections.stopping.paragraphs.0"), /universal calendars/);
  assert.match(es.t("sheets.metabolism.sections.how.paragraphs.1"), /no equivale a la duración del efecto/);
  assert.match(en.t("sheets.metabolism.sections.how.paragraphs.1"), /not the same as duration of effect/);
  assert.match(es.t("sheets.metabolism.sections.where.paragraphs.0"), /CYP identifica esa familia/);
  assert.match(en.t("sheets.metabolism.sections.where.paragraphs.0"), /CYP names that enzyme family/);
  assert.match(es.t("sheets.metabolism.sections.substances.paragraphs.0"), /algunas vías metabólicas se saturan/);
  assert.match(en.t("sheets.metabolism.sections.substances.paragraphs.0"), /some metabolic routes saturate/);
  assert.match(es.t("sheets.metabolism.sections.substances.paragraphs.1"), /varias rutas metabólicas/);
  assert.match(en.t("sheets.metabolism.sections.substances.paragraphs.1"), /several metabolic routes/);
  assert.match(es.t("sheets.metabolism.sections.stopping.paragraphs.1"), /pruebas toxicológicas/);
  assert.match(en.t("sheets.metabolism.sections.stopping.paragraphs.1"), /toxicology tests/);
  assert.match(
    JSON.stringify(es.t("sheets.tolerance.sections.how.analogies", { returnObjects: true })),
    /climatización adaptable/,
  );
  assert.match(
    JSON.stringify(en.t("sheets.tolerance.sections.how.analogies", { returnObjects: true })),
    /adaptive climate-control/,
  );
});

test("educational analogies are present in copy and rendered visible by default", () => {
  assert.equal(esExploreEdu.analogyHeading.includes("Para entenderlo mejor"), true);
  assert.equal(enExploreEdu.analogyHeading.includes("To picture this more clearly"), true);
  assert.ok(esExploreEdu.sheets.dopamine.sections.how.analogies?.[0]?.length);
  assert.ok(esExploreEdu.sheets.serotonin.sections.how.analogies?.[0]?.length);
  assert.ok(esExploreEdu.sheets.gaba.sections.how.analogies?.[0]?.length);
  assert.ok(esExploreEdu.sheets.glutamate.sections.how.analogies?.[0]?.length);
  assert.ok(esExploreEdu.sheets.norepinephrine.sections.how.analogies?.[0]?.length);
  assert.ok(esExploreEdu.sheets.acetylcholine.sections.how.analogies?.[0]?.length);
  assert.ok(esExploreEdu.sheets.endocannabinoid.sections.how.analogies?.[0]?.length);
  assert.ok(esExploreEdu.sheets.endorphin.sections.how.analogies?.[0]?.length);
  assert.ok(esExploreEdu.sheets.adenosine.sections.how.analogies?.[0]?.length);
  assert.ok(enExploreEdu.sheets.serotonin.sections.how.analogies?.[0]?.length);
  assert.ok(esExploreEdu.sheets.receptors.sections.what.analogies?.[0]?.length);
  assert.ok(esExploreEdu.sheets.tolerance.sections.how.analogies?.[0]?.length);
  assert.ok(esExploreEdu.sheets.dependence.sections.how.analogies?.[0]?.length);
  assert.ok(esExploreEdu.sheets.neuroadaptation.sections.how.analogies?.[0]?.length);
  assert.ok(esExploreEdu.sheets.metabolism.sections.how.analogies?.[0]?.length);
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

test("fourteen educational sheets are published including the four process-key articles", () => {
  assert.deepEqual([...publishedExploreEduNtSheets], [
    "dopamine",
    "serotonin",
    "gaba",
    "glutamate",
    "norepinephrine",
    "acetylcholine",
    "endocannabinoid",
    "endorphin",
    "adenosine",
  ]);
  assert.deepEqual([...publishedExploreProcessSheets], [
    "receptors",
    "tolerance",
    "dependence",
    "neuroadaptation",
    "metabolism",
  ]);
  assert.deepEqual([...publishedExploreEduSheets], [
    "dopamine",
    "serotonin",
    "gaba",
    "glutamate",
    "norepinephrine",
    "acetylcholine",
    "endocannabinoid",
    "endorphin",
    "adenosine",
    "receptors",
    "tolerance",
    "dependence",
    "neuroadaptation",
    "metabolism",
  ]);
  assert.equal(publishedExploreEduSheets.length, 14);
  for (const id of publishedExploreEduSheets) {
    assert.equal(isPublishedExploreEduSheet(id), true, id);
  }
  for (const id of newlyPublishedNtSheets) {
    assert.equal(hasExploreEduNtSheet(id), true, id);
    assert.equal(isPublishedExploreEduNtSheet(id), true, id);
  }
  for (const id of exploreProcessTopics) {
    assert.equal(isPublishedExploreProcess(id), true, id);
  }
  for (const id of processKeyDraftSheets) {
    assert.equal(isPublishedExploreEduSheet(id), true, id);
  }
  assert.equal(exploreEduRelatedSheet.tolerance, "neuroadaptation");
  assert.equal(exploreEduRelatedSheet.dependence, "tolerance");
  assert.equal(exploreEduRelatedSheet.neuroadaptation, "receptors");
  assert.equal(exploreEduRelatedSheet.metabolism, "tolerance");
  assert.equal(exploreEduRelatedKey("tolerance"), "toNeuroadaptation");
  assert.equal(exploreEduRelatedKey("dependence"), "toTolerance");
  assert.equal(exploreEduRelatedKey("metabolism"), "toTolerance");
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
    "acetylcholine",
    "endocannabinoid",
    "endorphin",
    "adenosine",
  ]);
  assert.match(page, /sheetId=\{eduTarget\.id\}/);
  assert.equal(page.includes('sheetId="dopamine"'), false);
  assert.equal(page.includes('sheetId="receptors"'), false);
  assert.match(page, /isExploreEduNtSheetId/);
  assert.match(page, /isPublishedExploreEduSheet\(id\)/);
  assert.match(page, /openRelatedEduSheet/);
  assert.equal(page.includes('id === "dopamine"'), false);
  assert.match(article, /onOpenRelated\(relatedId\)/);
  assert.match(article, /exploreEduRelatedKey\(sheetId\)/);
  assert.match(sheet, /size === "article"/);
});

test("cards without a published long sheet keep the previous short behaviour", () => {
  assert.equal(featuredExploreNeurotransmitters.includes("acetylcholine"), true);
  assert.equal(isPublishedExploreEduNtSheet("acetylcholine"), true);
  assert.match(page, /NeurotransmitterDetail/);
  assert.match(page, /isPublishedExploreEduNtSheet/);
  assert.match(page, /processesPreparing/);
  assert.equal(isPublishedExploreProcess("tolerance"), true);
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
  assert.match(page, /onClose=\{\(\) => setExploreEdu\(null\)\}/);
  assert.match(page, /setExploreEdu\(null\)/);
  assert.match(page, /restoreOpener|DetailSheet/);
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
