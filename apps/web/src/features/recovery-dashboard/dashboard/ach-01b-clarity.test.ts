import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import enAchievements from "../../../i18n/locales/en/achievements.json" with { type: "json" };
import esAchievements from "../../../i18n/locales/es/achievements.json" with { type: "json" };
import enRecovery from "../../../i18n/locales/en/recovery.json" with { type: "json" };
import esRecovery from "../../../i18n/locales/es/recovery.json" with { type: "json" };
import { achievementCatalog } from "../achievement-catalog.generated.ts";
import { describeAchievement } from "./achievements-view.ts";

const clinical = /tu cuerpo se ha recuperado|your body has recovered|neurotransmisores se han normalizado|neurotransmitters have normalized|certifica tu salud|certifies your health|medición clínica individual|individual clinical measurement/i;

test("curve medals use educational copy in ES and EN", () => {
  const es = esAchievements as Record<string, { title?: string; description?: string }>;
  const en = enAchievements as Record<string, { title?: string; description?: string }>;
  let curves = 0;
  for (const item of achievementCatalog) {
    if (item.family !== "curve") continue;
    curves += 1;
    const esRow = es[item.id];
    const enRow = en[item.id];
    assert.ok(esRow?.title && esRow.description, item.id);
    assert.ok(enRow?.title && enRow.description, item.id);
    assert.match(esRow.description, /curva educativa/);
    assert.match(enRow.description, /Educational-curve milestone/);
    assert.doesNotMatch(esRow.description, clinical);
    assert.doesNotMatch(enRow.description, clinical);
    assert.doesNotMatch(esRow.description, /se ha recuperado tu/);
    assert.doesNotMatch(enRow.description, /your organ has recovered/i);
  }
  assert.equal(curves, 106);
});

test("temporal medals stay distinct from educational-curve medals", () => {
  const esUi = (esAchievements as { ui: Record<string, string> }).ui;
  const enUi = (enAchievements as { ui: Record<string, string> }).ui;
  assert.match(esUi.temporalSectionTitle, /tiempo/i);
  assert.match(enUi.temporalSectionTitle, /time/i);
  assert.match(esUi.curveSectionTitle, /curvas educativas/i);
  assert.match(enUi.curveSectionTitle, /educational-curve/i);
  assert.match(esUi.temporalSectionSubtitle, /Recuperación/);
  assert.match(enUi.temporalSectionSubtitle, /Recovery/);
  assert.match(esUi.curveSectionSubtitle, /no certifica/i);
  assert.equal(esRecovery.recoveryProgressMedals, "Hitos temporales alcanzados");
  assert.match(esRecovery.recoveryFocusIntro, /medallas se reconocen en Logros/);
  assert.match(enRecovery.recoveryFocusIntro, /Medals are recognized in Achievements/);
  assert.match(esRecovery.recoveryTimelineHint, /reconocimiento de la medalla/);
  const temporal = achievementCatalog.find((row) => row.id === "cannabis-temporal-7");
  const curve = achievementCatalog.find((row) => row.id === "alcohol-liver-bronze-1");
  assert.equal(temporal?.family, "temporal");
  assert.equal(curve?.family, "curve");
  assert.equal(temporal?.abstinenceDays, 7);
  assert.equal(curve?.threshold, 0.1);
});

