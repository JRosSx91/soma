import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import enAchievements from "../../../i18n/locales/en/achievements.json" with { type: "json" };
import esAchievements from "../../../i18n/locales/es/achievements.json" with { type: "json" };

test("achievements 2.0 chrome exists in spanish and english", () => {
  const es = esAchievements as { ui: Record<string, string> };
  const en = enAchievements as { ui: Record<string, string> };
  assert.equal(es.ui.title, "Pequeños pasos, grandes cambios.");
  assert.equal(en.ui.title, "Small steps, great changes.");
  assert.equal(es.ui.familyTemporal, "Tiempo");
  assert.equal(en.ui.familyCurve, "Curve");
  assert.equal(es.ui.catalogLabel, "Disponibles");
  assert.equal(es.ui.unavailableCountLabel, "Pendientes de definición");
  assert.equal(en.ui.unavailableCountLabel, "Pending definition");
  assert.match(es.ui.curveSectionSubtitle, /neurotransmisores/);
  assert.match(en.ui.curveSectionSubtitle, /neurotransmitters/);
  assert.doesNotMatch(es.ui.catalogLabel, /XP/i);
  assert.doesNotMatch(en.ui.inProgressLabel, /level/i);
});

test("achievements page composition matches GAME-03C regions", () => {
  const page = readFileSync(new URL("../pages/AchievementsPage.tsx", import.meta.url), "utf8");
  const hero = readFileSync(new URL("./RecoveryHero.tsx", import.meta.url), "utf8");
  assert.match(page, /nature-3\.png/);
  assert.match(page, /imageSrc=\{ACHIEVEMENTS_HERO_IMAGE\}/);
  assert.match(hero, /imageSrc = DEFAULT_IMAGE/);
  assert.match(hero, /nature-2\.png/);
  assert.match(page, /AchievementSummaryStrip/);
  assert.match(page, /stats\.availableTotal/);
  assert.match(page, /stats\.collectionPercent/);
  assert.match(page, /unavailableCountLabel/);
  assert.doesNotMatch(page, /catalogSharePercent\(stats\.unlocked, counts\.total\)/);
  assert.match(page, /featuredTitle/);
  assert.match(page, /temporalSectionTitle/);
  assert.match(page, /curveSectionTitle/);
  assert.match(page, /pickAchievementHighlights/);
  assert.match(page, /excludeIds: unavailableIds/);
  assert.match(page, /"unavailable"/);
  assert.match(page, /familyBadgeTemporal/);
  assert.match(page, /familyBadgeCurve/);
  assert.match(page, /liveEnabled = Boolean\(user\) && base === "\/app"/);
  assert.match(page, /achievements:ui\.historyNote/);
  assert.match(page, /useTranslation\("achievements"\)|useTranslation\(\["achievements"/);
  assert.match(page, /\$\{item\.id\}\.title/);
  assert.doesNotMatch(page, /nature-2\.png/);
  assert.doesNotMatch(page, /XP/);
  assert.equal((page.match(/pages\/AchievementsPage/) ?? []).length, 0);
});

test("achievements search and copy resolve localized catalog keys", () => {
  const page = readFileSync(new URL("../pages/AchievementsPage.tsx", import.meta.url), "utf8");
  assert.match(page, /substanceFor/);
  assert.match(page, /descriptionFor/);
  assert.match(page, /organs:\$\{item\.organId\}/);
  assert.match(page, /ui\.substances\.\$\{item\.substanceId\}/);
  const en = enAchievements as {
    ui: { substances: Record<string, string> };
    "nicotine-temporal-14": { title: string };
  };
  const es = esAchievements as { ui: { substances: Record<string, string> } };
  assert.equal(en.ui.substances.nicotine, "Nicotine");
  assert.equal(es.ui.substances.nicotine, "Nicotina");
  assert.ok(en["nicotine-temporal-14"]?.title);
  assert.notEqual(en["nicotine-temporal-14"].title, "");
});
