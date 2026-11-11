import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import enCommon from "../../../i18n/locales/en/common.json" with { type: "json" };
import esCommon from "../../../i18n/locales/es/common.json" with { type: "json" };
import enExpedition from "../../../i18n/locales/en/expedition.json" with { type: "json" };
import esExpedition from "../../../i18n/locales/es/expedition.json" with { type: "json" };

const page = readFileSync(new URL("./ExpeditionPage.tsx", import.meta.url), "utf8");
const map = readFileSync(new URL("../expedition/ExpeditionMap.tsx", import.meta.url), "utf8");
const marks = readFileSync(new URL("../expedition/expedition-marks.ts", import.meta.url), "utf8");
const app = readFileSync(new URL("../../../App.tsx", import.meta.url), "utf8");
const shell = readFileSync(new URL("../shell-base.ts", import.meta.url), "utf8");

test("LIVE and DEMO share the expedition route; dock and rail stay unsaturated", () => {
  assert.match(app, /path="expedition"/);
  assert.match(app, /ExpeditionPage/);
  assert.match(app, /soma2Pages/);
  assert.match(shell, /path: "\/expedition"/);
  assert.match(shell, /id: "expedicion"/);
  assert.match(shell, /desktop: false/);
  assert.match(shell, /more: true/);
  assert.equal(esCommon.shell.expedition, "Expedición");
  assert.equal(enCommon.shell.expedition, "Expedition");
  assert.equal(desktopRailKeepsFivePlus(shell), true);
});

function desktopRailKeepsFivePlus(source: string): boolean {
  return source.includes('id: "expedicion"') && source.includes("mobile: false");
}

test("page composes existing hooks and never writes XP or medals", () => {
  assert.match(page, /useProgress/);
  assert.match(page, /useMissions/);
  assert.match(page, /useLiveAchievements/);
  assert.match(page, /useTemporalMilestones/);
  assert.match(page, /buildExpeditionBoard/);
  assert.match(page, /base === "\/preview"/);
  assert.match(page, /base === "\/app" && Boolean\(user\)/);
  assert.equal(page.includes("patchEquippedTitle"), false);
  assert.equal(page.includes("postMissionAnswer"), false);
  assert.equal(page.includes("submitAnswer"), false);
  assert.equal(page.includes("awardXp"), false);
  assert.equal(page.includes("equipTitle"), false);
});

test("knowledge and perseverance stay independent selectors with real CTAs", () => {
  assert.match(page, /knowledgeRoute/);
  assert.match(page, /perseveranceRoute/);
  assert.match(page, /SegmentedControl/);
  assert.match(page, /ExpeditionMap/);
  assert.match(map, /ExpeditionTrail/);
  assert.match(page, /pickFeaturedMissions/);
  assert.match(page, /EduPlateImg/);
  assert.match(page, /nature-10.png/);
  assert.match(page, /compactPanorama/);
  assert.match(page, /pt-4 lg:pt-6/);
  assert.equal(page.includes("\n        panorama"), false);
  assert.match(page, /statsRegion/);
  assert.match(page, /selectedCatalogProgress/);
  assert.match(page, /selectedTemporalProgress/);
  assert.match(page, /grid-rows-\[2rem_1.25rem_2.5rem_0.25rem_1.35rem\]/);
  assert.match(page, /STAGE_EMBLEM_PX/);
  assert.match(page, /SpecialCategoryConsentCard/);
  assert.match(page, /\$\{base\}\/missions/);
  assert.equal(page.includes("6/12"), false);
  assert.equal(page.includes("18/48"), false);
  assert.equal(page.includes("2.840"), false);
});

test("map is an accessible node trail, not a screenshot background", () => {
  assert.match(map, /aria-pressed/);
  assert.match(map, /EXPEDITION_MAP_SRC/);
  assert.match(map, /EXPEDITION_MAP_WEBP_SRC/);
  assert.match(map, /<picture>/);
  assert.match(marks, /circularMark\("knowledge-neuroscience"\)/);
  assert.match(marks, /circularMark\("perseverance-alcohol"\)/);
  assert.match(marks, /circularMark\("perseverance-nicotine"\)/);
  assert.match(marks, /circularMark\("perseverance-cannabis"\)/);
  assert.match(marks, /circularMark\("perseverance-cocaine"\)/);
  assert.match(marks, /circularMark\("perseverance-caffeine"\)/);
  assert.match(marks, /\$\{fileStem\}-192\.webp/);
  assert.match(marks, /\$\{fileStem\}-96\.webp 96w/);
  assert.match(map, /nodeMark/);
  assert.match(page, /nodeMark/);
  assert.equal(marks.includes("knowledge-neuroscience.png"), false);
  assert.equal(marks.includes("perseverance-alcohol.png"), false);
  assert.equal(map.includes("knowledge-neuroscience.png"), false);
  assert.equal(map.includes("perseverance-alcohol.png"), false);
  assert.match(map, /overflow-x-auto/);
  assert.match(map, /ArrowRight/);
  assert.match(map, /motion-reduce:.*animate-none/);
  assert.match(map, /previewFocus/);
  assert.equal(map.includes("variant"), false);
  assert.match(map, /pointer-events-none block h-auto w-full max-w-none/);
  assert.match(map, /h-full w-full object-cover/);
  assert.equal(map.includes("expedicion-3.0"), false);
  assert.equal(map.includes("expedicion-2.0"), false);
  assert.equal(page.includes("expedicion-3.0.png"), false);
  assert.equal((page.match(/<ExpeditionMap/g) ?? []).length, 1);
  assert.equal(map.includes("nodeStart"), false);
  assert.match(page, /journeyIntro/);
  assert.match(map, /mapSwipeHint/);
  assert.match(map, /min-h-11/);
  assert.match(map, /revealKey/);
  assert.match(page, /useLayoutEffect/);
  assert.match(page, /handleSelect/);
  assert.equal(map.includes("scrollIntoView"), false);
});

test("empty and active-use copy exists in ES/EN without guilt", () => {
  assert.match(esExpedition.statusActiveUse, /no los inicios de sesión/);
  assert.match(enExpedition.statusActiveUse, /not app logins/);
  assert.match(esExpedition.nextGoalEmptyComplete, /continúa/);
  assert.match(enExpedition.nextGoalEmptyComplete, /continues/);
  assert.equal(esExpedition.pageTitle, "Tu expedición personal");
  assert.equal(enExpedition.pageTitle, "Your personal expedition");
  assert.equal(JSON.stringify(esExpedition).includes("6/12"), false);
  assert.equal(JSON.stringify(enExpedition).includes("6/12"), false);
});
