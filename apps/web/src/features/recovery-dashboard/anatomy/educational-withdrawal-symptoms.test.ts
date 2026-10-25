import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import enPhases from "../../../i18n/locales/en/neurotransmitter-phases.json" with { type: "json" };
import esPhases from "../../../i18n/locales/es/neurotransmitter-phases.json" with { type: "json" };
import enCopy from "./educational-withdrawal-symptoms.en.json" with { type: "json" };
import esCopy from "./educational-withdrawal-symptoms.es.json" with { type: "json" };
import { narrativePhases } from "./narrative-catalog.ts";
import {
  assemblePublishedWithdrawalSymptomCatalog,
  authoredWithdrawalSymptomCatalog,
  hasCompletePublicWithdrawalSymptomCopy,
  isWithdrawalSymptomPublishable,
  isWithdrawalSymptomReadyForPublishedCatalog,
  lookupWithdrawalSymptomCopyLeaf,
  publishedWithdrawalSymptomCatalog,
  publishedWithdrawalSymptomCopyBundles,
  resolveEducationalWithdrawalSymptoms,
  withdrawalSymptomSourceNamespace,
  type EducationalWithdrawalSymptomItem,
  type WithdrawalSymptomPublicCopyBundles,
} from "./educational-withdrawal-symptoms.ts";

type PhaseBundle = Record<string, Record<string, Record<string, string>>>;
type CopyBundle = Record<string, Record<string, { name: string; shortDescription: string }>>;

const esPhaseBundle = esPhases as PhaseBundle;
const enPhaseBundle = enPhases as PhaseBundle;
const esCopyBundle = esCopy as CopyBundle;
const enCopyBundle = enCopy as CopyBundle;

function phaseText(bundle: PhaseBundle, key: string): string {
  const [substance, neurotransmitter, phase] = key.split(".");
  const text = bundle[substance ?? ""]?.[neurotransmitter ?? ""]?.[phase ?? ""];
  assert.equal(typeof text, "string", key);
  assert.notEqual(text?.trim(), "");
  return text ?? "";
}

function flattenCopyKeys(bundle: CopyBundle): string[] {
  return Object.entries(bundle).flatMap(([substance, symptoms]) =>
    Object.keys(symptoms).flatMap((symptomId) => [
      `${substance}.${symptomId}.name`,
      `${substance}.${symptomId}.shortDescription`,
    ]),
  );
}

function reviewed(item: EducationalWithdrawalSymptomItem): EducationalWithdrawalSymptomItem {
  return {
    ...item,
    editorialStatus: "clinically_reviewed",
    clinicalReview: "reviewed",
  };
}

test("authored ids are unique and match substance plus symptom", () => {
  const ids = authoredWithdrawalSymptomCatalog.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const item of authoredWithdrawalSymptomCatalog) {
    assert.equal(item.id, `${item.substanceId}.${item.symptomId}`);
    assert.equal(item.nameKey, `${item.id}.name`);
    assert.equal(item.shortDescriptionKey, `${item.id}.shortDescription`);
  }
});

test("candidates only use the five catalog substances and educational phases", () => {
  const substances = ["alcohol", "cocaine", "nicotine", "cannabis", "caffeine"];
  const pairs = new Set<string>();
  for (const item of authoredWithdrawalSymptomCatalog) {
    assert.equal(substances.includes(item.substanceId), true, item.id);
    assert.equal(item.phases.length > 0, true, item.id);
    assert.equal(item.phases.includes("during_use"), false, item.id);
    for (const phase of item.phases) {
      assert.equal((narrativePhases as readonly string[]).includes(phase), true, `${item.id}:${phase}`);
    }
    const pair = `${item.substanceId}:${item.symptomId}`;
    assert.equal(pairs.has(pair), false, pair);
    pairs.add(pair);
  }
});