test("live unlock state does not follow the frontend clock alone", () => {
  const item = achievementCatalog.find((row) => row.id === "nicotine-temporal-7");
  assert.ok(item);
  const preview = describeAchievement(item, undefined, {
    substanceId: "nicotine",
    status: "upcoming",
    daysAbstinent: 15,
    next: {
      achievementId: "nicotine-temporal-21",
      titleKey: "nicotine-temporal-21.title",
      thresholdDays: 21,
      dueAt: new Date("2026-12-01T00:00:00.000Z"),
      remainingMs: 1,
      progress: 0.4,
      tier: "silver",
    },
  });
  assert.equal(preview.unlocked, false);
  assert.equal(preview.bucket, "locked");
  const livePending = describeAchievement(
    item,
    {
      id: item.id,
      family: "temporal",
      tier: "bronze",
      titleKey: "x",
      descriptionKey: "y",
      triggerOrganId: null,
      triggerSubstanceId: "nicotine",
      triggerRecoveryThreshold: null,
      hidden: false,
      unlocked: false,
      unlockedAt: null,
      notifiedAt: null,
      achievementProgress: 1,
      progressAvailability: "ready",
    },
    {
      substanceId: "nicotine",
      status: "upcoming",
      daysAbstinent: 15,
      next: {
        achievementId: "nicotine-temporal-21",
        titleKey: "nicotine-temporal-21.title",
        thresholdDays: 21,
        dueAt: new Date("2026-12-01T00:00:00.000Z"),
        remainingMs: 1,
        progress: 0.4,
        tier: "silver",
      },
    },
  );
  assert.equal(livePending.unlocked, false);
  assert.equal(livePending.bucket, "locked");
  const earned = describeAchievement(
    item,
    {
      id: item.id,
      family: "temporal",
      tier: "bronze",
      titleKey: "x",
      descriptionKey: "y",
      triggerOrganId: null,
      triggerSubstanceId: "nicotine",
      triggerRecoveryThreshold: null,
      hidden: false,
      unlocked: true,
      unlockedAt: "2026-10-01T00:00:00.000Z",
      notifiedAt: null,
      achievementProgress: 1,
      progressAvailability: "ready",
    },
    null,
  );
  assert.equal(earned.unlocked, true);
  assert.equal(earned.bucket, "unlocked");
});

test("preview and live chrome stay semantically aligned", () => {
  const esUi = (esAchievements as { ui: Record<string, string> }).ui;
  const enUi = (enAchievements as { ui: Record<string, string> }).ui;
  assert.match(esUi.descriptionLive, /medallas de tu cuenta/);
  assert.match(esUi.descriptionDemo, /no marca una medalla como obtenida/);
  assert.match(enUi.descriptionLive, /Medals on your account/);
  assert.match(enUi.descriptionDemo, /does not mark a medal as earned/);
  assert.equal(
    esUi.historyNote,
    "Las medallas obtenidas permanecen en tu historial, incluso si comienzas una nueva racha.",
  );
  assert.equal(
    enUi.historyNote,
    "Earned medals stay in your history, even if you start a new streak.",
  );
  assert.doesNotMatch(esUi.historyNote, /clínic|certifica|racha anterior/i);
  assert.doesNotMatch(enUi.historyNote, /clinic|certif|previous streak/i);
  assert.equal(esUi.statusUnlocked, "Obtenida");
  assert.equal(enUi.statusUnlocked, "Earned");
  assert.equal(esUi.statusLocked, "Pendiente");
  assert.equal(enUi.statusLocked, "Pending");
  assert.doesNotMatch(esUi.descriptionLive, /XP/i);
  assert.doesNotMatch(enUi.descriptionDemo, /XP/i);
});

test("ACH-01B does not change unlock identifiers or shared math", () => {
  const adapter = readFileSync(
    new URL("../../../../../../packages/shared-types/src/recovery-math.ts", import.meta.url),
    "utf8",
  );
  const persist = readFileSync(
    new URL("../../../../../api/src/achievements/user-achievement-persist.ts", import.meta.url),
    "utf8",
  );
  const seed = readFileSync(
    new URL("../../../../../api/prisma/seed/achievements.ts", import.meta.url),
    "utf8",
  );
  assert.match(adapter, /planAchievementUnlocks/);
  assert.match(persist, /ON CONFLICT/);
  assert.equal(achievementCatalog.length, 156);
  assert.equal(achievementCatalog.filter((row) => row.family === "temporal").length, 50);
  assert.match(seed, /alcohol-liver-bronze-1/);
  const ids = achievementCatalog.map((row) => row.id).sort();
  assert.equal(new Set(ids).size, 156);
});

test("gallery cards always expose a textual status label", () => {
  const card = readFileSync(
    new URL("../components/AchievementGalleryCard.tsx", import.meta.url),
    "utf8",
  );
  assert.match(card, /aria-label=\{accessibleName\}/);
  assert.match(card, /labels\.family/);
});
