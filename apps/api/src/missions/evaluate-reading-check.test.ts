import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import {
  MISSION_CATALOG,
  getMissionById,
  isMissionOptionId,
  listPublishedMissions,
} from "@soma/shared-types";
import { MISSION_CORRECT_OPTION_ID } from "./mission-answers.js";
import { evaluateReadingCheckAnswer } from "./evaluate-reading-check.js";

const evaluationSource = readFileSync(
  new URL("./evaluate-reading-check.ts", import.meta.url),
  "utf8",
);
const answersSource = readFileSync(new URL("./mission-answers.ts", import.meta.url), "utf8");
const sharedPackage = JSON.parse(
  readFileSync(new URL("../../../../packages/shared-types/package.json", import.meta.url), "utf8"),
) as { exports?: Record<string, unknown> };

const GAM_XP_B3_CORRECT_OPTIONS = {
  "edu-receptors-02": "option_b",
  "edu-neuroadaptation-02": "option_c",
  "edu-metabolism-02": "option_a",
  "edu-dopamine-02": "option_b",
  "edu-gaba-02": "option_a",
  "edu-adenosine-02": "option_c",
} as const;
const gamXpB3DraftIdSet = new Set<string>(Object.keys(GAM_XP_B3_CORRECT_OPTIONS));

test("answer keys cover every published mission and the six approved drafts", () => {
  const published = listPublishedMissions();
  const expectedIds = [
    ...published.map((row) => row.id),
    ...Object.keys(GAM_XP_B3_CORRECT_OPTIONS),
  ].sort();
  assert.deepEqual(
    Object.keys(MISSION_CORRECT_OPTION_ID).sort(),
    expectedIds,
  );
  for (const mission of published) {
    const correct = MISSION_CORRECT_OPTION_ID[mission.id];
    assert.equal(typeof correct, "string");
    assert.equal(isMissionOptionId(mission, correct!), true);
    const other = mission.options.find((option) => option.id !== correct);
    assert.ok(other);
    assert.equal("correctOptionId" in mission, false);
  }
  const draftSlots = [0, 0, 0];
  for (const [id, expectedCorrect] of Object.entries(GAM_XP_B3_CORRECT_OPTIONS)) {
    const mission = getMissionById(id);
    assert.ok(mission);
    assert.equal(mission.status, "draft");
    assert.deepEqual(mission.options.map((option) => option.id), ["option_a", "option_b", "option_c"]);
    assert.equal(MISSION_CORRECT_OPTION_ID[mission.id], expectedCorrect);
    assert.equal(isMissionOptionId(mission, expectedCorrect), true);
    const correctIndex = mission.options.findIndex((option) => option.id === expectedCorrect);
    assert.ok(correctIndex >= 0 && correctIndex <= 2);
    draftSlots[correctIndex] += 1;
  }
  assert.deepEqual(draftSlots, [2, 2, 2]);
  for (const draft of MISSION_CATALOG.filter(
    (row) => row.status === "draft" && !gamXpB3DraftIdSet.has(row.id),
  )) {
    assert.equal(MISSION_CORRECT_OPTION_ID[draft.id], undefined);
  }
  assert.equal(MISSION_CATALOG.some((row) => "correctOptionId" in row), false);
});

test("shared-types does not expose a public answers subpath", () => {
  assert.equal(sharedPackage.exports?.["./missions-answers"], undefined);
  assert.equal(
    existsSync(new URL("../../../../packages/shared-types/src/missions-answers.ts", import.meta.url)),
    false,
  );
  assert.match(answersSource, /SERVER-ONLY/);
});

test("a known wrong option is an incorrect verdict, not a technical rejection", () => {
  const wrong = evaluateReadingCheckAnswer({
    missionId: "edu-dopamine-01",
    selectedOptionId: "pleasure",
  });
  assert.deepEqual(wrong, {
    ok: true,
    missionId: "edu-dopamine-01",
    selectedOptionId: "pleasure",
    correct: false,
  });

  const right = evaluateReadingCheckAnswer({
    missionId: "edu-dopamine-01",
    selectedOptionId: "wanting",
  });
  assert.deepEqual(right, {
    ok: true,
    missionId: "edu-dopamine-01",
    selectedOptionId: "wanting",
    correct: true,
  });
});

