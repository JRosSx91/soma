import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";
import { computeRecovery } from "../../../apps/web/src/features/recovery-engine/calculator.ts";

const require = createRequire(import.meta.url);
const { computeProgress } = require("../../../apps/api/src/achievements/recovery-math.ts") as {
  computeProgress: (
    daysAbstinent: number,
    params: { shape: "logarithmic"; daysTo95Recovery: number },
  ) => number;
};
import {
  buildAchievementProgressSnapshot,
  readAchievementProgress,
} from "./achievement-progress.ts";
import {
  daysToReachCurveProgress,
  estimateCurve,
  evaluateAchievement,
  planAchievementUnlocks,
  type CurveModel,
} from "./recovery-math.ts";

const day = (iso: string) => new Date(iso);

function close(actual: number, expected: number) {
  assert.ok(
    Math.abs(actual - expected) < 1e-10,
    `${actual} is not within 1e-10 of ${expected}`,
  );
}

const logarithmic: CurveModel = {
  shape: "logarithmic",
  daysTo95Recovery: 90,
  recoveryCeiling: 0.6,
};

test("day zero is the start of every curve", () => {
  for (const shape of ["logarithmic", "sigmoidal", "linear", "stepwise"] as const) {
    const estimate = estimateCurve(0, {
      shape,
      daysTo95Recovery: 90,
      recoveryCeiling: 0.8,
    });
    assert.equal(estimate.daysAbstinent, 0);
    assert.equal(estimate.curveProgress, 0);
    assert.equal(estimate.estimatedRecovery, 0);
  }
});

test("partial logarithmic progress stays below the 95 percent mark", () => {
  const estimate = estimateCurve(45, logarithmic);
  assert.ok(estimate.curveProgress > 0);
  assert.ok(estimate.curveProgress < 0.95);
  close(estimate.estimatedRecovery, estimate.curveProgress * 0.6);
});

test("the day named by the curve is 95 percent of curve progress", () => {
  close(estimateCurve(90, logarithmic).curveProgress, 0.95);
  close(
    estimateCurve(180, {
      shape: "sigmoidal",
      daysTo95Recovery: 180,
      recoveryCeiling: 1,
    }).curveProgress,
    0.95,
  );
  close(
    estimateCurve(95, {
      shape: "linear",
      daysTo95Recovery: 95,
      recoveryCeiling: 1,
    }).curveProgress,
    0.95,
  );
});

test("an exact threshold unlocks and the day before does not", () => {
  const curve: CurveModel = {
    shape: "linear",
    daysTo95Recovery: 95,
    recoveryCeiling: 1,
  };
  const reached = evaluateAchievement({
    id: "exact",
    achievementThreshold: 0.5,
    daysAbstinent: 50,
    curve,
  });
  const before = evaluateAchievement({
    id: "exact",
    achievementThreshold: 0.5,
    daysAbstinent: 49,
    curve,
  });

  close(reached.curveProgress, 0.5);
  assert.equal(reached.isAchievementUnlocked, true);
  close(reached.achievementProgress ?? -1, 1);
  assert.equal(before.isAchievementUnlocked, false);
  assert.ok((before.achievementProgress ?? 1) < 1);
});

test("a ceiling below the threshold still unlocks on curve progress", () => {
  const evaluation = evaluateAchievement({
    id: "capped",
    achievementThreshold: 0.75,
    daysAbstinent: 90,
    curve: logarithmic,
  });
  close(evaluation.curveProgress ?? -1, 0.95);
  close(evaluation.estimatedRecovery ?? -1, 0.57);
  assert.equal(evaluation.isAchievementUnlocked, true);
  assert.ok((evaluation.estimatedRecovery ?? 1) < evaluation.achievementThreshold);
});

