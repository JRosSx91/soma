import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import enFeedback from "../../../i18n/locales/en/feedback.json" with { type: "json" };
import esFeedback from "../../../i18n/locales/es/feedback.json" with { type: "json" };

const page = readFileSync(new URL("./FeedbackPage.tsx", import.meta.url), "utf8");
const app = readFileSync(new URL("../../../App.tsx", import.meta.url), "utf8");
const account = readFileSync(new URL("./AccountPage.tsx", import.meta.url), "utf8");
const menu = readFileSync(new URL("../components/AccountMenu.tsx", import.meta.url), "utf8");
const shell = readFileSync(new URL("../shell-base.ts", import.meta.url), "utf8");
const mobile = readFileSync(
  new URL("../components/PreviewMobileNav.tsx", import.meta.url),
  "utf8",
);

test("LIVE and DEMO share the feedback route under both shells", () => {
  assert.match(app, /path="feedback"/);
  assert.match(app, /FeedbackPage/);
  assert.match(app, /soma2Pages/);
  assert.match(shell, /path: "\/feedback"/);
  assert.match(shell, /id: "ayuda"/);
  assert.match(shell, /desktop: false/);
  assert.match(shell, /mobile: false/);
  assert.match(shell, /more: true/);
});

test("navigation exposes Más and Account links without a bottom-nav slot", () => {
  assert.match(menu, /\$\{base\}\/feedback/);
  assert.match(menu, /menuFeedback/);
  assert.match(account, /\$\{base\}\/feedback/);
  assert.match(mobile, /mobileShellSections/);
  assert.equal(mobile.includes("grid-cols-5"), false);
  assert.equal(mobile.includes("fixed inset-x-0"), false);
  assert.match(mobile, /safe-area-inset-bottom/);
});

test("form renders categories, title, body, submit and history chrome", () => {
  assert.match(page, /useFeedback/);
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
  assert.match(page, /if \(catalog.submitting\) return/);
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

test("DEMO can submit locally; LIVE never mentions XP", () => {
  assert.match(page, /demoNotice/);
  assert.match(page, /disabled=\{catalog.submitting\}/);
  assert.equal(page.includes("localStorage"), false);
  assert.equal(page.includes("sessionStorage"), false);
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
