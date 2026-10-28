import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  educationalNtPhaseWindows,
  educationalNtQualitativeProfiles,
} from "./educational-nt-qualitative-catalog.ts";
import {
  educationalNtInputFromRecovery,
  presentEducationalNtRecovery,
} from "./educational-nt-recovery.ts";
import { educationalNtProfiles } from "./neurotransmitter-education.ts";

const seedSource = readFileSync(
  new URL("../../../../../../apps/api/prisma/seed/neurotransmitter-profiles.ts", import.meta.url),
  "utf8",
);

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

test("cannabis at 42 days uses the shared post-acute educational phase", () => {
  const view = presentEducationalNtRecovery({
    substanceId: "cannabis",
    usageStatus: "abstinent",
    daysAbstinent: 42,
  });
  assert.equal(view.clockStatus, "abstinent");
  assert.equal(view.daysUsed, 42);
  assert.equal(view.educationalPhase, "post_acute");
  assert.deepEqual(
    view.rows.map((row) => row.neurotransmitter),
    ["endocannabinoid", "dopamine", "gaba"],
  );
  assert.deepEqual(
    view.rows.map((row) => row.severity),
    ["mild", "mild", "mild"],
  );
  assert.deepEqual(
    view.rows.map((row) => row.direction),
    ["depleted", "normalizing", "normalizing"],
  );
  for (const row of view.rows) {
    assert.equal(row.substanceId, "cannabis");
    assert.equal(row.educationalPhase, "post_acute");
    assert.equal(row.daysUsed, 42);
    assert.equal(row.calendarKind, "shared_educational_windows");
    assert.equal(row.window.startDay, 8);
    assert.equal(row.window.endDay, 56);
  }
});

test("nicotine at 15 days uses the shared post-acute educational phase", () => {
  const view = presentEducationalNtRecovery({
    substanceId: "nicotine",
    usageStatus: "abstinent",
    daysAbstinent: 15,
  });
  assert.equal(view.educationalPhase, "post_acute");
  assert.deepEqual(
    view.rows.map((row) => [row.neurotransmitter, row.direction, row.severity]),
    [
      ["acetylcholine", "depleted", "moderate"],
      ["dopamine", "depleted", "mild"],
    ],
  );
});

test("cocaine at 120 days uses the educational normalizing phase", () => {
  const view = presentEducationalNtRecovery({
    substanceId: "cocaine",
    usageStatus: "abstinent",
    daysAbstinent: 120,
  });
  assert.equal(view.educationalPhase, "normalizing");
  assert.equal(view.window?.startDay, 57);
  assert.equal(view.window?.endDay, null);
  assert.deepEqual(
    view.rows.map((row) => [row.neurotransmitter, row.direction, row.severity]),
    [
      ["dopamine", "normalizing", "mild"],
      ["norepinephrine", "normalizing", "mild"],
      ["serotonin", "normalizing", "mild"],
    ],
  );
});

test("active use selects during_use and does not present abstinence days", () => {
  const view = presentEducationalNtRecovery({
    substanceId: "cannabis",
    usageStatus: "active",
    daysAbstinent: 42,
  });
  assert.equal(view.clockStatus, "active");
  assert.equal(view.daysUsed, null);
  assert.equal(view.educationalPhase, "during_use");
  for (const row of view.rows) {
    assert.equal(row.daysUsed, null);
    assert.equal(row.clockStatus, "active");
    assert.equal(row.educationalPhase, "during_use");
  }
  assert.deepEqual(
    view.rows.map((row) => [row.neurotransmitter, row.direction, row.severity]),
    [
      ["endocannabinoid", "elevated", "severe"],
      ["dopamine", "elevated", "mild"],
      ["gaba", "oscillating", "mild"],
    ],
  );
});

test("missing date does not invent a phase", () => {
  const view = presentEducationalNtRecovery({
    substanceId: "nicotine",
    usageStatus: "abstinent",
    daysAbstinent: null,
  });
  assert.equal(view.clockStatus, "missing_date");
  assert.equal(view.educationalPhase, null);
  assert.deepEqual(view.rows, []);
});

test("day zero abstinence is not active use and has no withdrawal phase", () => {
  const view = presentEducationalNtRecovery({
    substanceId: "cannabis",
    usageStatus: "abstinent",
    daysAbstinent: 0,
  });
  assert.equal(view.clockStatus, "day_zero");
  assert.equal(view.daysUsed, 0);
  assert.equal(view.educationalPhase, null);
  assert.deepEqual(view.rows, []);
  assert.notEqual(view.clockStatus, "active");
});

test("focused substance is never composed with another substance", () => {
  const cannabis = presentEducationalNtRecovery({
    substanceId: "cannabis",
    usageStatus: "abstinent",
    daysAbstinent: 42,
  });
  const nicotine = presentEducationalNtRecovery({
    substanceId: "nicotine",
    usageStatus: "abstinent",
    daysAbstinent: 15,
  });
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
  assert.equal(cannabisDopamine.daysUsed, 42);
  assert.equal(nicotineDopamine.daysUsed, 15);
});

test("adapter does not read curveProgress or invent extra transmitters", () => {
  const source = readFileSync(new URL("./educational-nt-recovery.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /curveProgress/);
  assert.doesNotMatch(source, /estimatedRecovery/);
  assert.doesNotMatch(source, /worstSource/);
  assert.doesNotMatch(source, /neurotransmitter-state/);
  const unknown = presentEducationalNtRecovery({
    substanceId: "unknown",
    usageStatus: "abstinent",
    daysAbstinent: 20,
  });
  assert.equal(unknown.educationalPhase, "post_acute");
  assert.deepEqual(unknown.rows, []);
});

test("recovery clock mapping uses the temporal milestone clock", () => {
  assert.deepEqual(
    educationalNtInputFromRecovery(
      { id: "cannabis", usageStatus: "abstinent" },
      {
        substanceId: "cannabis",
        status: "upcoming",
        daysAbstinent: 42,
        next: null,
      },
    ),
    { substanceId: "cannabis", usageStatus: "abstinent", daysAbstinent: 42 },
  );
  assert.deepEqual(
    educationalNtInputFromRecovery(
      { id: "nicotine", usageStatus: "active" },
      {
        substanceId: "nicotine",
        status: "active_use",
        daysAbstinent: null,
        next: null,
      },
    ),
    { substanceId: "nicotine", usageStatus: "active", daysAbstinent: null },
  );
  assert.deepEqual(
    educationalNtInputFromRecovery(
      { id: "cocaine", usageStatus: "abstinent" },
      {
        substanceId: "cocaine",
        status: "missing_date",
        daysAbstinent: null,
        next: null,
      },
    ),
    { substanceId: "cocaine", usageStatus: "abstinent", daysAbstinent: null },
  );
});
