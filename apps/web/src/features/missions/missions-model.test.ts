import assert from "node:assert/strict";
import { test } from "node:test";
import { listPublishedMissions } from "@soma/shared-types";
import {
  applyAnswerToCatalog,
  parseMissionAnswer,
  parseMissionCatalog,
  shouldBlockMissionSubmit,
} from "./missions-model.ts";
import { buildDemoMissions } from "./missions-demo.ts";

const sample = buildDemoMissions(new Set());

test("parseMissionCatalog accepts a published list and rejects private keys", () => {
  const parsed = parseMissionCatalog({ missions: sample });
  assert.equal(parsed.missions.length, 6);
  assert.equal(
    parsed.missions.some((row) => row.id === "edu-unpublished-01"),
    false,
  );
  assert.throws(() => parseMissionCatalog({ missions: [{ ...sample[0], correctOptionId: "wanting" }] }));
  assert.throws(() => parseMissionCatalog(null));
});

test("parseMissionAnswer keeps educational fields and rejects a correctOptionId leak", () => {
  const ok = parseMissionAnswer({
    correct: false,
    completed: false,
    alreadyCompleted: false,
    xpGranted: 0,
    explainKey: "missions.items.edu-dopamine-01.explain",
  });
  assert.equal(ok.correct, false);
  assert.throws(() =>
    parseMissionAnswer({
      correct: true,
      completed: true,
      alreadyCompleted: false,
      xpGranted: 12,
      explainKey: "x",
      correctOptionId: "wanting",
    }),
  );
});

test("applyAnswerToCatalog marks only the answered mission completed", () => {
  const result = {
    correct: true,
    completed: true,
    alreadyCompleted: false,
    xpGranted: 12,
    explainKey: sample[0]!.explainKey,
  };
  const next = applyAnswerToCatalog(sample, "edu-dopamine-01", result, "2026-10-29T00:00:00.000Z");
  assert.equal(next.find((row) => row.id === "edu-dopamine-01")?.state, "completed");
  assert.equal(next.find((row) => row.id === "edu-gaba-01")?.state, "available");
  const wrong = applyAnswerToCatalog(sample, "edu-dopamine-01", { ...result, completed: false, xpGranted: 0, correct: false }, "t");
  assert.equal(wrong.find((row) => row.id === "edu-dopamine-01")?.state, "available");
});

test("shouldBlockMissionSubmit only blocks the in-flight mission id", () => {
  const pending = new Set(["edu-dopamine-01"]);
  assert.equal(shouldBlockMissionSubmit(pending, "edu-dopamine-01"), true);
  assert.equal(shouldBlockMissionSubmit(pending, "edu-gaba-01"), false);
  assert.equal(listPublishedMissions().length, 6);
});
