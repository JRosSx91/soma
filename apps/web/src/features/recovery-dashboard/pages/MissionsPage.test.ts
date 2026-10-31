import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import enMissions from "../../../i18n/locales/en/missions.json" with { type: "json" };
import esMissions from "../../../i18n/locales/es/missions.json" with { type: "json" };
import enCommon from "../../../i18n/locales/en/common.json" with { type: "json" };
import esCommon from "../../../i18n/locales/es/common.json" with { type: "json" };

const page = readFileSync(new URL("./MissionsPage.tsx", import.meta.url), "utf8");
const app = readFileSync(new URL("../../../App.tsx", import.meta.url), "utf8");
const shell = readFileSync(new URL("../shell-base.ts", import.meta.url), "utf8");
const explore = readFileSync(new URL("./ExplorePage.tsx", import.meta.url), "utf8");

test("LIVE and DEMO share the missions route and shell destination", () => {
  assert.match(app, /path="missions"/);
  assert.match(app, /MissionsPage/);
  assert.match(app, /soma2Pages/);
  assert.match(shell, /path: "\/missions"/);
  assert.match(shell, /id: "misiones"/);
  assert.equal(esCommon.shell.missions, "Misiones");
  assert.equal(enCommon.shell.missions, "Missions");
  assert.match(explore, /\$\{base\}\/missions/);
});

test("page uses useMissions with LIVE /app and DEMO /preview identity", () => {
  assert.match(page, /useMissions/);
  assert.match(page, /base === "\/preview"/);
  assert.match(page, /base === "\/app" && Boolean\(user\)/);
  assert.match(page, /userId: live \? \(user\?\.id \?\? null\) : null/);
  assert.equal(page.includes("evaluateDemoAnswer"), false);
  assert.equal(page.includes("postMissionAnswer"), false);
});

test("page follows mockup sections without locked or in-progress states", () => {
  assert.match(page, /featuredTitle/);
  assert.match(page, /categoryProgressTitle/);
  assert.match(page, /allTitle/);
  assert.match(page, /ProgressBoard/);
  assert.match(page, /pickFeaturedMissions/);
  assert.match(page, /filterMissionCatalog/);
  assert.match(page, /searchMissions/);
  assert.match(page, /sortMissionCatalog/);
  assert.match(page, /missionIllustrationSrc/);
  assert.match(page, /comingSoon/);
  assert.equal(page.includes("in_progress"), false);
  assert.equal(page.includes("locked"), false);
  assert.equal(page.includes("artículos"), false);
  assert.equal(page.includes("minLevel"), false);
  assert.equal(page.includes("edu-unpublished-01"), false);
});

test("opening a mission links the educational sheet and submits through the hook", () => {
  assert.match(page, /exploreEduHref/);
  assert.match(page, /readSheet/);
  assert.match(page, /sheetUnavailable/);
  assert.match(page, /submitAnswer/);
  assert.match(page, /radiogroup/);
  assert.match(page, /type="radio"/);
  assert.match(page, /sendAnswer/);
  assert.match(page, /tryAgain/);
});

test("incorrect answers stay incomplete; correct LIVE XP is server-confirmed only", () => {
  assert.match(page, /answerIncorrect/);
  assert.match(page, /answerCorrect/);
  assert.match(page, /alreadyCompleted/);
  assert.match(page, /showXp = live && result != null && result.xpGranted > 0/);
  assert.match(page, /previewXpNote/);
  assert.equal(page.includes("+12"), false);
  assert.equal(page.includes("xpGranted: 12"), false);
  assert.match(page, /lastAnswer.missionId === openMission.id/);
});

test("load and submit errors stay separate and can be retried", () => {
  assert.match(page, /loadError/);
  assert.match(page, /catalog.reload/);
  assert.match(page, /submitError/);
  assert.match(page, /retrySubmit/);
  assert.match(page, /role="alert"/);
  assert.match(page, /aria-live="polite"/);
});

test("keyboard, focus and reduced-motion patterns are present", () => {
  assert.match(page, /previewFocus/);
  assert.match(page, /min-h-11/);
  assert.match(page, /type="button"/);
  assert.match(page, /motion-reduce:transition-none/);
  assert.match(page, /xl:grid-cols-4/);
  assert.match(page, /min-w-0/);
  assert.match(page, /nature-7\.png/);
  assert.match(page, /missionArtNeedsFrame/);
  assert.match(page, /object-cover opacity-40/);
  assert.match(page, /object-contain/);
  assert.match(page, /grid-cols-2 gap-3/);
  assert.match(page, /h-12 w-12/);
  assert.equal(page.includes("nature-2.png"), false);
  assert.match(page, /panorama/);
  assert.equal(page.includes("absolute top-3 left-3"), false);
  assert.match(page, /statusAvailable/);
  assert.match(page, /fetchPriority="high"/);
  assert.match(page, /border-dashed/);
  assert.match(page, /BookOpen/);
});

test("ES and EN page copy covers chrome without clinical claims", () => {
  assert.equal(esMissions.pageTitle, "Pequeños pasos, grandes descubrimientos.");
  assert.equal(enMissions.pageTitle, "Small steps, great discoveries.");
  assert.match(esMissions.pageQuote, /libertad/);
  assert.match(enMissions.pageQuote, /freedom/);
  assert.match(esMissions.disclaimer, /no son una valoración clínica/i);
  assert.match(enMissions.disclaimer, /not a clinical assessment/i);
  assert.match(esMissions.answerIncorrect, /Todavía no/);
  assert.match(enMissions.answerIncorrect, /Not quite/);
  assert.match(esMissions.previewXpNote, /LIVE/);
  assert.match(enMissions.xpGranted, /\{\{count\}\}/);
  assert.equal(esMissions.comingSoon, "Próximamente");
});