test("a missing curve stays pending and is not unlocked", () => {
  const evaluation = evaluateAchievement({
    id: "caffeine-vta-bronze-1",
    achievementThreshold: 0.1,
    daysAbstinent: 400,
    curve: null,
  });
  assert.equal(evaluation.pendingReview, true);
  assert.equal(evaluation.isAchievementUnlocked, false);
  assert.equal(evaluation.curveProgress, null);
  assert.equal(evaluation.estimatedRecovery, null);
  assert.equal(evaluation.achievementProgress, null);

  const snapshot = buildAchievementProgressSnapshot({
    id: evaluation.id,
    hidden: false,
    evaluation,
    persisted: null,
  });
  assert.equal(snapshot.status, "pending_review");
  assert.equal(snapshot.unlockedAt, null);
  assert.equal(snapshot.achievementProgress, null);
});

test("planning an unlock twice does not repeat it", () => {
  const lastUse = day("2026-01-01T00:00:00.000Z");
  const now = day("2026-04-01T00:00:00.000Z");
  const input = {
    achievements: [
      { id: "nicotine-lungs-bronze", organId: "lungs", substanceId: "nicotine", threshold: 0.1 },
    ],
    curves: [
      {
        organId: "lungs",
        substanceId: "nicotine",
        shape: "linear" as const,
        daysTo95Recovery: 95,
        recoveryCeiling: 0.75,
      },
    ],
    usages: [{ substanceId: "nicotine", status: "abstinent" as const, lastUseDate: lastUse }],
    now,
  };

  const first = planAchievementUnlocks({ ...input, alreadyUnlockedIds: new Set() });
  assert.equal(first.length, 1);
  assert.equal(first[0]?.id, "nicotine-lungs-bronze");
  const expectedDays = daysToReachCurveProgress(0.1, input.curves[0]!);
  assert.equal(first[0]?.unlockedAt.toISOString(), new Date(lastUse.getTime() + expectedDays * 86400000).toISOString());

  const second = planAchievementUnlocks({
    ...input,
    alreadyUnlockedIds: new Set(first.map((item) => item.id)),
  });
  assert.deepEqual(second, []);
});

test("a missing curve and active use produce no unlock", () => {
  const now = day("2026-06-01T00:00:00.000Z");
  const planned = planAchievementUnlocks({
    achievements: [
      { id: "no-curve", organId: "brain-vta", substanceId: "caffeine", threshold: 0.1 },
      { id: "still-using", organId: "lungs", substanceId: "nicotine", threshold: 0.1 },
    ],
    curves: [
      {
        organId: "lungs",
        substanceId: "nicotine",
        shape: "linear",
        daysTo95Recovery: 95,
        recoveryCeiling: 0.75,
      },
    ],
    usages: [
      { substanceId: "caffeine", status: "abstinent", lastUseDate: day("2020-01-01T00:00:00.000Z") },
      { substanceId: "nicotine", status: "active", lastUseDate: null },
    ],
    alreadyUnlockedIds: new Set(),
    now,
  });
  assert.deepEqual(planned, []);
});

test("a hidden trophy keeps its numbers out of the snapshot until it is stored", () => {
  const evaluation = evaluateAchievement({
    id: "cannabis-vta-bronze-1",
    achievementThreshold: 0.1,
    daysAbstinent: 30,
    curve: { shape: "logarithmic", daysTo95Recovery: 90, recoveryCeiling: 0.95 },
  });
  const concealed = buildAchievementProgressSnapshot({
    id: evaluation.id,
    hidden: true,
    evaluation,
    persisted: null,
  });
  assert.equal(concealed.status, "hidden");
  assert.equal(concealed.detailsConcealed, true);
  assert.equal(concealed.achievementProgress, null);
  assert.equal(concealed.unlockedAt, null);

  const revealed = buildAchievementProgressSnapshot({
    id: evaluation.id,
    hidden: true,
    evaluation,
    persisted: {
      achievementId: evaluation.id,
      unlockedAt: "2026-02-01T00:00:00.000Z",
      notifiedAt: null,
    },
  });
  assert.equal(revealed.status, "unlocked");
  assert.equal(revealed.detailsConcealed, false);
  assert.equal(revealed.unlockedAt, "2026-02-01T00:00:00.000Z");
  assert.notEqual(revealed.achievementProgress, null);
});

