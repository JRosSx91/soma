import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import {
  MISSION_CATALOG,
  MISSION_CATEGORY_IDS,
  MISSION_EXPLORE_SHEET_IDS,
  MISSION_IDS,
  MISSION_PUBLICATION_STATES,
  MISSION_TYPES,
  MISSION_USER_STATES,
  MISSION_XP_AMOUNT,
  MISSION_XP_SOURCE,
  getMissionById,
  isMissionCategoryId,
  isMissionExploreSheetId,
  isMissionId,
  isMissionOptionId,
  listMissionsByCategory,
  listPublishedMissions,
  missionUserState,
  optionLabelKey,
} from "./missions.js";
import { PROGRESS_XP_AMOUNT } from "./progress.js";

const publicSource = readFileSync(new URL("./missions.ts", import.meta.url), "utf8");
const indexSource = readFileSync(new URL("./index.ts", import.meta.url), "utf8");
const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as { exports?: Record<string, unknown> };

test("missions is a pure public module without Prisma, HTTP, React or answer keys", () => {
  assert.equal(publicSource.includes("@prisma"), false);
  assert.equal(publicSource.includes("from \"react"), false);
  assert.equal(publicSource.includes("fetch("), false);
  assert.equal(publicSource.includes("/me/"), false);
  assert.equal(publicSource.includes("correctOptionId"), false);
  assert.equal(publicSource.includes("MISSION_CORRECT_OPTION"), false);
  assert.equal(publicSource.includes("minLevel"), false);
  assert.equal(publicSource.includes("lastUseDate"), false);
  assert.equal(/\bin_progress\b/.test(publicSource), false);
  assert.match(publicSource, /not gated by level/);
  assert.match(publicSource, /must not appear in this package/);
});

test("shared-types has no answers subpath or answer-key module", () => {
  assert.equal(indexSource.includes("missions-answers"), false);
  assert.match(indexSource, /from "\.\/missions\.js"/);
  assert.equal(packageJson.exports?.["./missions-answers"], undefined);
  assert.deepEqual(Object.keys(packageJson.exports ?? {}), ["."]);
  assert.equal(existsSync(new URL("./missions-answers.ts", import.meta.url)), false);
});

test("pilot catalog has six unique published reading-check missions", () => {
  assert.equal(MISSION_CATALOG.length, 6);
  assert.deepEqual(MISSION_CATALOG.map((row) => row.id), [...MISSION_IDS]);
  assert.deepEqual(new Set(MISSION_CATALOG.map((row) => row.id)).size, 6);
  for (const row of MISSION_CATALOG) {
    assert.equal(row.type, "reading_check");
    assert.equal(row.status, "published");
    assert.equal(row.contentVersion, 1);
    assert.ok(Number.isInteger(row.contentVersion) && row.contentVersion >= 1);
    assert.equal(MISSION_XP_AMOUNT, 12);
    assert.equal(MISSION_XP_AMOUNT, PROGRESS_XP_AMOUNT.mission_complete);
    assert.equal(MISSION_XP_SOURCE, "mission_complete");
    assert.equal("correctOptionId" in row, false);
  }
});

test("categories, types and user states stay minimal", () => {
  assert.deepEqual([...MISSION_CATEGORY_IDS], [
    "neurotransmitters",
    "processes",
    "substances",
    "orientation",
  ]);
  assert.deepEqual([...MISSION_TYPES], ["reading_check"]);
  assert.deepEqual([...MISSION_PUBLICATION_STATES], ["draft", "published"]);
  assert.deepEqual([...MISSION_USER_STATES], ["available", "completed"]);
  assert.equal(isMissionCategoryId("neurotransmitters"), true);
  assert.equal(isMissionCategoryId("habits"), false);
  assert.equal(missionUserState(false), "available");
  assert.equal(missionUserState(true), "completed");
});

test("sort order is stable and unique", () => {
  const orders = MISSION_CATALOG.map((row) => row.sortOrder);
  assert.deepEqual(orders, [10, 20, 30, 40, 50, 60]);
  assert.deepEqual(new Set(orders).size, orders.length);
  const listed = listPublishedMissions();
  assert.deepEqual(
    listed.map((row) => row.id),
    [...MISSION_IDS],
  );
});

test("pilot missions use published explore sheets and split categories", () => {
  const expected = {
    "edu-dopamine-01": { categoryId: "neurotransmitters", sheetId: "dopamine" },
    "edu-serotonin-01": { categoryId: "neurotransmitters", sheetId: "serotonin" },
    "edu-gaba-01": { categoryId: "neurotransmitters", sheetId: "gaba" },
    "edu-receptors-01": { categoryId: "processes", sheetId: "receptors" },
    "edu-tolerance-01": { categoryId: "processes", sheetId: "tolerance" },
    "edu-neuroadaptation-01": { categoryId: "processes", sheetId: "neuroadaptation" },
  } as const;

  for (const row of MISSION_CATALOG) {
    assert.equal(row.categoryId, expected[row.id].categoryId);
    assert.equal(row.sheetId, expected[row.id].sheetId);
    assert.equal(isMissionExploreSheetId(row.sheetId), true);
    assert.ok((MISSION_EXPLORE_SHEET_IDS as readonly string[]).includes(row.sheetId));
  }

  assert.equal(listMissionsByCategory("neurotransmitters").length, 3);
  assert.equal(listMissionsByCategory("processes").length, 3);
  assert.equal(listMissionsByCategory("substances").length, 0);
  assert.equal(listMissionsByCategory("orientation").length, 0);
});

test("option ids are unique per mission and i18n keys are stable", () => {
  for (const row of MISSION_CATALOG) {
    const ids = row.options.map((option) => option.id);
    assert.ok(ids.length >= 3);
    assert.deepEqual(new Set(ids).size, ids.length);
    assert.equal(row.titleKey, `missions.items.${row.id}.title`);
    assert.equal(row.summaryKey, `missions.items.${row.id}.summary`);
    assert.equal(row.goalKey, `missions.items.${row.id}.goal`);
    assert.equal(row.promptKey, `missions.items.${row.id}.prompt`);
    assert.equal(row.explainKey, `missions.items.${row.id}.explain`);
    assert.equal(optionLabelKey(row.id, ids[0]!), `missions.items.${row.id}.options.${ids[0]}`);
    assert.equal(isMissionOptionId(row, ids[0]!), true);
    assert.equal(isMissionOptionId(row, "missing"), false);
  }
  assert.equal(isMissionId("edu-dopamine-01"), true);
  assert.equal(isMissionId("edu-unknown-01"), false);
  assert.equal(getMissionById("edu-gaba-01")?.sheetId, "gaba");
});
