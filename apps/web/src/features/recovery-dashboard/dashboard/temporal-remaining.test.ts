import assert from "node:assert/strict";
import { test } from "node:test";
import { remainingProgressPercent, remainingTimeParts, temporalBarFill } from "./temporal-remaining.ts";

test("remaining time never reports seconds or a negative span", () => {
  assert.deepEqual(remainingTimeParts(-5_000), { kind: "lt_minute" });
  assert.deepEqual(remainingTimeParts(59_999), { kind: "lt_minute" });
  assert.deepEqual(remainingTimeParts(60_000), { kind: "minutes", minutes: 1 });
  assert.deepEqual(remainingTimeParts(2 * 60 * 60 * 1000 + 12 * 60 * 1000), {
    kind: "hours",
    hours: 2,
    minutes: 12,
  });
  assert.deepEqual(remainingTimeParts(2 * 86_400_000 + 3 * 60 * 60 * 1000 + 59_000), {
    kind: "days",
    days: 2,
    hours: 3,
  });
});

test("absolute progress percent floors toward the medal", () => {
  assert.equal(remainingProgressPercent(0.5), 50);
  assert.equal(remainingProgressPercent(90 / 180), 50);
  assert.equal(remainingProgressPercent(95 / 180), 52);
  assert.notEqual(remainingProgressPercent(95 / 180), 0);
  assert.equal(remainingProgressPercent(0.999), 99);
  assert.equal(remainingProgressPercent(1), 100);
  assert.equal(temporalBarFill(remainingProgressPercent(95 / 180)), "52%");
  assert.equal(temporalBarFill(0), null);
  assert.equal(temporalBarFill(Number.NaN), null);
});
