import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import enAchievements from "../../../i18n/locales/en/achievements.json" with { type: "json" };
import esAchievements from "../../../i18n/locales/es/achievements.json" with { type: "json" };

test("ACH-01C.2 gallery copy explains permanent history without clinical claims", () => {
  const es = (esAchievements as { ui: Record<string, string> }).ui;
  const en = (enAchievements as { ui: Record<string, string> }).ui;
  assert.match(es.historyNote, /permanecen en tu historial/);
  assert.match(es.historyNote, /nueva racha/);
  assert.match(en.historyNote, /stay in your history/);
  assert.match(en.historyNote, /new streak/);
  assert.doesNotMatch(es.historyNote, /XP|misión|récord histórico|racha anterior/i);
  assert.doesNotMatch(en.historyNote, /XP|mission|lifetime record|previous streak/i);
  const page = readFileSync(new URL("../pages/AchievementsPage.tsx", import.meta.url), "utf8");
  assert.match(page, /ui\.historyNote/);
  assert.doesNotMatch(page, /planAchievementUnlocks/);
});

test("legacy /achievements redirects to Logros 2.0 inside the auth gate", () => {
  const app = readFileSync(new URL("../../../App.tsx", import.meta.url), "utf8");
  const protectedBlock = app.slice(app.indexOf('element={<ProtectedLayout />}'));
  assert.match(protectedBlock, /path="\/achievements"/);
  assert.match(protectedBlock, /Navigate to="\/app\/achievements" replace/);
  assert.doesNotMatch(app, /from "\.\/pages\/AchievementsPage/);
  assert.match(app, /path="\/app-legacy"/);
  assert.match(app, /<MainPage \/>/);
  assert.match(app, /path="achievements" element=\{<Soma2AchievementsPage/);
  const afterLegacy = protectedBlock.slice(protectedBlock.indexOf('path="/achievements"'));
  assert.doesNotMatch(afterLegacy.slice(0, 400), /path="\/app\/achievements"/);
  assert.ok(existsSync(new URL("../../../pages/AchievementsPage.tsx", import.meta.url)));
});

test("/app-legacy still enters achievements through the compatible URL", () => {
  const main = readFileSync(new URL("../../../pages/MainPage.tsx", import.meta.url), "utf8");
  const app = readFileSync(new URL("../../../App.tsx", import.meta.url), "utf8");
  assert.match(main, /navigate\("\/achievements"\)/);
  assert.match(app, /path="\/app-legacy"/);
});

test("preview still does not enable live achievement persistence", () => {
  const page = readFileSync(new URL("../pages/AchievementsPage.tsx", import.meta.url), "utf8");
  const shell = readFileSync(new URL("../components/PreviewShell.tsx", import.meta.url), "utf8");
  const hook = readFileSync(new URL("../hooks/usePreviewDashboard.ts", import.meta.url), "utf8");
  assert.match(page, /liveEnabled = Boolean\(user\) && base === "\/app"/);
  assert.match(hook, /isLive = Boolean\(user\) && base === "\/app"/);
  assert.match(shell, /base === "\/app" \? <AchievementCelebrationHost/);
  assert.doesNotMatch(page, /fetchAchievements/);
});

test("ACH-01C.2 does not change unlock persistence or shared math", () => {
  const adapter = readFileSync(
    new URL("../../../../../../packages/shared-types/src/recovery-math.ts", import.meta.url),
    "utf8",
  );
  const persist = readFileSync(
    new URL("../../../../../api/src/achievements/user-achievement-persist.ts", import.meta.url),
    "utf8",
  );
  assert.match(adapter, /export function planAchievementUnlocks/);
  assert.match(persist, /ON CONFLICT \("userId", "achievementId"\) DO NOTHING/);
});
