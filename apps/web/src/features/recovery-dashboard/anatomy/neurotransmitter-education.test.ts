import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  educationalEffectsSubstances,
  educationalNtProfiles,
  educationalOrganNeurotransmitters,
  firstEducationalOrganForSignaling,
  resolveEducationalNeurotransmittersForSubstance,
  resolveEducationalSignaling,
  signalingSubstances,
} from "./neurotransmitter-education.ts";
import { narrativePhases, resolveEducationalNarrative } from "./narrative-catalog.ts";

const mapSource = readFileSync(
  new URL("../../../../../../apps/api/src/neurotransmitter-state/organ-neurotransmitter-map.ts", import.meta.url),
  "utf8",
);
const seedSource = readFileSync(
  new URL("../../../../../../apps/api/prisma/seed/neurotransmitter-profiles.ts", import.meta.url),
  "utf8",
);
const page = readFileSync(new URL("../pages/AnatomyExplorerPage.tsx", import.meta.url), "utf8");
const adapter = readFileSync(new URL("./neurotransmitter-education.ts", import.meta.url), "utf8");
const esPhases = JSON.parse(
  readFileSync(new URL("../../../i18n/locales/es/neurotransmitter-phases.json", import.meta.url), "utf8"),
) as Record<string, Record<string, Record<string, string>>>;

test("caffeine does not receive GABA on organs that list GABA", () => {
  const vta = resolveEducationalSignaling("brain-vta", "caffeine", "during_use");
  assert.equal(vta.some((entry) => entry.neurotransmitter === "gaba"), false);
  assert.deepEqual(
    vta.map((entry) => entry.neurotransmitter),
    ["dopamine"],
  );
});

test("alcohol and liver receive no neurotransmitters when the organ is unmapped", () => {
  assert.equal("liver" in educationalOrganNeurotransmitters, false);
  assert.deepEqual(resolveEducationalSignaling("liver", "alcohol", "during_use"), []);
  assert.ok(resolveEducationalNarrative("liver", "alcohol", "during_use"));
});

test("VTA and alcohol keep only transmitters present in both map and profiles", () => {
  const ids = resolveEducationalSignaling("brain-vta", "alcohol", "during_use").map(
    (entry) => entry.neurotransmitter,
  );
  assert.deepEqual(ids, ["dopamine", "gaba"]);
  assert.equal(ids.includes("glutamate"), false);
  assert.equal(ids.includes("serotonin"), false);
});

test("substances without a compatible profile produce an empty list", () => {
  assert.deepEqual(resolveEducationalSignaling("brain-vta", "unknown", "during_use"), []);
  assert.deepEqual(resolveEducationalSignaling("heart", "nicotine", "during_use"), []);
});

test("organs without a neurotransmitter map receive no profiles", () => {
  assert.deepEqual(resolveEducationalSignaling("testes", "cannabis", "during_use"), []);
  assert.deepEqual(resolveEducationalSignaling("lungs", "nicotine", "during_use"), []);
  assert.deepEqual(signalingSubstances("pancreas"), []);
});

test("signaling entries are unique per neurotransmitter", () => {
  const ids = resolveEducationalSignaling("brain-prefrontal-cortex", "alcohol", "during_use").map(
    (entry) => entry.neurotransmitter,
  );
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(new Set(educationalNtProfiles.map((p) => `${p.substanceId}|${p.neurotransmitter}`)).size, 14);
});

test("each educational phase uses its own catalog copy", () => {
  for (const phase of narrativePhases) {
    const entries = resolveEducationalSignaling("brain-vta", "alcohol", phase);
    assert.equal(entries.length, 2);
    for (const entry of entries) {
      assert.equal(entry.phase, phase);
      assert.equal(entry.phaseKey, `alcohol.${entry.neurotransmitter}.${phase}`);
      assert.equal(typeof esPhases.alcohol[entry.neurotransmitter][phase], "string");
      assert.notEqual(esPhases.alcohol[entry.neurotransmitter][phase], "");
    }
  }
});

test("endorphin stays out unless a profile exists", () => {
  const nac = resolveEducationalSignaling("brain-nucleus-accumbens", "cannabis", "during_use");
  assert.deepEqual(
    nac.map((entry) => entry.neurotransmitter),
    ["dopamine", "endocannabinoid"],
  );
  assert.equal(nac.some((entry) => entry.neurotransmitter === "endorphin"), false);
});

