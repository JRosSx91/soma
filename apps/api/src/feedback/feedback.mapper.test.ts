import assert from "node:assert/strict";
import { test } from "node:test";
import type { FeedbackReport } from "@prisma/client";
import { toFeedbackItem } from "./feedback.mapper.js";

test("toFeedbackItem omits userId and fingerprint", () => {
  const row = {
    id: "fb-1",
    userId: "user-a",
    category: "bug",
    title: "Save fails",
    body: "The save button does nothing after I write a note.",
    status: "open",
    fingerprint: "a".repeat(64),
    createdAt: new Date("2026-10-29T12:00:00.000Z"),
    updatedAt: new Date("2026-10-29T12:00:00.000Z"),
  } as FeedbackReport;
  const item = toFeedbackItem(row);
  assert.equal(item.id, "fb-1");
  assert.equal(item.category, "bug");
  assert.equal(item.status, "open");
  assert.equal("userId" in item, false);
  assert.equal("fingerprint" in item, false);
  assert.equal(JSON.stringify(item).includes("user-a"), false);
  assert.equal(JSON.stringify(item).includes("aaaa"), false);
});