test("each substance has a deduplicated candidate count", () => {
  const counts = Object.fromEntries(
    ["alcohol", "cocaine", "nicotine", "cannabis", "caffeine"].map((id) => [
      id,
      authoredWithdrawalSymptomCatalog.filter((item) => item.substanceId === id).length,
    ]),
  );
  assert.deepEqual(counts, {
    alcohol: 14,
    cocaine: 10,
    nicotine: 6,
    cannabis: 5,
    caffeine: 5,
  });
  assert.equal(authoredWithdrawalSymptomCatalog.length, 40);
});

test("source keys exist in reviewed spanish and english phase copy", () => {
  for (const item of authoredWithdrawalSymptomCatalog) {
    assert.equal(item.source.namespace, withdrawalSymptomSourceNamespace);
    for (const key of item.source.keys) {
      phaseText(esPhaseBundle, key);
      phaseText(enPhaseBundle, key);
    }
  }
});

test("candidates do not cite organ narratives, achievements, or advice drafts", () => {
  const source = readFileSync(new URL("./educational-withdrawal-symptoms.ts", import.meta.url), "utf8");
  assert.equal(source.includes("from \"./advice-drafts"), false);
  assert.equal(source.includes("organ-narrative.json"), false);
  assert.equal(source.includes("achievements.json"), false);
  assert.equal(source.includes("match(/convuls"), false);
  for (const item of authoredWithdrawalSymptomCatalog) {
    for (const key of item.source.keys) {
      assert.equal(key.startsWith("draft.advice"), false);
      assert.match(key, /^(alcohol|cocaine|nicotine|cannabis|caffeine)\.[a-z]+\.(acute_withdrawal|post_acute)$/);
    }
  }
});

test("spanish and english candidate copy stay paired and brief", () => {
  assert.deepEqual(flattenCopyKeys(esCopyBundle).sort(), flattenCopyKeys(enCopyBundle).sort());
  for (const item of authoredWithdrawalSymptomCatalog) {
    const esName = lookupWithdrawalSymptomCopyLeaf(esCopy, item.nameKey);
    const enName = lookupWithdrawalSymptomCopyLeaf(enCopy, item.nameKey);
    const esBody = lookupWithdrawalSymptomCopyLeaf(esCopy, item.shortDescriptionKey);
    const enBody = lookupWithdrawalSymptomCopyLeaf(enCopy, item.shortDescriptionKey);
    assert.equal(typeof esName, "string", item.nameKey);
    assert.equal(typeof enName, "string", item.nameKey);
    assert.notEqual(esName?.trim(), "");
    assert.notEqual(enName?.trim(), "");
    assert.notEqual(esBody, enBody, item.id);
    assert.ok((esBody?.length ?? 0) < 280, item.id);
    assert.ok((enBody?.length ?? 0) < 280, item.id);
    assert.equal(esBody?.includes("Qué puedes sentir"), false, item.id);
    assert.equal(enBody?.includes("What you may feel"), false, item.id);
    assert.equal(esBody?.includes("señal de alarma educativa"), false, item.id);
    assert.equal(enBody?.includes("educational warning"), false, item.id);
    assert.match(esBody ?? "", /^(?!.*(glutamato|dopamina|serotonina|adenosina|noradrenalina|receptores CB1|recuento de receptores))/i);
    assert.match(enBody ?? "", /^(?!.*(glutamate|dopamine|serotonin|adenosine|norepinephrine|CB1|receptor count))/i);
  }
  assert.equal(lookupWithdrawalSymptomCopyLeaf(esCopy, "cocaine.craving.name"), "Deseo de consumo");
  assert.equal(lookupWithdrawalSymptomCopyLeaf(esCopy, "nicotine.craving.name"), "Deseo de consumo");
  assert.equal(lookupWithdrawalSymptomCopyLeaf(enCopy, "cocaine.craving.name"), "Craving");
  assert.equal(lookupWithdrawalSymptomCopyLeaf(enCopy, "nicotine.craving.name"), "Craving");
  assert.equal(lookupWithdrawalSymptomCopyLeaf(esCopy, "cocaine.dysphoria.name"), "Disforia");
  assert.equal(lookupWithdrawalSymptomCopyLeaf(enCopy, "cocaine.dysphoria.name"), "Dysphoria");
  assert.equal(lookupWithdrawalSymptomCopyLeaf(esCopy, "alcohol.anhedonia.name"), "Anhedonia");
  assert.equal(lookupWithdrawalSymptomCopyLeaf(enCopy, "alcohol.anhedonia.name"), "Anhedonia");
});

