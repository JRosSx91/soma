import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { signalingMarkTone, signalingMarkTones } from "./signaling-presentation.ts";
import {
  educationalNtProfiles,
  resolveEducationalSignaling,
} from "./neurotransmitter-education.ts";
import { narrativePhases } from "./narrative-catalog.ts";
import esAnatomy from "../../../i18n/locales/es/anatomy.json" with { type: "json" };
import enAnatomy from "../../../i18n/locales/en/anatomy.json" with { type: "json" };

const card = readFileSync(
  new URL("../components/EducationalSignalingCard.tsx", import.meta.url),
  "utf8",
);
const page = readFileSync(new URL("../pages/AnatomyExplorerPage.tsx", import.meta.url), "utf8");
const presentation = readFileSync(new URL("./signaling-presentation.ts", import.meta.url), "utf8");
const adapter = readFileSync(new URL("./neurotransmitter-education.ts", import.meta.url), "utf8");

test("every catalogued transmitter has an identity mark, not a recovery fill", () => {
  assert.deepEqual(signalingMarkTones, ["action", "physiology", "reward", "warning"]);
  const ids = [...new Set(educationalNtProfiles.map((item) => item.neurotransmitter))];
  assert.equal(ids.length, 8);
  for (const id of ids) {
    assert.equal(signalingMarkTones.includes(signalingMarkTone(id)), true, id);
  }
  assert.equal(signalingMarkTone("dopamine"), "reward");
  assert.equal(signalingMarkTone("gaba"), "action");
  assert.equal(signalingMarkTone("glutamate"), "warning");
});

test("the 14 profiles keep mechanism-only data in the atlas adapter", () => {
  assert.equal(educationalNtProfiles.length, 14);
  for (const profile of educationalNtProfiles) {
    assert.equal("direction" in profile, false);
    assert.equal("severity" in profile, false);
    assert.equal("confidenceLevel" in profile, false);
    assert.equal("referenceSource" in profile, false);
    assert.equal(typeof profile.mechanismKey, "string");
  }
});

test("phase-specific copy changes without inventing a personal timeline", () => {
  const during = resolveEducationalSignaling("brain-vta", "alcohol", "during_use");
  const acute = resolveEducationalSignaling("brain-vta", "alcohol", "acute_withdrawal");
  assert.equal(during.length, 2);
  assert.equal(acute.length, 2);
  assert.notEqual(during[0]?.phaseKey, acute[0]?.phaseKey);
  assert.equal(during[0]?.mechanismKey, acute[0]?.mechanismKey);
  for (const phase of narrativePhases) {
    const entries = resolveEducationalSignaling("heart", "caffeine", phase);
    assert.equal(entries[0]?.phase, phase);
    assert.equal(entries[0]?.phaseKey, `caffeine.adenosine.${phase}`);
  }
});

test("organs without signaling stay empty instead of borrowing a state", () => {
  assert.deepEqual(resolveEducationalSignaling("liver", "alcohol", "during_use"), []);
  assert.deepEqual(resolveEducationalSignaling("heart", "nicotine", "during_use"), []);
});

test("the signaling card is qualitative and does not call personal endpoints", () => {
  for (const source of [card, presentation, adapter]) {
    for (const token of [
      "/me/neurotransmitter-state",
      "useNeurotransmitterState",
      "NeurotransmitterPanel",
      "lastUseDate",
      "resultingSeverity",
      "SEVERITY_FILL",
      "daysTo95Recovery",
    ]) {
      assert.equal(source.includes(token), false, token);
    }
  }
  assert.match(card, /role="img"/);
  assert.match(card, /signalingMarkAria/);
  assert.match(card, /h-3 w-3/);
  assert.equal(card.includes("width:"), false);
  assert.equal(card.includes("depleted"), false);
  assert.equal(card.includes("elevated"), false);
  assert.equal(card.includes("oscillating"), false);
  assert.equal(presentation.includes("depleted"), false);
  assert.equal(presentation.includes("elevated"), false);
  assert.match(page, /EducationalSignalingCard/);
  assert.match(page, /signalingMarkLegend/);
  const effectsBlock = page.slice(page.indexOf("function EffectsPanel"), page.indexOf("function RecoveryPanel"));
  assert.equal(effectsBlock.includes("resolveEducationalRecovery"), false);
  assert.equal(effectsBlock.includes("AdvicePanel"), false);
  assert.equal(effectsBlock.includes("/me/neurotransmitter-state"), false);
  assert.equal(effectsBlock.includes("lastUseDate"), false);
});

test("signaling chrome keys exist in ES and EN and are not a calendar", () => {
  for (const key of [
    "signalingMarkLegend",
    "signalingMarkAria",
    "signalingRoleLabel",
    "signalingMechanismLabel",
  ] as const) {
    assert.equal(typeof esAnatomy[key], "string", key);
    assert.equal(typeof enAnatomy[key], "string", key);
    assert.notEqual(esAnatomy[key], enAnatomy[key], key);
    assert.equal(String(esAnatomy[key]).includes("%"), false, key);
    assert.equal(String(enAnatomy[key]).includes("%"), false, key);
  }
});
