import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import {
  MISSION_CATALOG,
  MISSION_IDS,
  getMissionById,
  isMissionOptionId,
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

test("correct option keys cover every catalog mission and valid options", () => {
  assert.deepEqual(Object.keys(MISSION_CORRECT_OPTION_ID).sort(), [...MISSION_IDS].sort());
  for (const id of MISSION_IDS) {
    const mission = getMissionById(id);
    assert.ok(mission);
    const correct = MISSION_CORRECT_OPTION_ID[id];
    assert.equal(isMissionOptionId(mission, correct), true);
    const other = mission.options.find((option) => option.id !== correct);
    assert.ok(other);
    assert.equal("correctOptionId" in mission, false);
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
});

test("evaluation does not persist progress or grant XP", () => {
  assert.equal(evaluationSource.includes("awardXp"), false);
  assert.equal(evaluationSource.includes("xpGranted"), false);
  assert.equal(evaluationSource.includes("alreadyCompleted"), false);
  assert.equal(evaluationSource.includes("Prisma"), false);
  assert.equal(evaluationSource.includes("MISSION_XP_AMOUNT"), false);
  assert.match(evaluationSource, /Does not persist/);
});
