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
  assert.match(app, /path="achievements" element=\{<Soma2AchievementsPage/);
  const afterLegacy = protectedBlock.slice(protectedBlock.indexOf('path="/achievements"'));
  assert.doesNotMatch(afterLegacy.slice(0, 400), /path="\/app\/achievements"/);
  assert.equal(existsSync(new URL("../../../pages/AchievementsPage.tsx", import.meta.url)), false);
  assert.ok(existsSync(new URL("../pages/AchievementsPage.tsx", import.meta.url)));
});

test("/app-legacy redirects to /app inside the auth gate", () => {
  const app = readFileSync(new URL("../../../App.tsx", import.meta.url), "utf8");
  const protectedBlock = app.slice(app.indexOf('element={<ProtectedLayout />}'));
  assert.match(protectedBlock, /path="\/app-legacy"/);
  assert.match(protectedBlock, /Navigate to="\/app" replace/);
  assert.doesNotMatch(app, /<MainPage \/>/);
  assert.doesNotMatch(app, /pages\/MainPage/);
  const outsideProtected = app.slice(0, app.indexOf('element={<ProtectedLayout />}'));
  assert.doesNotMatch(outsideProtected, /path="\/app-legacy"/);
  assert.equal(existsSync(new URL("../../../pages/MainPage.tsx", import.meta.url)), false);
  assert.equal(
    existsSync(new URL("../../../../public/models/body_male.glb", import.meta.url)),
    false,
  );
});

test("/preview still mounts PreviewShell and Soma 2.0 pages", () => {
  const app = readFileSync(new URL("../../../App.tsx", import.meta.url), "utf8");
  assert.match(app, /path="\/preview"/);
  assert.match(app, /PreviewShell base="\/preview"/);
  assert.match(app, /PreviewShell base="\/app"/);
  assert.match(app, /soma2Pages/);
  assert.doesNotMatch(app, /PreviewPage/);
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

test("Soma 1.0 Three.js and zustand leave the web package", () => {
  const pkg = readFileSync(new URL("../../../../package.json", import.meta.url), "utf8");
  for (const dep of ["three", "@react-three/fiber", "@react-three/drei", "zustand", "@types/three"]) {
    assert.doesNotMatch(pkg, new RegExp(`"${dep.replace("/", "\\/")}"`));
  }
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
