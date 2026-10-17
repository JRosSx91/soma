import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  narrativePhases,
  narrativePhaseWindows,
  narrativeSubstances,
  phaseWindowLabel,
  resolveEducationalNarrative,
  selectNarrativeSubstance,
} from "./narrative-catalog.ts";

const esNarratives = JSON.parse(
  readFileSync(new URL("../../../i18n/locales/es/organ-narrative.json", import.meta.url), "utf8"),
) as Record<string, Record<string, Record<string, string>>>;

function prose(organId: string, substanceId: string, phase: string): string | undefined {
  return esNarratives[organId]?.[substanceId]?.[phase];
}

test("resolves each catalogued organ, substance and phase to its own key", () => {
  const expected = [
    ["lungs", "nicotine"],
    ["lungs", "cannabis"],
    ["bronchi", "nicotine"],
    ["bronchi", "cannabis"],
    ["nasal-mucosa", "cocaine"],
    ["nasal-mucosa", "nicotine"],
    ["nasal-mucosa", "cannabis"],
  ] as const;

  for (const [organId, substanceId] of expected) {
    assert.deepEqual(narrativeSubstances(organId), expected.filter(([organ]) => organ === organId).map(([, substance]) => substance));
    for (const phase of narrativePhases) {
      const resolved = resolveEducationalNarrative(organId, substanceId, phase);
      assert.ok(resolved);
      assert.equal(resolved.narrativeKey, `${organId}.${substanceId}.${phase}`);
      assert.equal(resolved.organId, organId);
      assert.equal(resolved.substanceId, substanceId);
      assert.equal(typeof prose(organId, substanceId, phase), "string");
      assert.notEqual(prose(organId, substanceId, phase), "");
    }
  }
});

test("undefined combinations resolve to nothing", () => {
  const absent = [
    ["lungs", "cocaine"],
    ["lungs", "alcohol"],
    ["lungs", "caffeine"],
    ["bronchi", "cocaine"],
    ["bronchi", "alcohol"],
    ["bronchi", "caffeine"],
    ["nasal-mucosa", "alcohol"],
    ["nasal-mucosa", "caffeine"],
    ["heart", "nicotine"],
    ["liver", "alcohol"],
  ] as const;

  for (const [organId, substanceId] of absent) {
    assert.equal(resolveEducationalNarrative(organId, substanceId, "during_use"), null);
    assert.equal(narrativeSubstances(organId).includes(substanceId), false);
  }
});

test("changing organ keeps a shared substance and otherwise picks the first available", () => {
  assert.equal(selectNarrativeSubstance("nicotine", "bronchi"), "nicotine");
  assert.equal(selectNarrativeSubstance("cannabis", "nasal-mucosa"), "cannabis");
  assert.equal(selectNarrativeSubstance("cocaine", "lungs"), "nicotine");
  assert.equal(selectNarrativeSubstance("cocaine", "bronchi"), "nicotine");
  assert.equal(selectNarrativeSubstance(null, "nasal-mucosa"), "cocaine");
  assert.equal(selectNarrativeSubstance("alcohol", "lungs"), "nicotine");
  assert.equal(selectNarrativeSubstance("caffeine", "nasal-mucosa"), "cocaine");
  assert.equal(selectNarrativeSubstance("nicotine", "heart"), null);
});

test("a narrative is never reused across organs", () => {
  for (const phase of narrativePhases) {
    const lungs = resolveEducationalNarrative("lungs", "nicotine", phase);
    const bronchi = resolveEducationalNarrative("bronchi", "nicotine", phase);
    assert.ok(lungs);
    assert.ok(bronchi);
    assert.notEqual(lungs.narrativeKey, bronchi.narrativeKey);
    assert.notEqual(prose("lungs", "nicotine", phase), prose("bronchi", "nicotine", phase));
    assert.notEqual(prose("lungs", "cannabis", phase), prose("bronchi", "cannabis", phase));
  }

  assert.equal(prose("lungs", "cannabis", "during_use")?.includes("bronquial") ?? false, true);
  assert.notEqual(
    prose("lungs", "cannabis", "during_use"),
    prose("bronchi", "cannabis", "during_use"),
  );
});

test("educational resolution does not carry a personal estimate", () => {
  const resolved = resolveEducationalNarrative("lungs", "nicotine", "normalizing");
  assert.ok(resolved);
  assert.equal(resolved.personalized, false);
  assert.equal(Object.hasOwn(resolved, "curveProgress"), false);
  assert.equal(Object.hasOwn(resolved, "recoveryCeiling"), false);
  assert.equal(Object.hasOwn(resolved, "maxSeverity"), false);
  assert.equal(Object.hasOwn(resolved, "daysAbstinent"), false);
  assert.equal(resolved.confidenceLevel, "high");
  assert.equal(resolved.confidenceLabel, "alta");
  assert.match(resolved.referenceSource, /Surgeon General 2020/);

  assert.deepEqual(narrativePhaseWindows.acute_withdrawal, { startDay: 1, endDay: 7 });
  assert.deepEqual(narrativePhaseWindows.post_acute, { startDay: 8, endDay: 56 });
  assert.deepEqual(narrativePhaseWindows.normalizing, { startDay: 57, endDay: null });
  assert.equal(phaseWindowLabel("during_use"), null);
  assert.equal(phaseWindowLabel("acute_withdrawal"), "Días 1–7");
  assert.equal(phaseWindowLabel("post_acute"), "Días 8–56");
  assert.equal(phaseWindowLabel("normalizing"), "Desde el día 57");
});

test("the explorer view does not calculate personal recovery", () => {
  const page = readFileSync(new URL("../pages/AnatomyExplorerPage.tsx", import.meta.url), "utf8");
  const adapter = readFileSync(new URL("./narrative-catalog.ts", import.meta.url), "utf8");
  for (const token of [
    "estimateCurve",
    "computeRecovery",
    "recoveryCeiling",
    "maxSeverity",
    "curveProgress",
    "demo-data",
    "lastUseDate",
    "daysAbstinent",
  ]) {
    assert.equal(page.includes(token), false, token);
    assert.equal(adapter.includes(token), false, token);
  }
});
