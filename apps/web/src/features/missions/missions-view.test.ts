import assert from "node:assert/strict";
import { test } from "node:test";
import { MISSION_CATEGORY_IDS } from "@soma/shared-types";
import { buildDemoMissions } from "./missions-demo.ts";
import {
  categoryProgress,
  countCompletedMissions,
  filterMissionCatalog,
  filterMissionsByCategory,
  FUTURE_MISSION_CATEGORY_IDS,
  groupMissionsByCategory,
  missionCopyPath,
  missionArtNeedsFrame,
  missionIllustrationSrc,
  pickFeaturedMissions,
  searchMissions,
  sortMissionCatalog,
  sortMissions,
} from "./missions-view.ts";

test("published catalog has fourteen missions in stable sort order", () => {
  const rows = sortMissions(buildDemoMissions(new Set()));
  assert.equal(rows.length, 14);
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
  const summary = countCompletedMissions(rows);
  assert.equal(summary.completed, 1);
  assert.equal(summary.total, 14);
  assert.equal(summary.available, 13);
  assert.equal(summary.percent, 7);
  assert.equal(summary.discoverable, 2);
  assert.equal(rows.find((row) => row.id === "edu-dopamine-01")?.state, "completed");
  assert.equal(rows.find((row) => row.id === "edu-gaba-01")?.state, "available");
  assert.equal(missionCopyPath("missions.items.edu-dopamine-01.title"), "items.edu-dopamine-01.title");
});

test("featured missions prefer available rows in catalog order", () => {
  const rows = buildDemoMissions(new Set(["edu-dopamine-01", "edu-serotonin-01"]));
  const featured = pickFeaturedMissions(rows);
  assert.equal(featured.length, 4);
  assert.equal(featured[0]?.id, "edu-gaba-01");
  assert.equal(featured.some((row) => row.id === "edu-dopamine-01"), false);
});

test("search, completed filter and title sort stay local", () => {
  const rows = buildDemoMissions(new Set(["edu-tolerance-01"]));
  const haystack = (row: (typeof rows)[number]) => row.id;
  assert.equal(searchMissions(rows, "gaba", haystack)[0]?.id, "edu-gaba-01");
  assert.equal(filterMissionCatalog(rows, "completed").length, 1);
  const titled = sortMissionCatalog(rows, "title", (row) => row.id);
  assert.equal(titled[0]?.id, "edu-acetylcholine-01");
  assert.equal(categoryProgress(rows, "substances").upcoming, true);
  assert.equal(categoryProgress(rows, "neurotransmitters").total, 9);
  assert.ok(missionIllustrationSrc("dopamine")?.includes("neurotransmitter-dopamine"));
  assert.ok(missionIllustrationSrc("tolerance")?.includes("process-tolerance"));
  assert.equal(missionArtNeedsFrame("dopamine"), false);
  assert.equal(missionArtNeedsFrame("gaba"), false);
  assert.equal(missionArtNeedsFrame("receptors"), true);
  assert.equal(missionArtNeedsFrame("tolerance"), true);
  assert.equal(missionArtNeedsFrame("neuroadaptation"), true);
});
