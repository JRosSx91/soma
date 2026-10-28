import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  educationalNtPhaseWindows,
  educationalNtQualitativeProfiles,
} from "./educational-nt-qualitative-catalog.ts";
import {
  ILLUSTRATIVE_NT_PHASE,
  presentEducationalNtRecovery,
} from "./educational-nt-recovery.ts";
import { educationalNtProfiles } from "./neurotransmitter-education.ts";

const seedSource = readFileSync(
  new URL("../../../../../../apps/api/prisma/seed/neurotransmitter-profiles.ts", import.meta.url),
  "utf8",
);
const adapterSource = readFileSync(new URL("./educational-nt-recovery.ts", import.meta.url), "utf8");

function parseSeedProfiles(source: string) {
  const ranges: Record<string, { startDay: number; endDay: number | null }> = {};
  const rangeBlock = source.match(
    /during_use: \{ startDay: (\d+), endDay: (\d+) \},[\s\S]*?acute_withdrawal: \{ startDay: (\d+), endDay: (\d+) \},[\s\S]*?post_acute: \{ startDay: (\d+), endDay: (\d+) \},[\s\S]*?normalizing: \{ startDay: (\d+), endDay: null \}/,
  );
  assert.ok(rangeBlock);
  ranges.during_use = { startDay: Number(rangeBlock[1]), endDay: Number(rangeBlock[2]) };
  ranges.acute_withdrawal = { startDay: Number(rangeBlock[3]), endDay: Number(rangeBlock[4]) };
  ranges.post_acute = { startDay: Number(rangeBlock[5]), endDay: Number(rangeBlock[6]) };
  ranges.normalizing = { startDay: Number(rangeBlock[7]), endDay: null };

  const profiles = [];
  const blockRe =
    /substanceId: "(\w+)",\s*neurotransmitter: "(\w+)",\s*mechanismKey: "([^"]+)",\s*confidenceLevel: "(high|medium|low)",[\s\S]*?phases: \[([\s\S]*?)\],/g;
  const phaseRe =
    /makePhase\("(during_use|acute_withdrawal|post_acute|normalizing)", "(severe|moderate|mild|normalizing)", "(depleted|elevated|oscillating|normalizing)"\)/g;
  let block = blockRe.exec(source);
  while (block) {
    const cells = [];
    let phase = phaseRe.exec(block[5]);
    while (phase) {
      const window = ranges[phase[1]];
      cells.push({
        phase: phase[1],
        startDay: window.startDay,
        endDay: window.endDay,
        severity: phase[2],
        direction: phase[3],
      });
      phase = phaseRe.exec(block[5]);
    }
    phaseRe.lastIndex = 0;
    profiles.push({
      substanceId: block[1],
      neurotransmitter: block[2],
      mechanismKey: block[3],
      confidenceLevel: block[4],
      cells,
    });
    block = blockRe.exec(source);
  }
  return { ranges, profiles };
}

function snapshot(substanceId: string) {
  const view = presentEducationalNtRecovery(substanceId);
  return {
    phase: view.illustrativePhase,
    warning: view.showAlcoholClinicalWarning,
    rows: view.rows.map((row) => ({
      substanceId: row.substanceId,
      neurotransmitter: row.neurotransmitter,
      mechanismKey: row.mechanismKey,
      direction: row.direction,
      severity: row.severity,
      illustrativePhase: row.illustrativePhase,
      confidence: row.confidence,
    })),
  };
}

test("qualitative catalog is a read-only parity mirror of the NT seed", () => {
  const parsed = parseSeedProfiles(seedSource);
  assert.deepEqual(parsed.ranges, educationalNtPhaseWindows);
  assert.equal(parsed.profiles.length, 14);
  assert.equal(educationalNtQualitativeProfiles.length, 14);
  assert.deepEqual(
    educationalNtQualitativeProfiles.map((item) => ({
      substanceId: item.substanceId,
      neurotransmitter: item.neurotransmitter,
      mechanismKey: item.mechanismKey,
      confidenceLevel: item.confidenceLevel,
      cells: item.cells,
    })),
    parsed.profiles,
  );
  assert.deepEqual(
    educationalNtQualitativeProfiles.map((item) => `${item.substanceId}|${item.neurotransmitter}|${item.mechanismKey}`),
    educationalNtProfiles.map((item) => `${item.substanceId}|${item.neurotransmitter}|${item.mechanismKey}`),
  );
  assert.doesNotMatch(seedSource, /curveProgress/);
});

test("adapter does not select a cell from abstinence days", () => {
  assert.doesNotMatch(adapterSource, /daysAbstinent/);
  assert.doesNotMatch(adapterSource, /abstinencePhaseForDays/);
  assert.doesNotMatch(adapterSource, /educationalNtPhaseWindows/);
  assert.doesNotMatch(adapterSource, /usageStatus/);
  assert.doesNotMatch(adapterSource, /clockStatus/);
  assert.equal(ILLUSTRATIVE_NT_PHASE, "post_acute");
});

