import assert from "node:assert/strict";
import { test } from "node:test";
import { BadRequestException } from "@nestjs/common";
import {
  decodeFeedbackCursor,
  encodeFeedbackCursor,
} from "./feedback.cursor.js";

test("feedback cursor round-trips createdAt and id", () => {
  const cursor = { createdAt: "2026-10-29T12:00:00.000Z", id: "clxxxxxxxx" };
  assert.deepEqual(decodeFeedbackCursor(encodeFeedbackCursor(cursor)), cursor);
});

test("feedback cursor rejects malformed payloads", () => {
  assert.throws(() => decodeFeedbackCursor("%%%"), BadRequestException);
  assert.throws(
    () =>
      decodeFeedbackCursor(
        Buffer.from(JSON.stringify({ id: "only" }), "utf8").toString("base64url"),
      ),
    BadRequestException,
  );
});
