import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import enPhases from "../../../i18n/locales/en/neurotransmitter-phases.json" with { type: "json" };
import esPhases from "../../../i18n/locales/es/neurotransmitter-phases.json" with { type: "json" };
import {
  educationalNtFullPhaseCopyKeys,
  keepsFullPhaseCopyVisible,
} from "./educational-nt-safety.ts";

type PhaseBundle = Record<string, Record<string, Record<string, string>>>;

function phaseText(bundle: PhaseBundle, key: string): string {
  const [substance, neurotransmitter, phase] = key.split(".");
  const text = bundle[substance ?? ""]?.[neurotransmitter ?? ""]?.[phase ?? ""];
  assert.equal(typeof text, "string", key);
  assert.notEqual(text?.trim(), "");
  return text ?? "";
}

test("full-phase exceptions are an explicit catalog list, not a keyword scan", () => {
  const source = readFileSync(new URL("./educational-nt-safety.ts", import.meta.url), "utf8");
  assert.equal(source.includes("convuls"), false);
  assert.equal(source.includes("seizure"), false);
  assert.match(source, /alcohol\.gaba\.acute_withdrawal/);
  assert.match(source, /alcohol\.glutamate\.acute_withdrawal/);
  assert.deepEqual([...educationalNtFullPhaseCopyKeys], [
    "alcohol.gaba.acute_withdrawal",
    "alcohol.glutamate.acute_withdrawal",
  ]);
});

test("exception keys keep the full published ES and EN paragraphs", () => {
  const es = esPhases as PhaseBundle;
  const en = enPhases as PhaseBundle;
  assert.equal(
    phaseText(es, "alcohol.gaba.acute_withdrawal"),
    es.alcohol.gaba.acute_withdrawal,
  );
  assert.equal(
    phaseText(en, "alcohol.glutamate.acute_withdrawal"),
    en.alcohol.glutamate.acute_withdrawal,
  );
  assert.match(es.alcohol.gaba.acute_withdrawal, /convulsiones/);
  assert.match(es.alcohol.gaba.acute_withdrawal, /supervisión médica/);
  assert.match(en.alcohol.gaba.acute_withdrawal, /seizures/);
  assert.match(en.alcohol.gaba.acute_withdrawal, /Medical supervision/);
  assert.match(es.alcohol.glutamate.acute_withdrawal, /convulsiones/);
  assert.match(es.alcohol.glutamate.acute_withdrawal, /atención médica/);
  assert.match(en.alcohol.glutamate.acute_withdrawal, /seizures/);
  assert.match(en.alcohol.glutamate.acute_withdrawal, /Seek medical care/);
});

test("only the mapped alcohol acute combinations keep the full paragraph visible", () => {
  assert.equal(keepsFullPhaseCopyVisible("alcohol", "gaba", "acute_withdrawal"), true);
  assert.equal(keepsFullPhaseCopyVisible("alcohol", "glutamate", "acute_withdrawal"), true);
  assert.equal(keepsFullPhaseCopyVisible("alcohol", "gaba", "during_use"), false);
  assert.equal(keepsFullPhaseCopyVisible("alcohol", "dopamine", "acute_withdrawal"), false);
  assert.equal(keepsFullPhaseCopyVisible("cannabis", "endocannabinoid", "acute_withdrawal"), false);
  assert.equal(keepsFullPhaseCopyVisible("caffeine", "adenosine", "acute_withdrawal"), false);
});

test("explore cards keep exception copy outside a closed details block", () => {
  const card = readFileSync(
    new URL("../components/ExploreNeurotransmitterCard.tsx", import.meta.url),
    "utf8",
  );
  assert.match(card, /keepsFullPhaseCopyVisible/);
  assert.match(card, /keepPhaseVisible && explanation/);
  assert.match(card, /CatalogDetails/);
  assert.equal(card.includes("convuls"), false);
  assert.equal(card.includes("ntStateLabel"), false);
  assert.equal(card.includes("educationalAnatomyHrefForSignaling"), false);
});
