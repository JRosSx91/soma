import assert from "node:assert/strict";
import { test } from "node:test";
import { planAchievementUnlocks } from "./recovery-math.ts";
import {
  TEMPORAL_SUBSTANCES,
  TEMPORAL_THRESHOLDS,
  nextTemporalMilestone,
  nextTemporalMilestones,
  pickFeaturedTemporalMilestone,
  temporalAchievementId,
  temporalDueSyncKeys,
  upcomingTemporalDues,
} from "./temporal-milestone.ts";

const MS_PER_DAY = 86_400_000;
const lastUse = new Date("2026-01-01T00:00:00.000Z");

function usage(
  partial: Partial<{
    substanceId: string;
    status: "abstinent" | "active";
    lastUseDate: Date | null;
  }> = {},
) {
  return {
    substanceId: "cannabis",
    status: "abstinent" as const,
    lastUseDate: lastUse,
    ...partial,
  };
}

function at(days: number, extraMs = 0) {
  return new Date(lastUse.getTime() + days * MS_PER_DAY + extraMs);
}

test("day zero points at the first 24h medal with empty absolute progress", () => {
  const state = nextTemporalMilestone({ usage: usage(), now: lastUse });
  assert.equal(state.status, "upcoming");
  assert.equal(state.daysAbstinent, 0);
  assert.equal(state.next?.thresholdDays, 1);
  assert.equal(state.next?.achievementId, "cannabis-temporal-1");
  assert.equal(state.next?.remainingMs, MS_PER_DAY);
  assert.equal(state.next?.progress, 0);
  assert.equal(state.next?.dueAt.toISOString(), "2026-01-02T00:00:00.000Z");
});

test("an instant before 24h is still the first medal", () => {
  const state = nextTemporalMilestone({ usage: usage(), now: at(1, -1) });
  assert.equal(state.status, "upcoming");
  assert.equal(state.next?.thresholdDays, 1);
  assert.equal(state.next?.remainingMs, 1);
  assert.ok((state.daysAbstinent ?? 0) < 1);
  assert.ok((state.next?.progress ?? 1) < 1);
});

test("the exact 24h instant has already reached that medal", () => {
  const state = nextTemporalMilestone({ usage: usage(), now: at(1) });
  assert.equal(state.status, "upcoming");
  assert.equal(state.next?.thresholdDays, 3);
  assert.equal(state.next?.achievementId, "cannabis-temporal-3");
  assert.equal(state.daysAbstinent, 1);
  assert.equal(state.next?.progress, 1 / 3);
});

test("an instant after a threshold advances to the following medal", () => {
  const state = nextTemporalMilestone({ usage: usage(), now: at(1, 1) });
  assert.equal(state.next?.thresholdDays, 3);
  assert.equal(state.next?.remainingMs, 2 * MS_PER_DAY - 1);
});

test("absolute progress toward 180 days is half at 90 days", () => {
  const state = nextTemporalMilestone({ usage: usage(), now: at(90) });
  assert.equal(state.next?.thresholdDays, 180);
  assert.equal(state.next?.progress, 0.5);
  assert.equal(state.next?.remainingMs, 90 * MS_PER_DAY);
});

test("several surpassed thresholds still use the GAME-01 list", () => {
  const state = nextTemporalMilestone({ usage: usage(), now: at(21) });
  assert.equal(state.next?.thresholdDays, 30);
  assert.deepEqual([...TEMPORAL_THRESHOLDS], [1, 3, 7, 14, 21, 30, 60, 90, 180, 365]);
});

test("a due time two hours away reports remaining milliseconds", () => {
  const state = nextTemporalMilestone({ usage: usage(), now: at(7, -2 * 60 * 60 * 1000) });
  assert.equal(state.next?.thresholdDays, 7);
  assert.equal(state.next?.remainingMs, 2 * 60 * 60 * 1000);
});

test("active use never receives a countdown", () => {
  const state = nextTemporalMilestone({
    usage: usage({ status: "active" }),
    now: at(30),
  });
  assert.equal(state.status, "active_use");
  assert.equal(state.next, null);
  assert.equal(state.daysAbstinent, null);
});

test("missing and invalid dates are explicit", () => {
  assert.equal(
    nextTemporalMilestone({ usage: usage({ lastUseDate: null }), now: at(1) }).status,
    "missing_date",
  );
  assert.equal(
    nextTemporalMilestone({
      usage: usage({ lastUseDate: new Date(Number.NaN) }),
      now: at(1),
    }).status,
    "invalid_date",
  );
});

test("a last-use in the future is invalid, not day zero", () => {
  const state = nextTemporalMilestone({
    usage: usage(),
    now: new Date(lastUse.getTime() - 60_000),
  });
  assert.equal(state.status, "invalid_date");
  assert.equal(state.next, null);
});

test("more than 365 days completes the GAME-01 catalog", () => {
  const exact = nextTemporalMilestone({ usage: usage(), now: at(365) });
  assert.equal(exact.status, "complete");
  assert.equal(exact.next, null);
  assert.equal(exact.daysAbstinent, 365);

  const later = nextTemporalMilestone({ usage: usage(), now: at(400) });
  assert.equal(later.status, "complete");
  assert.equal(later.next, null);
  assert.deepEqual(upcomingTemporalDues([later]), []);
  assert.equal(pickFeaturedTemporalMilestone([later]), null);
});

test("a completed substance never wins the featured countdown", () => {
  const now = at(400);
  const complete = nextTemporalMilestone({ usage: usage(), now });
  const pending = nextTemporalMilestone({
    usage: usage({
      substanceId: "nicotine",
      lastUseDate: new Date(now.getTime() - 6 * MS_PER_DAY),
    }),
    now,
  });
  assert.equal(complete.status, "complete");
  assert.equal(pending.status, "upcoming");
  const featured = pickFeaturedTemporalMilestone([complete, pending]);
  assert.equal(featured?.substanceId, "nicotine");
  assert.equal(featured?.next?.thresholdDays, 7);
});

