import assert from "node:assert/strict";
import { test } from "node:test";
import type { FeedbackItem } from "@soma/shared-types";
import {
  appendFeedbackPage,
  parseFeedbackItem,
  parseFeedbackList,
  prependFeedbackItem,
  publicFeedbackKeys,
  toCreateFeedbackRequest,
  validateFeedbackDraft,
} from "./feedback-model.ts";

const BODY = "The save button does nothing after I write a note.";

const item: FeedbackItem = {
  id: "fb-1",
  category: "bug",
  title: "Save fails",
  body: BODY,
  status: "open",
  createdAt: "2026-10-29T12:00:00.000Z",
  updatedAt: "2026-10-29T12:00:00.000Z",
};

test("validateFeedbackDraft checks category and grapheme lengths after trim", () => {
  assert.deepEqual(
    validateFeedbackDraft({ category: null, title: "  Hi  ", body: "short" }),
    ["category", "title", "body"],
  );
  assert.deepEqual(
    validateFeedbackDraft({
      category: "bug",
      title: "  Save fails  ",
      body: `  ${BODY}  `,
    }),
    [],
  );
});

test("toCreateFeedbackRequest trims and rejects extra-ready invalid drafts", () => {
  assert.equal(
    toCreateFeedbackRequest({ category: "feature" as never, title: "Save", body: BODY }),
    null,
  );
  assert.deepEqual(
    toCreateFeedbackRequest({
      category: "suggestion",
      title: "  Dark mode  ",
      body: `  ${BODY}  `,
    }),
    { category: "suggestion", title: "Dark mode", body: BODY },
  );
});

test("parseFeedbackItem drops internal fields from the public shape", () => {
  const parsed = parseFeedbackItem({
    ...item,
    userId: "user-a",
    fingerprint: "a".repeat(64),
  });
  assert.ok(parsed);
  assert.deepEqual(publicFeedbackKeys(parsed!), [
    "id",
    "category",
    "title",
    "body",
    "status",
    "createdAt",
    "updatedAt",
  ]);
  assert.equal("userId" in parsed!, false);
  assert.equal("fingerprint" in parsed!, false);
  assert.equal(parseFeedbackItem({ ...item, status: "pending" }), null);
});

test("list parsing, prepend and pagination append keep unique ids", () => {
  const page = parseFeedbackList({
    items: [item],
    nextCursor: "cursor-2",
  });
  assert.equal(page?.nextCursor, "cursor-2");
  const second = { ...item, id: "fb-2", title: "Later" };
  assert.deepEqual(appendFeedbackPage([item], [item, second]).map((row) => row.id), [
    "fb-1",
    "fb-2",
  ]);
  assert.deepEqual(prependFeedbackItem([second], item).map((row) => row.id), [
    "fb-1",
    "fb-2",
  ]);
});
