import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { DEMO_PROGRESS_TOTAL_XP } from "../progress/progress-demo.ts";
import {
  DEMO_MISSION_CORRECT_OPTION_ID,
  buildDemoMissions,
  evaluateDemoAnswer,
} from "./missions-demo.ts";

test("DEMO catalog is the fourteen published missions and starts available", () => {
  const rows = buildDemoMissions(new Set());
  assert.equal(rows.length, 14);
  assert.ok(rows.every((row) => row.state === "available"));
  assert.equal(
    rows.some((row) => row.id === "edu-unpublished-01"),
    false,
  );
});

test("DEMO local evaluation completes once and does not change Home XP", () => {
  const first = evaluateDemoAnswer("edu-dopamine-01", DEMO_MISSION_CORRECT_OPTION_ID["edu-dopamine-01"], false);
  assert.equal(first.correct, true);
  assert.equal(first.completed, true);
  assert.equal(first.alreadyCompleted, false);
  assert.equal(first.xpGranted, 0);
  const again = evaluateDemoAnswer("edu-dopamine-01", DEMO_MISSION_CORRECT_OPTION_ID["edu-dopamine-01"], true);
  assert.equal(again.alreadyCompleted, true);
  assert.equal(again.completed, true);
  assert.equal(again.xpGranted, 0);
  const wrong = evaluateDemoAnswer("edu-dopamine-01", "pleasure", false);
  assert.equal(wrong.correct, false);
  assert.equal(wrong.completed, false);
  assert.equal(wrong.xpGranted, 0);
  assert.equal(DEMO_PROGRESS_TOTAL_XP, 4435);
});

test("DEMO does not grant XP or mutate the Home progression fixture", () => {
  const before = DEMO_PROGRESS_TOTAL_XP;
  evaluateDemoAnswer("edu-dopamine-01", DEMO_MISSION_CORRECT_OPTION_ID["edu-dopamine-01"], false);
  assert.equal(DEMO_PROGRESS_TOTAL_XP, before);
  assert.equal(DEMO_PROGRESS_TOTAL_XP, 4435);
});

test("DEMO answer keys never emit a simulated XP grant", () => {
  const source = readFileSync(new URL("./missions-demo.ts", import.meta.url), "utf8");
  assert.equal(source.includes("xpGranted: 12"), false);
  assert.match(source, /xpGranted: 0/);
});

test("DEMO scores by option id and does not treat the first option as always correct", () => {
  const rows = buildDemoMissions(new Set());
  const lastCorrect = rows.find((row) => row.id === "edu-tolerance-01");
  assert.equal(lastCorrect?.options[2]?.id, "sensitivity");
  const byId = evaluateDemoAnswer("edu-tolerance-01", "sensitivity", false);
  assert.equal(byId.correct, true);
  const firstSlot = evaluateDemoAnswer("edu-tolerance-01", "equals_addiction", false);
  assert.equal(firstSlot.correct, false);
  const counts = [0, 0, 0];
  for (const row of rows) {
    const correct = DEMO_MISSION_CORRECT_OPTION_ID[row.id as keyof typeof DEMO_MISSION_CORRECT_OPTION_ID];
    const index = row.options.findIndex((option) => option.id === correct);
    counts[index] += 1;
  }
  assert.ok(counts.every((n) => n >= 4));
  assert.ok(counts[0]! < rows.length);
});

test("DEMO remount starts from an empty completion set", () => {
  const first = buildDemoMissions(new Set(["edu-dopamine-01"]));
  assert.equal(first.find((row) => row.id === "edu-dopamine-01")?.state, "completed");
  const remount = buildDemoMissions(new Set());
  assert.ok(remount.every((row) => row.state === "available"));
});
