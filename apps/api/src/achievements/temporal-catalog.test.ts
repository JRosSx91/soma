import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  TEMPORAL_ACHIEVEMENTS,
  TEMPORAL_DESCRIPTIONS_EN,
  TEMPORAL_DESCRIPTIONS_ES,
  TEMPORAL_SUBSTANCES,
  TEMPORAL_THRESHOLDS,
  TEMPORAL_TITLES,
  TEMPORAL_TITLES_EN,
} from "../../prisma/seed/temporal-achievements.ts";
import { ACHIEVEMENTS } from "../../prisma/seed/achievements.ts";

const es = JSON.parse(
  readFileSync(new URL("../../../web/src/i18n/locales/es/achievements.json", import.meta.url), "utf8"),
) as Record<string, { title?: string; description?: string }>;
const en = JSON.parse(
  readFileSync(new URL("../../../web/src/i18n/locales/en/achievements.json", import.meta.url), "utf8"),
) as Record<string, { title?: string; description?: string }>;

test("GAME-01 temporal catalog is fifty unique medals beside the 106 curve rows", () => {
  assert.equal(ACHIEVEMENTS.length, 106);
  assert.equal(TEMPORAL_ACHIEVEMENTS.length, 50);
  assert.equal(TEMPORAL_SUBSTANCES.length, 5);
  assert.equal(TEMPORAL_THRESHOLDS.length, 10);
  const ids = TEMPORAL_ACHIEVEMENTS.map((row) => row.id);
  assert.equal(new Set(ids).size, 50);
  assert.equal(new Set([...ACHIEVEMENTS.map((row) => row.id), ...ids]).size, 156);
  for (const substanceId of TEMPORAL_SUBSTANCES) {
    const rows = TEMPORAL_ACHIEVEMENTS.filter((row) => row.triggerSubstanceId === substanceId);
    assert.equal(rows.length, 10);
    assert.deepEqual(
      rows.map((row) => row.triggerAbstinenceDays),
      [...TEMPORAL_THRESHOLDS],
    );
  }
  const byDays: Record<number, string> = {
    1: "bronze",
    3: "bronze",
    7: "bronze",
    14: "silver",
    21: "silver",
    30: "silver",
    60: "gold",
    90: "gold",
    180: "gold",
    365: "gold",
  };
  for (const row of TEMPORAL_ACHIEVEMENTS) {
    assert.equal(row.family, "temporal");
    assert.equal(row.tier, byDays[row.triggerAbstinenceDays]);
    assert.equal(es[row.id]?.title, TEMPORAL_TITLES[row.id]);
    assert.equal(es[row.id]?.description, TEMPORAL_DESCRIPTIONS_ES[row.id]);
    assert.equal(en[row.id]?.title, TEMPORAL_TITLES_EN[row.id]);
    assert.equal(en[row.id]?.description, TEMPORAL_DESCRIPTIONS_EN[row.id]);
    assert.notEqual(
      en[row.id]?.title,
      es[row.id]?.title,
      `${row.id} still uses the Spanish title in EN`,
    );
  }
  assert.equal(TEMPORAL_TITLES["cannabis-temporal-60"], "El guardián de los sesenta");
  assert.equal(
    TEMPORAL_DESCRIPTIONS_ES["caffeine-temporal-1"],
    "GET /espresso → 404. El servidor arranca igual.",
  );
  assert.equal(
    TEMPORAL_DESCRIPTIONS_ES["alcohol-temporal-365"],
    "Un año. Los siete reinos caben en un día; el trono, en seguir mañana.",
  );
});
