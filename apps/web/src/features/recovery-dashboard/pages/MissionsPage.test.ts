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

test("catalog shows six published missions, states and categories", () => {
  assert.match(page, /MISSION_CATEGORY_IDS/);
  assert.match(page, /statusAvailable/);
  assert.match(page, /statusCompleted/);
  assert.match(page, /filterAll/);
  assert.match(page, /futureCategory/);
  assert.match(page, /FUTURE_MISSION_CATEGORY_IDS/);
  assert.match(page, /completedSummary/);
  assert.equal(page.includes("edu-unpublished-01"), false);
  assert.equal(page.includes("minLevel"), false);
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
  assert.equal(page.includes("setState(\"completed\")"), false);
});

test("keyboard, focus and reduced-motion patterns are present", () => {
  assert.match(page, /previewFocus/);
  assert.match(page, /min-h-11/);
  assert.match(page, /type="button"/);
  assert.match(page, /motion-reduce:transition-none/);
  assert.match(page, /sm:grid-cols-2/);
  assert.match(page, /min-w-0/);
  assert.equal(page.includes("nature-7"), false);
});

test("ES and EN page copy covers chrome without clinical claims", () => {
  assert.equal(esMissions.pageTitle, "Misiones educativas");
  assert.equal(enMissions.pageTitle, "Educational missions");
  assert.match(esMissions.pageDescription, /No describen tu cerebro/);
  assert.match(enMissions.pageDescription, /do not describe your brain/);
  assert.match(esMissions.answerIncorrect, /Todavía no/);
  assert.match(enMissions.answerIncorrect, /Not quite/);
  assert.match(esMissions.previewXpNote, /LIVE/);
  assert.match(enMissions.xpGranted, /\{\{count\}\}/);
});
