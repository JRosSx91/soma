import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { PROGRESS_TITLE_IDS, PROGRESS_TITLES } from "@soma/shared-types";
import {
  DEMO_PROGRESS,
  DEMO_PROGRESS_EQUIPPED_TITLE_ID,
  DEMO_PROGRESS_LEVEL,
  DEMO_PROGRESS_TOTAL_XP,
} from "./progress-demo.ts";
import { equipProgressView } from "./progress-model.ts";
import enProgress from "../../i18n/locales/en/progress.json" with { type: "json" };
import esProgress from "../../i18n/locales/es/progress.json" with { type: "json" };
import enCommon from "../../i18n/locales/en/common.json" with { type: "json" };
import esCommon from "../../i18n/locales/es/common.json" with { type: "json" };

const picker = readFileSync(new URL("./TitlePicker.tsx", import.meta.url), "utf8");
const identity = readFileSync(new URL("./HomeProgressIdentity.tsx", import.meta.url), "utf8");
const hook = readFileSync(new URL("./useProgress.ts", import.meta.url), "utf8");
const api = readFileSync(new URL("./progress-api.ts", import.meta.url), "utf8");
const demo = readFileSync(new URL("./progress-demo.ts", import.meta.url), "utf8");
const home = readFileSync(
  new URL("../recovery-dashboard/components/PreviewHome.tsx", import.meta.url),
  "utf8",
);

test("picker renders the nine catalog titles in catalog order", () => {
  assert.match(picker, /PROGRESS_TITLES\.map/);
  assert.equal(picker.includes("PROGRESS_TITLE_IDS.map"), false);
  assert.equal(picker.includes(".sort("), false);
  assert.deepEqual(
    PROGRESS_TITLES.map((row) => row.id),
    [...PROGRESS_TITLE_IDS],
  );
  assert.equal(PROGRESS_TITLES.length, 9);
  assert.match(picker, /data-title-id=\{row\.id\}/);
  assert.match(picker, /t\(`progress:titles\.\$\{row\.id\}`\)/);
});

test("equipped title is marked pressed and does not PATCH again", () => {
  assert.match(picker, /row\.id === progress\.equippedTitleId/);
  assert.match(picker, /aria-pressed=\{equipped\}/);
  assert.match(picker, /if \(nextId === progress\.equippedTitleId\) return;/);
  assert.match(hook, /current\?\.equippedTitleId === titleId/);
  assert.equal(DEMO_PROGRESS.equippedTitleId, "cartographer");
});

test("locked titles stay visible, desaturated and not selectable", () => {
  assert.match(picker, /unlockedTitleIds\.includes\(row\.id\)/);
  assert.match(picker, /if \(!progress\.unlockedTitleIds\.includes\(nextId\)\) return;/);
  assert.match(picker, /disabled=\{locked \|\| busy\}/);
  assert.match(picker, /brightness-\[0\.72\] saturate-\[0\.45\]/);
  assert.match(picker, /progress:levelRequired/);
  assert.match(picker, /<Lock /);
  assert.match(picker, /TitleEmblem titleId=\{row\.id\}/);
  assert.equal(picker.includes("hidden") && picker.includes("locked && hidden"), false);
});

test("a lower unlocked title can be equipped without changing XP or level", () => {
  const walker = equipProgressView(DEMO_PROGRESS, "walker");
  const explorer = equipProgressView(DEMO_PROGRESS, "explorer");
  assert.equal(walker.equippedTitleId, "walker");
  assert.equal(explorer.equippedTitleId, "explorer");
  assert.equal(walker.level, DEMO_PROGRESS_LEVEL);
  assert.equal(walker.totalXp, DEMO_PROGRESS_TOTAL_XP);
  assert.equal(explorer.level, 12);
  assert.equal(explorer.totalXp, 4435);
  assert.deepEqual(walker.unlockedTitleIds, DEMO_PROGRESS.unlockedTitleIds);
});

