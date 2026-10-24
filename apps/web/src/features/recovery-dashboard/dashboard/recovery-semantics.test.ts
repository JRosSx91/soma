import assert from "node:assert/strict";
import { test } from "node:test";
import { estimateCurve } from "@soma/shared-types";
import {
  formatLabeledPercent,
  formatTrajectoryPercent,
  isCalculableProgress,
  modelCeilingPercent,
  roundedCurvePercent,
} from "./recovery-semantics.js";

test("formatTrajectoryPercent rounds progressFraction only", () => {
  assert.equal(formatTrajectoryPercent(0), "0%");
  assert.equal(formatTrajectoryPercent(0.6), "60%");
  assert.equal(formatTrajectoryPercent(0.999), "100%");
  assert.equal(formatTrajectoryPercent(1.2), "100%");
});

test("NaN and Infinity are unavailable, not a fake 0%", () => {
  assert.equal(formatTrajectoryPercent(Number.NaN), "—");
  assert.equal(formatTrajectoryPercent(Number.POSITIVE_INFINITY), "—");
  assert.equal(formatTrajectoryPercent(Number.NEGATIVE_INFINITY), "—");
  assert.equal(formatTrajectoryPercent(null), "—");
  assert.equal(formatTrajectoryPercent(undefined), "—");
  assert.equal(isCalculableProgress(0), true);
  assert.equal(isCalculableProgress(Number.NaN), false);
});

test("roundedCurvePercent is display rounding only", () => {
  assert.equal(roundedCurvePercent(0.46), 46);
  assert.equal(roundedCurvePercent(0), 0);
  assert.equal(roundedCurvePercent(1.2), 100);
});

test("today and day-365 labels stay distinct", () => {
  assert.equal(formatLabeledPercent("Hoy", 0.42), "Hoy · 42%");
  assert.equal(formatLabeledPercent("día 365", 0.68), "día 365 · 68%");
  assert.equal(formatLabeledPercent("Today", 0.42), "Today · 42%");
  assert.notEqual(
    formatLabeledPercent("Hoy", 0.42),
    formatLabeledPercent("día 365", 0.42),
  );
});

test("ceiling percent omitted when unknown or full recovery", () => {
  assert.equal(modelCeilingPercent(null), null);
  assert.equal(modelCeilingPercent(undefined), null);
  assert.equal(modelCeilingPercent(1), null);
  assert.equal(modelCeilingPercent(0.999), null);
  assert.equal(modelCeilingPercent(Number.NaN), null);
  assert.equal(modelCeilingPercent(0.6), 60);
});

test("progressFraction vs absoluteRecovery for ceiling 0.6", () => {
  const estimate = estimateCurve(365, {
    shape: "logarithmic",
    daysTo95Recovery: 365,
    recoveryCeiling: 0.6,
  });
  assert.ok(estimate.curveProgress >= 0.94);
  assert.ok(estimate.estimatedRecovery <= 0.61);
  assert.ok(
    Math.abs(estimate.estimatedRecovery - estimate.curveProgress * 0.6) < 1e-9,
  );
  assert.equal(
    formatTrajectoryPercent(estimate.curveProgress),
    `${Math.round(estimate.curveProgress * 100)}%`,
  );
  assert.notEqual(
    formatTrajectoryPercent(estimate.curveProgress),
    formatTrajectoryPercent(estimate.estimatedRecovery),
  );
});

test("ceiling 1 keeps progressFraction and absoluteRecovery aligned", () => {
  const estimate = estimateCurve(42, {
    shape: "logarithmic",
    daysTo95Recovery: 180,
    recoveryCeiling: 1,
  });
  assert.equal(estimate.curveProgress, estimate.estimatedRecovery);
  assert.equal(modelCeilingPercent(1), null);
});
