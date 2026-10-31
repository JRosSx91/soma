import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  FEEDBACK_BODY_MAX,
  FEEDBACK_BODY_MIN,
  FEEDBACK_CATEGORY_IDS,
  FEEDBACK_DUPLICATE_WINDOW_MS,
  FEEDBACK_STATUS_IDS,
  FEEDBACK_TITLE_MAX,
  FEEDBACK_TITLE_MIN,
  feedbackDuplicateKey,
  isCreateFeedbackRequest,
  isFeedbackBodyLength,
  isFeedbackCategoryId,
  isFeedbackStatusId,
  isFeedbackTitleLength,
  normalizeFeedbackText,
} from "./feedback.js";
import { PROGRESS_XP_SOURCES } from "./progress.js";

const source = readFileSync(new URL("./feedback.ts", import.meta.url), "utf8");
const indexSource = readFileSync(new URL("./index.ts", import.meta.url), "utf8");
const progressSource = readFileSync(new URL("./progress.ts", import.meta.url), "utf8");

test("feedback contracts stay pure and omit internals from public types", () => {
  assert.equal(source.includes("@prisma"), false);
  assert.equal(source.includes("from \"react"), false);
  assert.equal(source.includes("fetch("), false);
  assert.equal(source.includes("/me/"), false);
  const itemBlock = source.slice(
    source.indexOf("export interface FeedbackItem"),
    source.indexOf("export interface FeedbackListQuery"),
  );
  const createBlock = source.slice(
    source.indexOf("export interface CreateFeedbackRequest"),
    source.indexOf("export interface FeedbackItem"),
  );
  assert.match(itemBlock, /readonly id: string/);
  assert.equal(itemBlock.includes("userId"), false);
  assert.equal(itemBlock.includes("fingerprint"), false);
  assert.equal(createBlock.includes("userId"), false);
  assert.equal(createBlock.includes("status"), false);
  assert.match(indexSource, /from "\.\/feedback\.js"/);
});

test("categories, statuses and limits match FBK-01", () => {
  assert.deepEqual([...FEEDBACK_CATEGORY_IDS], ["bug", "suggestion", "general"]);
  assert.deepEqual([...FEEDBACK_STATUS_IDS], [
    "open",
    "in_review",
    "resolved",
    "closed",
  ]);
  assert.equal(FEEDBACK_TITLE_MIN, 3);
  assert.equal(FEEDBACK_TITLE_MAX, 80);
  assert.equal(FEEDBACK_BODY_MIN, 20);
  assert.equal(FEEDBACK_BODY_MAX, 4000);
  assert.equal(FEEDBACK_DUPLICATE_WINDOW_MS, 24 * 60 * 60 * 1000);
  assert.equal(isFeedbackCategoryId("bug"), true);
  assert.equal(isFeedbackCategoryId("feature"), false);
  assert.equal(isFeedbackStatusId("in_review"), true);
  assert.equal(isFeedbackStatusId("pending"), false);
});

test("create payload validation and duplicate key ignore extra whitespace", () => {
  assert.equal(isFeedbackTitleLength("Hi"), false);
  assert.equal(isFeedbackTitleLength("Bug in login"), true);
  assert.equal(isFeedbackBodyLength("too short"), false);
  const body = "The save button does nothing after I write a note.";
  assert.equal(isFeedbackBodyLength(body), true);
  assert.equal(
    isCreateFeedbackRequest({
      category: "bug",
      title: "Save fails",
      body,
    }),
    true,
  );
  assert.equal(
    isCreateFeedbackRequest({
      category: "bug",
      title: "Save fails",
      body,
      userId: "nope",
    }),
    true,
  );
  assert.equal(normalizeFeedbackText("  Hello   world  "), "Hello world");
  assert.equal(
    feedbackDuplicateKey("suggestion", "  Dark  mode ", "Please add a dim theme option soon."),
    feedbackDuplicateKey("suggestion", "dark mode", "Please add a dim theme option soon."),
  );
});

test("feedback does not add an XP source", () => {
  assert.equal((PROGRESS_XP_SOURCES as readonly string[]).includes("feedback"), false);
  assert.equal(progressSource.includes("feedback"), false);
  assert.equal(source.includes("PROGRESS_XP"), false);
  assert.equal(source.includes("awardXp"), false);
});