test("LIVE PATCH sends only equippedTitleId and waits for the server", () => {
  assert.match(api, /method: "PATCH"/);
  assert.match(api, /body: \{ equippedTitleId \}/);
  assert.equal(api.includes("totalXp"), false);
  assert.equal(api.includes("level:"), false);
  assert.match(hook, /await patchEquippedTitle\(titleId\)/);
  assert.match(hook, /setProgress\(row\)/);
  const liveEquip = hook.slice(hook.indexOf("if (updatingRef.current)"), hook.lastIndexOf("[live]"));
  assert.equal(liveEquip.includes("equipProgressView"), false);
  assert.match(picker, /await onEquip\(nextId\)/);
  assert.equal(picker.includes("setProgress"), false);
});

test("GET and PATCH errors stay independent and a failed PATCH keeps loaded progress", () => {
  assert.match(hook, /equipError: string \| null/);
  assert.match(hook, /setEquipError\(null\)/);
  const getCatch = hook.slice(
    hook.indexOf(".catch((err: unknown) => {"),
    hook.indexOf("return () =>"),
  );
  assert.match(getCatch, /setProgress\(null\)/);
  assert.match(getCatch, /setState\("error"\)/);
  assert.match(getCatch, /setError\(/);
  assert.equal(getCatch.includes("setEquipError"), false);
  const liveEquip = hook.slice(hook.indexOf("if (updatingRef.current)"), hook.lastIndexOf("[live]"));
  assert.match(liveEquip, /setEquipError\(null\)/);
  assert.match(liveEquip, /setEquipError\(err instanceof Error/);
  assert.equal(liveEquip.includes("setError("), false);
  assert.equal(liveEquip.includes("setProgress(null)"), false);
  assert.equal(liveEquip.includes("fetchMyProgress"), false);
  const catchBlock = liveEquip.slice(liveEquip.indexOf("catch (err: unknown)"));
  assert.equal(catchBlock.includes("setProgress"), false);
  assert.match(hook, /throw err;/);
  assert.match(picker, /equipError/);
  assert.match(picker, /progress:saveError/);
  assert.match(picker, /role="alert"/);
  assert.match(picker, /progress:retry/);
  assert.match(identity, /equipError=\{equipError\}/);
  assert.match(home, /equipError=\{progression\.equipError\}/);
});

test("a successful equip clears equipError without a second GET", () => {
  const liveEquip = hook.slice(hook.indexOf("if (updatingRef.current)"), hook.lastIndexOf("[live]"));
  assert.match(liveEquip, /const row = await patchEquippedTitle\(titleId\);\s*setProgress\(row\);\s*setEquipError\(null\)/);
  assert.equal(liveEquip.includes("fetchMyProgress"), false);
  assert.match(hook, /equipProgressView\(row, titleId\)[\s\S]*setEquipError\(null\)/);
});

test("duplicate PATCH is blocked while a title update is in flight", () => {
  assert.match(hook, /if \(updatingRef\.current\) return;/);
  assert.match(hook, /updatingRef\.current = true;/);
  assert.match(picker, /if \(updatingTitle \|\| inflightRef\.current\) return;/);
  assert.match(picker, /disabled=\{locked \|\| busy\}/);
  assert.match(picker, /aria-busy=\{busy \|\| undefined\}/);
});

test("DEMO stays on the local fixture and never calls the progress API", () => {
  assert.equal(demo.includes("apiRequest"), false);
  assert.equal(demo.includes("/me/progress"), false);
  assert.match(hook, /if \(!live\) \{/);
  assert.match(hook, /equipProgressView\(row, titleId\)/);
  assert.equal(DEMO_PROGRESS_LEVEL, 12);
  assert.equal(DEMO_PROGRESS_TOTAL_XP, 4435);
  assert.equal(DEMO_PROGRESS_EQUIPPED_TITLE_ID, "cartographer");
  assert.deepEqual(DEMO_PROGRESS.unlockedTitleIds, ["walker", "explorer", "cartographer"]);
  assert.equal(home.includes("patchEquippedTitle"), false);
  assert.equal(home.includes("/me/progress"), false);
  assert.equal(picker.includes("patchEquippedTitle"), false);
  assert.equal(picker.includes("apiRequest"), false);
});

test("equipping a title does not rewrite XP or level locally", () => {
  assert.match(hook, /progressViewFromTotalXp|equipProgressView|patchEquippedTitle/);
  assert.equal(picker.includes("totalXp"), false);
  assert.equal(picker.includes("setLevel"), false);
  const afterEquip = equipProgressView(DEMO_PROGRESS, "explorer");
  assert.equal(afterEquip.totalXp, DEMO_PROGRESS.totalXp);
  assert.equal(afterEquip.level, DEMO_PROGRESS.level);
  assert.equal(afterEquip.xpIntoLevel, DEMO_PROGRESS.xpIntoLevel);
});

test("Inicio opens the picker from change title and restores focus on close", () => {
  assert.match(identity, /progress:changeTitle/);
  assert.match(identity, /setPickerOpen\(true\)/);
  assert.match(identity, /<TitlePicker/);
  assert.match(identity, /onEquip=\{equipTitle\}/);
  assert.match(identity, /equipError=\{equipError\}/);
  assert.match(picker, /role="dialog"/);
  assert.match(picker, /aria-modal="true"/);
  assert.match(picker, /aria-labelledby=\{titleId\}/);
  assert.match(picker, /progress:changeTitle/);
  assert.match(picker, /event\.key === "Escape"/);
  assert.match(picker, /useLayoutEffect/);
  assert.match(picker, /restoreOpener\(openerRef\.current\)/);
  assert.match(picker, /common:close/);
  assert.equal(esCommon.close, "Cerrar");
  assert.equal(enCommon.close, "Close");
});

test("keyboard focus stays in the dialog and emblems stay decorative", () => {
  assert.match(picker, /event\.key !== "Tab"/);
  assert.match(picker, /focusin/);
  assert.match(picker, /previewFocus/);
  assert.match(picker, /<TitleEmblem titleId=\{row\.id\} size=\{80\} \/>/);
  assert.match(picker, /<TitleEmblem titleId=\{row\.id\} size=\{128\} \/>/);
  assert.equal(picker.includes("label="), false);
  assert.match(picker, /grid-cols-1/);
  assert.match(picker, /sm:grid-cols-2/);
  assert.match(picker, /lg:grid-cols-3/);
  assert.match(picker, /overflow-x-hidden/);
  assert.match(picker, /overflow-y-auto/);
});

test("picker copy exists in spanish and english without extra rewards", () => {
  assert.equal(esProgress.changeTitle, "Cambiar título");
  assert.equal(enProgress.changeTitle, "Change title");
  assert.equal(esProgress.equipped, "Título equipado");
  assert.equal(enProgress.equipped, "Equipped title");
  assert.equal(esProgress.titleUnlocked, "Título desbloqueado");
  assert.equal(enProgress.titleUnlocked, "Unlocked title");
  assert.equal(esProgress.titleLocked, "Título bloqueado");
  assert.equal(enProgress.titleLocked, "Locked title");
  assert.match(esProgress.levelRequired, /nivel \{\{level\}\}/);
  assert.match(enProgress.levelRequired, /level \{\{level\}\}/);
  assert.equal(esProgress.equip, "Equipar");
  assert.equal(enProgress.equip, "Equip");
  assert.equal(esProgress.updatingTitle, "Actualizando título…");
  assert.equal(enProgress.updatingTitle, "Updating title…");
  assert.equal(esProgress.saveError, "No se ha podido guardar el título.");
  assert.equal(enProgress.saveError, "Could not save the title.");
  assert.equal(esProgress.retry, "Reintentar");
  assert.equal(enProgress.retry, "Try again");
  assert.equal(picker.includes("awardXp"), false);
  assert.equal(picker.includes("Misiones"), false);
});