test("progress toward a threshold is independent of the ceiling", () => {
  const now = day("2026-01-26T00:00:00.000Z");
  const lastUse = day("2026-01-01T00:00:00.000Z");
  const reading = readAchievementProgress({
    hidden: false,
    persisted: false,
    achievementThreshold: 0.5,
    curve: { shape: "linear", daysTo95Recovery: 95, recoveryCeiling: 0.6 },
    usage: { status: "abstinent", lastUseDate: lastUse },
    now,
  });
  close(reading.achievementProgress ?? -1, 0.5);
  assert.equal(reading.progressAvailability, "ready");
});

test("day zero progress is zero and does not invent an unlock", () => {
  const now = day("2026-01-01T00:00:00.000Z");
  const reading = readAchievementProgress({
    hidden: false,
    persisted: false,
    achievementThreshold: 0.5,
    curve: logarithmic,
    usage: { status: "abstinent", lastUseDate: now },
    now,
  });
  assert.equal(reading.achievementProgress, 0);
  assert.equal(reading.progressAvailability, "ready");
});

test("the exact threshold reads as complete while a persisted row still decides the grant", () => {
  const now = day("2026-02-20T00:00:00.000Z");
  const shared = {
    hidden: false,
    achievementThreshold: 0.5,
    curve: { shape: "linear" as const, daysTo95Recovery: 95, recoveryCeiling: 1 },
    usage: { status: "abstinent" as const, lastUseDate: day("2026-01-01T00:00:00.000Z") },
    now,
  };
  const beforeGrant = readAchievementProgress({ ...shared, persisted: false });
  close(beforeGrant.achievementProgress ?? -1, 1);

  const granted = buildAchievementProgressSnapshot({
    id: "exact-row",
    hidden: false,
    evaluation: evaluateAchievement({
      id: "exact-row",
      achievementThreshold: 0.5,
      daysAbstinent: 50,
      curve: shared.curve,
    }),
    persisted: {
      achievementId: "exact-row",
      unlockedAt: "2026-02-20T00:00:00.000Z",
      notifiedAt: null,
    },
  });
  assert.equal(granted.status, "unlocked");
  assert.equal(granted.unlockedAt, "2026-02-20T00:00:00.000Z");
});

test("a day before the threshold stays below it", () => {
  const reading = readAchievementProgress({
    hidden: false,
    persisted: false,
    achievementThreshold: 0.5,
    curve: { shape: "linear", daysTo95Recovery: 95, recoveryCeiling: 1 },
    usage: { status: "abstinent", lastUseDate: day("2026-01-01T00:00:00.000Z") },
    now: day("2026-02-19T00:00:00.000Z"),
  });
  assert.ok((reading.achievementProgress ?? 1) < 1);
});

test("a missing curve, an untracked substance, and active use produce no percentage", () => {
  const now = day("2026-06-01T00:00:00.000Z");
  const curve = logarithmic;
  const missing = readAchievementProgress({
    hidden: false,
    persisted: false,
    achievementThreshold: 0.1,
    curve: null,
    usage: { status: "abstinent", lastUseDate: day("2020-01-01T00:00:00.000Z") },
    now,
  });
  const untracked = readAchievementProgress({
    hidden: false,
    persisted: false,
    achievementThreshold: 0.1,
    curve,
    usage: null,
    now,
  });
  const active = readAchievementProgress({
    hidden: false,
    persisted: false,
    achievementThreshold: 0.1,
    curve,
    usage: { status: "active", lastUseDate: null },
    now,
  });
  assert.equal(missing.progressAvailability, "pending_review");
  assert.equal(missing.achievementProgress, null);
  assert.equal(untracked.progressAvailability, "not_tracked");
  assert.equal(untracked.achievementProgress, null);
  assert.equal(active.progressAvailability, "active_use");
  assert.equal(active.achievementProgress, null);
});