test("a retrospective last-use date recomputes the next due instant", () => {
  const now = new Date("2026-02-01T00:00:00.000Z");
  const early = nextTemporalMilestone({
    usage: usage({ lastUseDate: new Date("2026-01-01T00:00:00.000Z") }),
    now,
  });
  const later = nextTemporalMilestone({
    usage: usage({ lastUseDate: new Date("2026-01-25T00:00:00.000Z") }),
    now,
  });
  assert.equal(early.next?.thresholdDays, 60);
  assert.equal(later.next?.thresholdDays, 14);
  assert.equal(later.next?.dueAt.toISOString(), "2026-02-08T00:00:00.000Z");
});

test("relapse is active use even with a long last-use clock", () => {
  const state = nextTemporalMilestone({
    usage: usage({ status: "active", lastUseDate: lastUse }),
    now: at(90),
  });
  assert.equal(state.status, "active_use");
});

test("DST calendar days do not replace 24h intervals", () => {
  const spring = new Date("2026-03-28T12:00:00.000Z");
  const state = nextTemporalMilestone({
    usage: usage({ lastUseDate: spring }),
    now: new Date(spring.getTime() + MS_PER_DAY - 1),
  });
  assert.equal(state.next?.thresholdDays, 1);
  assert.equal(state.next?.dueAt.getTime(), spring.getTime() + MS_PER_DAY);
  assert.equal(state.next?.remainingMs, 1);
});

test("featured pick is the smallest positive remaining time", () => {
  const now = at(0);
  const states = nextTemporalMilestones({
    usages: [
      usage({
        substanceId: "nicotine",
        lastUseDate: new Date(now.getTime() - 11 * MS_PER_DAY),
      }),
      usage({
        substanceId: "cannabis",
        lastUseDate: new Date(now.getTime() - 90 * MS_PER_DAY + 2 * 60 * 60 * 1000),
      }),
      usage({
        substanceId: "caffeine",
        lastUseDate: new Date(now.getTime() - 25 * MS_PER_DAY),
      }),
    ],
    now,
  });
  const featured = pickFeaturedTemporalMilestone(states);
  assert.equal(featured?.substanceId, "cannabis");
  assert.equal(featured?.next?.thresholdDays, 90);
  assert.equal(featured?.next?.remainingMs, 2 * 60 * 60 * 1000);
});

test("ties break by TEMPORAL_SUBSTANCES then achievement id", () => {
  const now = at(0);
  const last = new Date(now.getTime() - 6 * MS_PER_DAY);
  const states = nextTemporalMilestones({
    usages: [
      usage({ substanceId: "alcohol", lastUseDate: last }),
      usage({ substanceId: "cannabis", lastUseDate: last }),
      usage({ substanceId: "nicotine", lastUseDate: last }),
    ],
    now,
  });
  const featured = pickFeaturedTemporalMilestone(states);
  assert.equal(featured?.substanceId, "cannabis");
  assert.deepEqual([...TEMPORAL_SUBSTANCES], [
    "cannabis",
    "nicotine",
    "cocaine",
    "caffeine",
    "alcohol",
  ]);
});

test("ineligible substances never win the featured slot", () => {
  const now = at(2);
  const states = nextTemporalMilestones({
    usages: [
      usage({ status: "active" }),
      usage({ substanceId: "nicotine", lastUseDate: null }),
      usage({
        substanceId: "alcohol",
        lastUseDate: new Date(now.getTime() + MS_PER_DAY),
      }),
    ],
    now,
  });
  assert.equal(pickFeaturedTemporalMilestone(states), null);
});

test("next milestone stays aligned with GAME-01 unlock planning", () => {
  const medals = TEMPORAL_THRESHOLDS.map((days) => ({
    id: temporalAchievementId("cannabis", days),
    organId: null,
    substanceId: "cannabis",
    threshold: null,
    family: "temporal" as const,
    abstinenceDays: days,
  }));

  for (const sample of [0, 0.99, 1, 1.001, 7, 90, 364.5, 365, 400]) {
    const now = at(sample);
    const planned = planAchievementUnlocks({
      achievements: medals,
      curves: [],
      usages: [usage()],
      alreadyUnlockedIds: new Set(),
      now,
    });
    const next = nextTemporalMilestone({ usage: usage(), now });
    const unlockedDays = planned.map((row) => Number(row.id.split("-").at(-1)));
    if (next.status === "complete") {
      assert.deepEqual(unlockedDays, [...TEMPORAL_THRESHOLDS]);
      continue;
    }
    assert.equal(next.status, "upcoming");
    const needed = next.next?.thresholdDays ?? -1;
    assert.equal(
      unlockedDays.every((days) => days < needed),
      true,
    );
    assert.equal(
      planned.some((row) => row.id === next.next?.achievementId),
      false,
    );
  }
});

test("threshold crossing keys group several substances without duplicates", () => {
  const previous = upcomingTemporalDues([
    nextTemporalMilestone({
      usage: usage({ substanceId: "cannabis" }),
      now: at(1, -10),
    }),
    nextTemporalMilestone({
      usage: usage({ substanceId: "nicotine" }),
      now: at(1, -10),
    }),
  ]);
  const keys = temporalDueSyncKeys(previous, at(1).getTime());
  assert.equal(keys.length, 2);
  assert.equal(new Set(keys).size, 2);
  assert.equal(temporalDueSyncKeys(previous, at(1, -1).getTime()).length, 0);
});
