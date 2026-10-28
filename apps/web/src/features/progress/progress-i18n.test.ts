import assert from "node:assert/strict";
import { test } from "node:test";
import { PROGRESS_TITLE_IDS, PROGRESS_TITLES } from "@soma/shared-types";
import enProgress from "../../i18n/locales/en/progress.json" with { type: "json" };
import esProgress from "../../i18n/locales/es/progress.json" with { type: "json" };

function flattenKeys(value: unknown, prefix = ""): string[] {
  if (value == null || typeof value !== "object") return prefix ? [prefix] : [];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, nested]) =>
    flattenKeys(nested, prefix ? `${prefix}.${key}` : key),
  );
}

const REQUIRED = [
  "level",
  "xp",
  "xpProgress",
  "nextLevel",
  "equipped",
  "changeTitle",
  "titleLocked",
  "levelRequired",
  "loading",
  "loadError",
  "retry",
  "updatingTitle",
] as const;

test("ES and EN progress catalogs cover the nine title ids and UI chrome", () => {
  assert.deepEqual(flattenKeys(esProgress).sort(), flattenKeys(enProgress).sort());
  for (const key of REQUIRED) {
    assert.equal(typeof esProgress[key], "string");
    assert.equal(typeof enProgress[key], "string");
    assert.ok((esProgress[key] as string).length > 0);
    assert.ok((enProgress[key] as string).length > 0);
  }
  assert.deepEqual(Object.keys(esProgress.titles).sort(), [...PROGRESS_TITLE_IDS].sort());
  assert.deepEqual(Object.keys(enProgress.titles).sort(), [...PROGRESS_TITLE_IDS].sort());
  for (const row of PROGRESS_TITLES) {
    assert.equal(row.titleKey, `progress.titles.${row.id}`);
    assert.ok(esProgress.titles[row.id].length > 0);
    assert.ok(enProgress.titles[row.id].length > 0);
  }
  assert.match(esProgress.titlesNote, /provisional/i);
  assert.match(enProgress.titlesNote, /provisional/i);
});