test("all authored rows stay pending clinical review", () => {
  for (const item of authoredWithdrawalSymptomCatalog) {
    assert.equal(item.editorialStatus, "pending_clinical_review");
    assert.equal(item.clinicalReview, "pending");
    assert.equal(isWithdrawalSymptomPublishable(item), false, item.id);
  }
  const warnings = authoredWithdrawalSymptomCatalog.filter((item) => item.kind === "warning");
  assert.deepEqual(
    warnings.map((item) => item.id),
    ["alcohol.seizures", "alcohol.medical_care"],
  );
});

test("the published catalog and public copy bundles stay empty", () => {
  assert.deepEqual(publishedWithdrawalSymptomCopyBundles, { en: {}, es: {} });
  assert.deepEqual(publishedWithdrawalSymptomCatalog, []);
  const assembled = assemblePublishedWithdrawalSymptomCatalog(
    authoredWithdrawalSymptomCatalog,
    { en: enCopy, es: esCopy },
  );
  assert.deepEqual(assembled, []);
});

test("the public resolver does not return pending authored rows", () => {
  const leaked = resolveEducationalWithdrawalSymptoms(
    "alcohol",
    "acute_withdrawal",
    authoredWithdrawalSymptomCatalog,
  );
  assert.equal(leaked.empty, true);
  assert.deepEqual(leaked.items, []);
  const published = resolveEducationalWithdrawalSymptoms("alcohol", "acute_withdrawal");
  assert.equal(published.empty, true);
});

test("warnings cannot publish without clinical review even with candidate copy", () => {
  const warning = authoredWithdrawalSymptomCatalog.find((item) => item.id === "alcohol.seizures");
  assert.ok(warning);
  const reviewedUnfinished = {
    ...warning,
    editorialStatus: "clinically_reviewed" as const,
    clinicalReview: "pending" as const,
  };
  const bundles: WithdrawalSymptomPublicCopyBundles = { en: enCopy, es: esCopy };
  assert.equal(isWithdrawalSymptomPublishable(reviewedUnfinished), false);
  assert.equal(isWithdrawalSymptomReadyForPublishedCatalog(reviewedUnfinished, bundles), false);
  assert.equal(hasCompletePublicWithdrawalSymptomCopy(warning, bundles), true);
  assert.equal(
    assemblePublishedWithdrawalSymptomCatalog([reviewedUnfinished], bundles).length,
    0,
  );
});

test("a reviewed fixture can assemble only when public copy is supplied", () => {
  const seed = authoredWithdrawalSymptomCatalog.find((item) => item.id === "caffeine.headache");
  assert.ok(seed);
  const item = reviewed(seed);
  assert.equal(isWithdrawalSymptomPublishable(item), true);
  assert.equal(
    isWithdrawalSymptomReadyForPublishedCatalog(item, publishedWithdrawalSymptomCopyBundles),
    false,
  );
  const ready = assemblePublishedWithdrawalSymptomCatalog([item], { en: enCopy, es: esCopy });
  assert.equal(ready.length, 1);
  assert.equal(ready[0]?.id, "caffeine.headache");
  const resolved = resolveEducationalWithdrawalSymptoms("caffeine", "acute_withdrawal", ready);
  assert.equal(resolved.empty, false);
  assert.equal(resolved.items[0]?.id, "caffeine.headache");
  assert.equal(
    resolveEducationalWithdrawalSymptoms("caffeine", "during_use", ready).empty,
    true,
  );
});

test("unknown substance or phase resolves empty", () => {
  assert.equal(resolveEducationalWithdrawalSymptoms("opioid", "acute_withdrawal").empty, true);
  assert.equal(resolveEducationalWithdrawalSymptoms("alcohol", "paws").empty, true);
});