test("a hidden achievement conceals its progress until a row exists", () => {
  const input = {
    hidden: true,
    achievementThreshold: 0.1,
    curve: logarithmic,
    usage: { status: "abstinent" as const, lastUseDate: day("2020-01-01T00:00:00.000Z") },
    now: day("2026-06-01T00:00:00.000Z"),
  };
  const concealed = readAchievementProgress({ ...input, persisted: false });
  const revealed = readAchievementProgress({ ...input, persisted: true });
  assert.equal(concealed.progressAvailability, "concealed");
  assert.equal(concealed.achievementProgress, null);
  assert.equal(revealed.progressAvailability, "ready");
  assert.notEqual(revealed.achievementProgress, null);
});

test("reading progress twice does not change the result", () => {
  const input = {
    hidden: false,
    persisted: false,
    achievementThreshold: 0.5,
    curve: { shape: "linear" as const, daysTo95Recovery: 95, recoveryCeiling: 0.6 },
    usage: { status: "abstinent" as const, lastUseDate: day("2026-01-01T00:00:00.000Z") },
    now: day("2026-01-26T00:00:00.000Z"),
  };
  assert.deepEqual(readAchievementProgress(input), readAchievementProgress(input));
});

test("a stored row stays unlocked when the curve is missing", () => {
  const snapshot = buildAchievementProgressSnapshot({
    id: "legacy-row",
    hidden: false,
    evaluation: evaluateAchievement({
      id: "legacy-row",
      achievementThreshold: 0.1,
      daysAbstinent: 10,
      curve: null,
    }),
    persisted: {
      achievementId: "legacy-row",
      unlockedAt: "2026-03-01T00:00:00.000Z",
      notifiedAt: null,
    },
  });
  assert.equal(snapshot.status, "unlocked");
  assert.equal(snapshot.achievementProgress, null);
});

function temporalMedal(days: number, substanceId = "cannabis") {
  return {
    id: `${substanceId}-temporal-${days}`,
    organId: null as string | null,
    substanceId,
    threshold: null as number | null,
    family: "temporal" as const,
    abstinenceDays: days,
  };
}

