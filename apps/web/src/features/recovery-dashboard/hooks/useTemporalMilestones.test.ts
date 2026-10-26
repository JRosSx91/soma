import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  nextTemporalMilestone,
  temporalDueSyncKeys,
  upcomingTemporalDues,
} from "@soma/shared-types";

test("a focus refresh does not enqueue a second invalidate for the same due instant", () => {
  const lastUse = new Date("2026-01-01T00:00:00.000Z");
  const before = nextTemporalMilestone({
    usage: { substanceId: "cannabis", status: "abstinent", lastUseDate: lastUse },
    now: new Date(lastUse.getTime() + 86_400_000 - 5_000),
  });
  const dues = upcomingTemporalDues([before]);
  const first = temporalDueSyncKeys(dues, lastUse.getTime() + 86_400_000);
  const second = temporalDueSyncKeys(dues, lastUse.getTime() + 86_400_000 + 30_000);
  assert.deepEqual(first, second);
  const seen = new Set(first);
  const fresh = second.filter((key) => !seen.has(key));
  assert.deepEqual(fresh, []);
});

test("the countdown hook invalidates through achievementSync and never inserts rows", () => {
  const source = readFileSync(new URL("./useTemporalMilestones.ts", import.meta.url), "utf8");
  assert.match(source, /achievementSync\.invalidate/);
  assert.equal(source.includes("insertedThisCall"), false);
  assert.equal(source.includes("fetchAchievements"), false);
  assert.match(source, /visibilitychange/);
  assert.match(source, /TICK_MS = 30_000/);
  assert.match(source, /syncedKeys\.current = new Set\(\)/);
  assert.match(source, /lastFingerprint\.current !== fingerprint/);
});

test("a last-use or relapse change drops previous due keys before any invalidate", () => {
  const lastUse = new Date("2026-01-01T00:00:00.000Z");
  const previous = upcomingTemporalDues([
    nextTemporalMilestone({
      usage: { substanceId: "cannabis", status: "abstinent", lastUseDate: lastUse },
      now: new Date(lastUse.getTime() + 86_400_000 - 1_000),
    }),
  ]);
  assert.equal(previous.length, 1);
  const stale = temporalDueSyncKeys(previous, lastUse.getTime() + 86_400_000);
  assert.equal(stale.length, 1);

  const relapsed = upcomingTemporalDues([
    nextTemporalMilestone({
      usage: { substanceId: "cannabis", status: "active", lastUseDate: lastUse },
      now: new Date(lastUse.getTime() + 86_400_000 + 60_000),
    }),
  ]);
  const corrected = upcomingTemporalDues([
    nextTemporalMilestone({
      usage: {
        substanceId: "cannabis",
        status: "abstinent",
        lastUseDate: new Date("2026-01-20T00:00:00.000Z"),
      },
      now: new Date(lastUse.getTime() + 86_400_000 + 60_000),
    }),
  ]);
  assert.deepEqual(temporalDueSyncKeys(relapsed, lastUse.getTime() + 86_400_000), []);
  assert.equal(
    temporalDueSyncKeys(corrected, lastUse.getTime() + 86_400_000).some((key) =>
      stale.includes(key),
    ),
    false,
  );
});