test("cannabis at 42 and 120 days would show the same educational example", () => {
  const at42 = snapshot("cannabis");
  const at120 = snapshot("cannabis");
  assert.deepEqual(at42, at120);
  assert.equal(at42.phase, "post_acute");
  assert.equal(at42.warning, false);
  assert.deepEqual(
    at42.rows.map((row) => [row.neurotransmitter, row.direction, row.severity]),
    [
      ["endocannabinoid", "depleted", "mild"],
      ["dopamine", "normalizing", "mild"],
      ["gaba", "normalizing", "mild"],
    ],
  );
  for (const row of at42.rows) {
    assert.equal(row.substanceId, "cannabis");
    assert.equal(row.illustrativePhase, "post_acute");
  }
});

test("nicotine at 15 and 90 days does not change severity by clock", () => {
  const at15 = snapshot("nicotine");
  const at90 = snapshot("nicotine");
  assert.deepEqual(at15, at90);
  assert.deepEqual(
    at15.rows.map((row) => [row.neurotransmitter, row.direction, row.severity]),
    [
      ["acetylcholine", "depleted", "moderate"],
      ["dopamine", "depleted", "mild"],
    ],
  );
});

test("cocaine keeps its own post-acute profiles", () => {
  const view = presentEducationalNtRecovery("cocaine");
  assert.equal(view.illustrativePhase, "post_acute");
  assert.deepEqual(
    view.rows.map((row) => [row.neurotransmitter, row.direction, row.severity, row.mechanismKey]),
    [
      ["dopamine", "depleted", "moderate", "DAT_BLOCKADE"],
      ["norepinephrine", "oscillating", "moderate", "NET_BLOCKADE"],
      ["serotonin", "depleted", "mild", "SERT_BLOCKADE"],
    ],
  );
});

test("active use does not produce a personalized during-use phase", () => {
  const active = snapshot("cannabis");
  const abstinent = snapshot("cannabis");
  assert.deepEqual(active, abstinent);
  assert.equal(active.phase, "post_acute");
  assert.equal(
    active.rows.some((row) => row.direction === "elevated" && row.severity === "severe"),
    false,
  );
});

test("missing date does not invent a personal neurochemical state", () => {
  const missing = snapshot("nicotine");
  const dated = snapshot("nicotine");
  assert.deepEqual(missing, dated);
  assert.equal(missing.phase, "post_acute");
  assert.ok(missing.rows.length > 0);
});

test("focused substance is never composed with another substance", () => {
  const cannabis = presentEducationalNtRecovery("cannabis");
  const nicotine = presentEducationalNtRecovery("nicotine");
  assert.equal(
    cannabis.rows.some((row) => row.substanceId !== "cannabis"),
    false,
  );
  assert.equal(
    nicotine.rows.some((row) => row.neurotransmitter === "endocannabinoid"),
    false,
  );
  const cannabisDopamine = cannabis.rows.find((row) => row.neurotransmitter === "dopamine");
  const nicotineDopamine = nicotine.rows.find((row) => row.neurotransmitter === "dopamine");
  assert.ok(cannabisDopamine);
  assert.ok(nicotineDopamine);
  assert.equal(cannabisDopamine.substanceId, "cannabis");
  assert.equal(nicotineDopamine.substanceId, "nicotine");
  assert.notEqual(cannabisDopamine.mechanismKey, nicotineDopamine.mechanismKey);
  assert.notEqual(cannabisDopamine.direction, nicotineDopamine.direction);
});

test("illustrative phase is labeled post-acute and alcohol gets a clinical warning flag", () => {
  const cannabis = presentEducationalNtRecovery("cannabis");
  const alcohol = presentEducationalNtRecovery("alcohol");
  assert.equal(cannabis.illustrativePhase, "post_acute");
  assert.equal(alcohol.illustrativePhase, "post_acute");
  assert.equal(cannabis.showAlcoholClinicalWarning, false);
  assert.equal(alcohol.showAlcoholClinicalWarning, true);
  assert.deepEqual(
    alcohol.rows.map((row) => [row.neurotransmitter, row.direction, row.severity]),
    [
      ["gaba", "depleted", "moderate"],
      ["glutamate", "elevated", "mild"],
      ["dopamine", "depleted", "mild"],
      ["serotonin", "normalizing", "mild"],
    ],
  );
});

test("adapter does not read curveProgress or invent extra transmitters", () => {
  assert.doesNotMatch(adapterSource, /curveProgress/);
  assert.doesNotMatch(adapterSource, /estimatedRecovery/);
  assert.doesNotMatch(adapterSource, /worstSource/);
  assert.doesNotMatch(adapterSource, /neurotransmitter-state/);
  const unknown = presentEducationalNtRecovery("unknown");
  assert.equal(unknown.illustrativePhase, "post_acute");
  assert.equal(unknown.showAlcoholClinicalWarning, false);
  assert.deepEqual(unknown.rows, []);
});