test("temporal medals unlock on elapsed 24h days and stay insert-only", () => {
  const lastUse = day("2026-01-01T00:00:00.000Z");
  const medals = [1, 3, 7, 14, 21, 30, 60, 90, 180, 365].map((days) => temporalMedal(days));
  const usages = [
    { substanceId: "cannabis", status: "abstinent" as const, lastUseDate: lastUse },
    { substanceId: "nicotine", status: "abstinent" as const, lastUseDate: lastUse },
  ];
  const curves = [
    {
      organId: "lungs",
      substanceId: "cannabis",
      shape: "linear" as const,
      daysTo95Recovery: 95,
      recoveryCeiling: 1,
    },
  ];

  function atDay(daysElapsed: number) {
    return planAchievementUnlocks({
      achievements: medals,
      curves,
      usages,
      alreadyUnlockedIds: new Set(),
      now: new Date(lastUse.getTime() + daysElapsed * 86400000),
    });
  }

  assert.equal(atDay(0).length, 0);
  assert.deepEqual(atDay(0.99).map((item) => item.id), []);
  assert.deepEqual(atDay(1).map((item) => item.id), ["cannabis-temporal-1"]);
  assert.equal(atDay(3).length, 2);
  assert.deepEqual(atDay(7).map((item) => item.id), [
    "cannabis-temporal-1",
    "cannabis-temporal-3",
    "cannabis-temporal-7",
  ]);
  assert.equal(
    atDay(7).some((item) => item.id === "cannabis-temporal-14"),
    false,
  );
  assert.equal(atDay(30).length, 6);
  assert.deepEqual(
    atDay(365).map((item) => item.id),
    medals.map((item) => item.id),
  );

  const first = atDay(365);
  const second = planAchievementUnlocks({
    achievements: medals,
    curves,
    usages,
    alreadyUnlockedIds: new Set(first.map((item) => item.id)),
    now: new Date(lastUse.getTime() + 400 * 86400000),
  });
  assert.deepEqual(second, []);

  const nicotineMedals = [1, 3, 7, 14, 21, 30, 60, 90, 180, 365].map((days) =>
    temporalMedal(days, "nicotine"),
  );
  const otherSubstance = planAchievementUnlocks({
    achievements: [...medals, ...nicotineMedals],
    curves,
    usages: [
      { substanceId: "cannabis", status: "abstinent", lastUseDate: lastUse },
      { substanceId: "nicotine", status: "abstinent", lastUseDate: lastUse },
    ],
    alreadyUnlockedIds: new Set(),
    now: new Date(lastUse.getTime() + 7 * 86400000),
  });
  assert.deepEqual(
    otherSubstance.filter((item) => item.id.startsWith("cannabis-")).map((item) => item.id),
    ["cannabis-temporal-1", "cannabis-temporal-3", "cannabis-temporal-7"],
  );
  assert.deepEqual(
    otherSubstance.filter((item) => item.id.startsWith("nicotine-")).map((item) => item.id),
    ["nicotine-temporal-1", "nicotine-temporal-3", "nicotine-temporal-7"],
  );

  const cannabisOnlyClock = planAchievementUnlocks({
    achievements: [...medals, ...nicotineMedals],
    curves,
    usages: [
      {
        substanceId: "cannabis",
        status: "abstinent",
        lastUseDate: lastUse,
      },
      {
        substanceId: "nicotine",
        status: "abstinent",
        lastUseDate: new Date(lastUse.getTime() + 364 * 86400000),
      },
    ],
    alreadyUnlockedIds: new Set(),
    now: new Date(lastUse.getTime() + 365 * 86400000),
  });
  assert.equal(
    cannabisOnlyClock.filter((item) => item.id.startsWith("cannabis-")).length,
    10,
  );
  assert.deepEqual(
    cannabisOnlyClock.filter((item) => item.id.startsWith("nicotine-")).map((item) => item.id),
    ["nicotine-temporal-1"],
  );

  const historical = ["cannabis-temporal-1", "cannabis-temporal-3", "cannabis-temporal-7"];
  const active = planAchievementUnlocks({
    achievements: medals,
    curves,
    usages: [{ substanceId: "cannabis", status: "active", lastUseDate: lastUse }],
    alreadyUnlockedIds: new Set(historical),
    now: new Date(lastUse.getTime() + 365 * 86400000),
  });
  assert.deepEqual(active, []);

  const unlockedAt = atDay(7).find((item) => item.id === "cannabis-temporal-7")?.unlockedAt;
  assert.equal(unlockedAt?.toISOString(), "2026-01-08T00:00:00.000Z");
});

test("curve planning ignores temporal placeholders and stays on curveProgress", () => {
  const lastUse = day("2026-01-01T00:00:00.000Z");
  const planned = planAchievementUnlocks({
    achievements: [
      { id: "nicotine-lungs-bronze", organId: "lungs", substanceId: "nicotine", threshold: 0.1 },
    ],
    curves: [
      {
        organId: "lungs",
        substanceId: "nicotine",
        shape: "linear",
        daysTo95Recovery: 95,
        recoveryCeiling: 0.75,
      },
    ],
    usages: [{ substanceId: "nicotine", status: "abstinent", lastUseDate: lastUse }],
    alreadyUnlockedIds: new Set(),
    now: day("2026-04-01T00:00:00.000Z"),
  });
  assert.equal(planned.length, 1);
  assert.equal(planned[0]?.id, "nicotine-lungs-bronze");
});

test("the web calculator and the api facade match the shared estimate", () => {
  const shared = estimateCurve(90, logarithmic);
  const web = computeRecovery(
    {
      shape: "logarithmic",
      daysTo95Recovery: 90,
      recoveryCeiling: 0.6,
      lastUseDate: "2026-01-01T00:00:00.000Z",
    },
    Date.parse("2026-04-01T00:00:00.000Z"),
  );
  const api = computeProgress(90, { shape: "logarithmic", daysTo95Recovery: 90 });

  close(web.progressFraction, shared.curveProgress);
  close(web.absoluteRecovery, shared.estimatedRecovery);
  close(api, shared.curveProgress);
  assert.equal(web.daysAbstinent, 90);
});
