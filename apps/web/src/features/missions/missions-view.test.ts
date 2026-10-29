import assert from "node:assert/strict";
import { test } from "node:test";
import { MISSION_CATEGORY_IDS } from "@soma/shared-types";
import { buildDemoMissions } from "./missions-demo.ts";
import {
  countCompletedMissions,
  filterMissionsByCategory,
  FUTURE_MISSION_CATEGORY_IDS,
  groupMissionsByCategory,
  missionCopyPath,
  sortMissions,
} from "./missions-view.ts";

test("published catalog has six missions in stable sort order", () => {
  const rows = sortMissions(buildDemoMissions(new Set()));
  assert.equal(rows.length, 6);
  const orders = rows.map((row) => row.sortOrder);
  assert.deepEqual([...orders], [...orders].sort((a, b) => a - b));
  assert.equal(rows[0]?.id, "edu-dopamine-01");
});

test("category groups keep future areas empty without treating them as available missions", () => {
  const groups = groupMissionsByCategory(buildDemoMissions(new Set()));
  assert.deepEqual(
    groups.map((group) => group.categoryId),
    [...MISSION_CATEGORY_IDS],
  );
  const empty = groups.filter((group) => group.missions.length === 0);
  assert.deepEqual(
    empty.map((group) => group.categoryId),
    [...FUTURE_MISSION_CATEGORY_IDS],
  );
  assert.equal(filterMissionsByCategory(buildDemoMissions(new Set()), "orientation").length, 0);
});

test("completed counts and i18n paths stay public", () => {
  const rows = buildDemoMissions(new Set(["edu-dopamine-01"]));
  assert.deepEqual(countCompletedMissions(rows), { completed: 1, total: 6 });
  assert.equal(rows.find((row) => row.id === "edu-dopamine-01")?.state, "completed");
  assert.equal(rows.find((row) => row.id === "edu-gaba-01")?.state, "available");
  assert.equal(missionCopyPath("missions.items.edu-dopamine-01.title"), "items.edu-dopamine-01.title");
});
