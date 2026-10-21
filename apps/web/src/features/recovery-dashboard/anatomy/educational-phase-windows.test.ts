import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  educationalDayRangeOf,
  educationalPhaseWindowCatalog,
  educationalPhaseWindowKinds,
  educationalWindowUncertainties,
  lookupEducationalPhaseWindow,
  type EducationalPhaseWindow,
} from "./educational-phase-windows.ts";
import { narrativePhases, narrativePhaseWindows } from "./narrative-catalog.ts";
import { educationalNtProfiles } from "./neurotransmitter-education.ts";

const fixtures: readonly EducationalPhaseWindow[] = [
  {
    substanceId: "caffeine",
    phase: "acute_withdrawal",
    kind: "symptoms",
    range: { startDay: 1, endDay: 2 },
    uncertainty: "approximate",
    reference: { source: "Fixture citation (1999)." },
  },
  {
    substanceId: "alcohol",
    phase: "acute_withdrawal",
    kind: "neuroadaptation",
    range: null,
    uncertainty: "insufficient",
    reference: null,
  },
];

test("the four educational phase keys remain the catalog identity", () => {
  assert.deepEqual(narrativePhases, [
    "during_use",
    "acute_withdrawal",
    "post_acute",
    "normalizing",
  ]);
});

test("symptom and neuroadaptation windows are distinct kinds", () => {
  assert.deepEqual(educationalPhaseWindowKinds, ["symptoms", "neuroadaptation"]);
  assert.deepEqual(educationalWindowUncertainties, ["approximate", "variable", "insufficient"]);
});

test("the authored educational window catalog stays empty", () => {
  assert.deepEqual(educationalPhaseWindowCatalog, []);
  assert.equal(educationalNtProfiles.length, 14);
  for (const profile of educationalNtProfiles) {
    for (const phase of narrativePhases) {
      for (const kind of educationalPhaseWindowKinds) {
        assert.equal(
          lookupEducationalPhaseWindow(educationalPhaseWindowCatalog, {
            substanceId: profile.substanceId,
            phase,
            kind,
          }),
          null,
        );
      }
    }
  }
});

test("lookup returns an authored window without filling days", () => {
  const found = lookupEducationalPhaseWindow(fixtures, {
    substanceId: "caffeine",
    phase: "acute_withdrawal",
    kind: "symptoms",
  });
  assert.ok(found);
  assert.deepEqual(educationalDayRangeOf(found), { startDay: 1, endDay: 2 });
  assert.equal(found.uncertainty, "approximate");
  assert.equal(found.reference?.source, "Fixture citation (1999).");
});

test("an authored absence of range is preserved, not defaulted", () => {
  const found = lookupEducationalPhaseWindow(fixtures, {
    substanceId: "alcohol",
    phase: "acute_withdrawal",
    kind: "neuroadaptation",
  });
  assert.ok(found);
  assert.equal(found.range, null);
  assert.equal(educationalDayRangeOf(found), null);
  assert.equal(found.uncertainty, "insufficient");
  assert.notDeepEqual(
    educationalDayRangeOf(found),
    narrativePhaseWindows.acute_withdrawal,
  );
});

test("missing combinations resolve to null instead of a universal window", () => {
  assert.equal(
    lookupEducationalPhaseWindow(fixtures, {
      substanceId: "nicotine",
      phase: "acute_withdrawal",
      kind: "symptoms",
    }),
    null,
  );
  assert.equal(
    lookupEducationalPhaseWindow(fixtures, {
      substanceId: "caffeine",
      phase: "post_acute",
      kind: "symptoms",
    }),
    null,
  );
  assert.equal(
    lookupEducationalPhaseWindow(fixtures, {
      substanceId: "caffeine",
      phase: "acute_withdrawal",
      kind: "neuroadaptation",
    }),
    null,
  );
  assert.equal(
    lookupEducationalPhaseWindow(fixtures, {
      substanceId: "caffeine",
      phase: "day_3",
      kind: "symptoms",
    }),
    null,
  );
  assert.equal(educationalDayRangeOf(null), null);
});

test("lookup does not mutate the catalog", () => {
  const copy = [...fixtures];
  lookupEducationalPhaseWindow(fixtures, {
    substanceId: "caffeine",
    phase: "acute_withdrawal",
    kind: "symptoms",
  });
  assert.deepEqual(fixtures, copy);
});

test("the window module does not read recovery curves, last use, or Prisma ranges", () => {
  const source = readFileSync(new URL("./educational-phase-windows.ts", import.meta.url), "utf8");
  for (const token of [
    "daysTo95Recovery",
    "recovery-catalog",
    "lastUseDate",
    "PHASE_RANGES",
    "narrativePhaseWindows",
    "neurotransmitter-state",
    "advice-drafts",
  ]) {
    assert.equal(source.includes(token), false, token);
  }
  assert.match(source, /NarrativePhase/);
});
