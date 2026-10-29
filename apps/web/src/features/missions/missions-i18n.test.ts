import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import {
  MISSION_CATALOG,
  MISSION_CATEGORY_IDS,
  MISSION_EXPLORE_SHEET_IDS,
  optionLabelKey,
} from "@soma/shared-types";
import { publishedExploreEduSheets } from "../recovery-dashboard/explore/explore-edu.ts";
import enMissions from "../../i18n/locales/en/missions.json" with { type: "json" };
import esMissions from "../../i18n/locales/es/missions.json" with { type: "json" };

const config = readFileSync(new URL("../../i18n/config.ts", import.meta.url), "utf8");
const publicContract = readFileSync(
  new URL("../../../../../packages/shared-types/src/missions.ts", import.meta.url),
  "utf8",
);
const sharedPackage = JSON.parse(
  readFileSync(new URL("../../../../../packages/shared-types/package.json", import.meta.url), "utf8"),
) as { exports?: Record<string, unknown> };

function flattenKeys(value: unknown, prefix = ""): string[] {
  if (value == null || typeof value !== "object") return prefix ? [prefix] : [];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, nested]) =>
    flattenKeys(nested, prefix ? `${prefix}.${key}` : key),
  );
}

function lookup(bundle: unknown, key: string): unknown {
  return key.split(".").reduce<unknown>((acc, part) => {
    if (acc == null || typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[part];
  }, bundle);
}

test("ES and EN mission catalogs share the same keys and cover the pilot", () => {
  assert.deepEqual(flattenKeys(esMissions).sort(), flattenKeys(enMissions).sort());
  assert.equal(typeof esMissions.disclaimer, "string");
  assert.equal(typeof enMissions.disclaimer, "string");
  assert.match(esMissions.disclaimer, /no son una valoración clínica/i);
  assert.match(enMissions.disclaimer, /not a clinical assessment/i);
  assert.deepEqual(Object.keys(esMissions.categories).sort(), [...MISSION_CATEGORY_IDS].sort());
  assert.deepEqual(Object.keys(enMissions.categories).sort(), [...MISSION_CATEGORY_IDS].sort());

  for (const row of MISSION_CATALOG) {
    for (const key of [row.titleKey, row.summaryKey, row.goalKey, row.promptKey, row.explainKey]) {
      const path = key.replace(/^missions\./, "");
      const es = lookup(esMissions, path);
      const en = lookup(enMissions, path);
      assert.equal(typeof es, "string", key);
      assert.equal(typeof en, "string", key);
      assert.ok((es as string).length > 0, key);
      assert.ok((en as string).length > 0, key);
    }
    for (const option of row.options) {
      const path = optionLabelKey(row.id, option.id).replace(/^missions\./, "");
      assert.equal(typeof lookup(esMissions, path), "string");
      assert.equal(typeof lookup(enMissions, path), "string");
    }
  }
});

test("mission sheet ids match published Explore educational sheets", () => {
  assert.deepEqual([...MISSION_EXPLORE_SHEET_IDS], [...publishedExploreEduSheets]);
  for (const row of MISSION_CATALOG) {
    assert.ok((publishedExploreEduSheets as readonly string[]).includes(row.sheetId));
  }
});

test("i18n config registers missions in ES/EN without importing answer keys", () => {
  assert.match(config, /"missions"/);
  assert.match(config, /enMissions/);
  assert.match(config, /esMissions/);
  assert.equal(config.includes("missions-answers"), false);
  assert.equal(config.includes("MISSION_CORRECT_OPTION"), false);
  assert.equal(publicContract.includes("correctOptionId"), false);
  assert.equal(sharedPackage.exports?.["./missions-answers"], undefined);
  assert.equal(
    existsSync(
      new URL("../../../../../packages/shared-types/src/missions-answers.ts", import.meta.url),
    ),
    false,
  );
});

test("locale copy does not encode the correct option or level locks", () => {
  const es = JSON.stringify(esMissions);
  const en = JSON.stringify(enMissions);
  assert.equal(es.includes("correctOption"), false);
  assert.equal(en.includes("correctOption"), false);
  assert.equal(es.includes("minLevel"), false);
  assert.equal(en.includes("minLevel"), false);
  assert.equal(es.includes("in_progress"), false);
});