test("unknown mission or option is rejected", () => {
  assert.deepEqual(
    evaluateReadingCheckAnswer({
      missionId: "edu-unknown-01",
      selectedOptionId: "wanting",
    }),
    { ok: false, reason: "unknown_mission" },
  );
  assert.deepEqual(
    evaluateReadingCheckAnswer({
      missionId: "edu-dopamine-01",
      selectedOptionId: "not-an-option",
    }),
    { ok: false, reason: "unknown_option" },
  );
  assert.deepEqual(
    evaluateReadingCheckAnswer({
      missionId: "edu-receptors-02",
      selectedOptionId: "option_b",
    }),
    { ok: false, reason: "unknown_mission" },
  );
});

test("original six published missions keep a 2-2-2 visual split", () => {
  const original = [
    "edu-dopamine-01",
    "edu-serotonin-01",
    "edu-gaba-01",
    "edu-receptors-01",
    "edu-tolerance-01",
    "edu-neuroadaptation-01",
  ] as const;
  const counts = [0, 0, 0];
  for (const id of original) {
    const mission = getMissionById(id);
    assert.ok(mission);
    const correct = MISSION_CORRECT_OPTION_ID[id];
    assert.equal(typeof correct, "string");
    const index = mission.options.findIndex((option) => option.id === correct);
    assert.ok(index >= 0 && index <= 2);
    counts[index] += 1;
  }
  assert.deepEqual(counts, [2, 2, 2]);
});

test("published correct options are not concentrated in one visual slot", () => {
  const published = MISSION_CATALOG.filter((row) => row.status === "published");
  const counts = [0, 0, 0];
  for (const row of published) {
    const correct = MISSION_CORRECT_OPTION_ID[row.id];
    assert.equal(typeof correct, "string");
    const index = row.options.findIndex((option) => option.id === correct);
    assert.ok(index >= 0 && index <= 2);
    counts[index] += 1;
    const first = row.options[0];
    assert.ok(first);
    const firstVerdict = evaluateReadingCheckAnswer({
      missionId: row.id,
      selectedOptionId: first.id,
    });
    assert.equal(firstVerdict.ok, true);
    if (firstVerdict.ok) {
      assert.equal(firstVerdict.correct, first.id === correct);
    }
  }
  assert.equal(counts.reduce((sum, n) => sum + n, 0), 14);
  assert.ok(counts.every((n) => n >= 4));
  assert.ok(Math.max(...counts) - Math.min(...counts) <= 1);
  assert.ok(counts[0]! < 14);
});

test("a correct option is scored by id even when it is not first", () => {
  const last = evaluateReadingCheckAnswer({
    missionId: "edu-tolerance-01",
    selectedOptionId: "sensitivity",
  });
  assert.deepEqual(last, {
    ok: true,
    missionId: "edu-tolerance-01",
    selectedOptionId: "sensitivity",
    correct: true,
  });
  const firstWrong = evaluateReadingCheckAnswer({
    missionId: "edu-tolerance-01",
    selectedOptionId: "equals_addiction",
  });
  assert.equal(firstWrong.ok, true);
  if (firstWrong.ok) {
    assert.equal(firstWrong.correct, false);
  }
  const middle = evaluateReadingCheckAnswer({
    missionId: "edu-gaba-01",
    selectedOptionId: "network_brake",
  });
  assert.equal(middle.ok, true);
  if (middle.ok) {
    assert.equal(middle.correct, true);
  }
});

test("evaluation does not persist progress or grant XP", () => {
  assert.equal(evaluationSource.includes("awardXp"), false);
  assert.equal(evaluationSource.includes("xpGranted"), false);
  assert.equal(evaluationSource.includes("alreadyCompleted"), false);
  assert.equal(evaluationSource.includes("Prisma"), false);
  assert.equal(evaluationSource.includes("MISSION_XP_AMOUNT"), false);
  assert.match(evaluationSource, /Does not persist/);
});