test("heart caffeine intersects on adenosine only", () => {
  const entries = resolveEducationalSignaling("heart", "caffeine", "during_use");
  assert.deepEqual(
    entries.map((entry) => entry.neurotransmitter),
    ["adenosine"],
  );
  assert.equal(entries[0]?.mechanismKey, "ADENOSINE_RECEPTOR_BLOCKADE");
});

test("educational effects substances union narrative and signaling without inventing organs", () => {
  assert.equal(educationalEffectsSubstances("liver").includes("alcohol"), true);
  assert.equal(educationalEffectsSubstances("brain-vta").includes("alcohol"), true);
  assert.equal(educationalEffectsSubstances("testes").length, 0);
});

test("adapter and effects panel do not read severity, curves, or personal endpoints", () => {
  for (const token of [
    "maxSeverity",
    "daysTo95Recovery",
    "recoveryCeiling",
    "/me/neurotransmitter-state",
    "/me/organ-narrative-state",
    "useNeurotransmitterState",
    "NeurotransmitterPanel",
    "resultingSeverity",
    "estimateCurve",
  ]) {
    assert.equal(adapter.includes(token), false, token);
  }
  const effectsBlock = page.slice(page.indexOf("function EffectsPanel"), page.indexOf("function RecoveryPanel"));
  for (const token of [
    "maxSeverity",
    "resolveEducationalRecovery",
    "useNeurotransmitterState",
    "NeurotransmitterPanel",
    "/me/",
  ]) {
    assert.equal(effectsBlock.includes(token), false, token);
  }
  assert.match(effectsBlock, /resolveEducationalSignaling/);
  assert.match(effectsBlock, /signalingTitle/);
  assert.match(effectsBlock, /signalingAttribution/);
  assert.match(effectsBlock, /EducationalSignalingCard/);
  assert.match(effectsBlock, /resolveEducationalNarrative/);
  assert.match(effectsBlock, /CatalogEvidenceNote/);
  const card = readFileSync(
    new URL("../components/EducationalSignalingCard.tsx", import.meta.url),
    "utf8",
  );
  assert.equal(card.includes("referenceSource"), false);
  assert.equal(card.includes("confidenceLevel"), false);
});

test("substance explorer lists catalog transmitters without inventing endorphin", () => {
  const alcohol = resolveEducationalNeurotransmittersForSubstance("alcohol", "during_use");
  assert.deepEqual(
    alcohol.map((entry) => entry.neurotransmitter),
    ["gaba", "glutamate", "dopamine", "serotonin"],
  );
  const caffeine = resolveEducationalNeurotransmittersForSubstance("caffeine", "acute_withdrawal");
  assert.deepEqual(
    caffeine.map((entry) => entry.neurotransmitter),
    ["adenosine", "dopamine"],
  );
  assert.deepEqual(resolveEducationalNeurotransmittersForSubstance("unknown", "during_use"), []);
  for (const phase of narrativePhases) {
    const cannabis = resolveEducationalNeurotransmittersForSubstance("cannabis", phase);
    assert.equal(cannabis.some((entry) => entry.neurotransmitter === "endorphin"), false);
    assert.equal(cannabis.length, 3);
    for (const entry of cannabis) {
      assert.equal(entry.phase, phase);
      assert.equal(entry.phaseKey, `cannabis.${entry.neurotransmitter}.${phase}`);
    }
  }
});

test("first educational organ for signaling stays inside the atlas intersection", () => {
  assert.equal(
    firstEducationalOrganForSignaling("alcohol", "gaba", "during_use"),
    "brain-vta",
  );
  assert.equal(firstEducationalOrganForSignaling("nicotine", "endorphin", "during_use"), null);
  assert.equal(firstEducationalOrganForSignaling("caffeine", "gaba", "during_use"), null);
});

test("web organ map snapshot matches the API map organ keys", () => {
  for (const organId of Object.keys(educationalOrganNeurotransmitters)) {
    assert.match(mapSource, new RegExp(organId));
  }
  assert.match(mapSource, /endorphin/);
  assert.equal(educationalNtProfiles.length, 14);
  assert.match(seedSource, /substanceId: "caffeine"/);
  assert.match(seedSource, /neurotransmitter: "gaba"/);
});
