import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import enFeedback from "../../../i18n/locales/en/feedback.json" with { type: "json" };
import esFeedback from "../../../i18n/locales/es/feedback.json" with { type: "json" };

const page = readFileSync(new URL("./FeedbackPage.tsx", import.meta.url), "utf8");
const app = readFileSync(new URL("../../../App.tsx", import.meta.url), "utf8");
const account = readFileSync(new URL("./AccountPage.tsx", import.meta.url), "utf8");
const shell = readFileSync(new URL("../shell-base.ts", import.meta.url), "utf8");

test("feedback page is prepared for LIVE but not routed or linked yet", () => {
  assert.match(page, /useFeedback/);
  assert.match(page, /base === "\/preview"/);
  assert.match(page, /base === "\/app" && Boolean\(user\)/);
  assert.equal(app.includes("FeedbackPage"), false);
  assert.equal(app.includes('path="feedback"'), false);
  assert.equal(shell.includes("/feedback"), false);
  assert.equal(account.includes("feedback"), false);
});

test("form renders categories, title, body, submit and history chrome", () => {
  assert.match(page, /radiogroup/);
  assert.match(page, /type="radio"/);
  assert.match(page, /FEEDBACK_CATEGORY_IDS/);
  assert.match(page, /titleLabel/);
  assert.match(page, /bodyLabel/);
  assert.match(page, /type="submit"/);
  assert.match(page, /historyTitle/);
  assert.match(page, /headline/);
  assert.match(page, /privacy/);
});

test("validation, submit, duplicate and network errors are accessible", () => {
  assert.match(page, /catalog.submit/);
  assert.match(page, /if \(catalog.submitting || demo || !live\) return/);
  assert.match(page, /errors.category/);
  assert.match(page, /errors.title/);
  assert.match(page, /errors.body/);
  assert.match(page, /errors.network/);
  assert.match(page, /role="status"/);
  assert.match(page, /role="alert"/);
  assert.match(page, /duplicate/);
  assert.match(page, /confirmation/);
  assert.match(page, /aria-invalid/);
  assert.match(page, /aria-expanded/);
});

test("history covers empty, load error, retry, pagination and description", () => {
  assert.match(page, /empty/);
  assert.match(page, /errors.load/);
  assert.match(page, /catalog.reload/);
  assert.match(page, /catalog.loadMore/);
  assert.match(page, /nextCursor/);
  assert.match(page, /expandBody/);
  assert.match(page, /item.body/);
  assert.match(page, /statuses\./);
});

test("DEMO writes are blocked; LIVE never mentions XP", () => {
  assert.match(page, /demoNotice/);
  assert.match(page, /disabled=\{catalog.submitting || demo || !live\}/);
  assert.equal(page.includes("awardXp"), false);
  assert.equal(page.includes("totalXp"), false);
  assert.equal(page.includes("/me/progress"), false);
  assert.match(page, /previewFocus/);
  assert.match(page, /min-h-11/);
  assert.match(page, /sm:grid-cols-3/);
});

test("ES and EN copy match the approved LIVE voice", () => {
  assert.equal(esFeedback.headline, "Tu voz también forma parte de Soma");
  assert.equal(esFeedback.historyTitle, "Tus mensajes");
  assert.equal(esFeedback.categories.bug, "Error");
  assert.equal(esFeedback.categories.suggestion, "Sugerencia");
  assert.equal(esFeedback.categories.general, "Comentario general");
  assert.match(esFeedback.intro, /ayudan a mejorar/i);
  assert.match(enFeedback.intro, /help us improve/i);
  assert.match(esFeedback.privacy, /no es una ficha clínica/i);
  assert.match(esFeedback.intro, /no podemos prometer/i);
  assert.equal(esFeedback.submit.includes("médic"), false);
});
