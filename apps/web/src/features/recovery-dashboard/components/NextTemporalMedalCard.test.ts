import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("temporal cards reuse GAME-01 title keys and avoid hardcoded Spanish", () => {
  const card = readFileSync(new URL("./NextTemporalMedalCard.tsx", import.meta.url), "utf8");
  const home = readFileSync(new URL("./PreviewHome.tsx", import.meta.url), "utf8");
  const recovery = readFileSync(new URL("../pages/RecoveryPage.tsx", import.meta.url), "utf8");
  const es = readFileSync(
    new URL("../../../i18n/locales/es/recovery.json", import.meta.url),
    "utf8",
  );
  const en = readFileSync(
    new URL("../../../i18n/locales/en/recovery.json", import.meta.url),
    "utf8",
  );

  assert.match(card, /achievements:\$\{next\.titleKey\}/);
  assert.match(card, /family="temporal"/);
  assert.match(card, /homeNextMedal/);
  assert.match(home, /pickNextLockedAchievement/);
  assert.match(home, /NextTemporalMedalCard/);
  assert.match(recovery, /temporal=\{temporalById\.get\(item\.id\)\}/);
  assert.match(es, /"homeNextMedal": "Tu próxima recompensa"/);
  assert.match(en, /"homeNextMedal": "Your next reward"/);
  assert.equal(card.includes("Tu próxima recompensa"), false);
  assert.equal(card.includes("segundo"), false);
});

test("recovery cards stay compact and do not draw a ten-node timeline", () => {
  const card = readFileSync(new URL("./SubstanceCard.tsx", import.meta.url), "utf8");
  const recovery = readFileSync(new URL("../pages/RecoveryPage.tsx", import.meta.url), "utf8");
  assert.match(card, /temporalBarFill/);
  assert.match(card, /AchievementMedal/);
  assert.equal(card.includes("TEMPORAL_THRESHOLDS"), false);
  assert.equal(recovery.includes("timeline-node"), false);
  assert.equal(card.includes("substance.bar"), false);
});
