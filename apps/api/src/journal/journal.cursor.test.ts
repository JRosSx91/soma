import assert from "node:assert/strict";
import { test } from "node:test";
import { BadRequestException } from "@nestjs/common";
import { decodeJournalCursor, encodeJournalCursor } from "./journal.cursor.js";

test("journal cursor round-trips the three sort fields", () => {
  const cursor = {
    occurredOn: "2026-04-29",
    createdAt: "2026-04-29T10:00:00.000Z",
    id: "clxxxxxxxx",
  };
  const decoded = decodeJournalCursor(encodeJournalCursor(cursor));
  assert.deepEqual(decoded, cursor);
});

test("journal cursor rejects malformed payloads", () => {
  assert.throws(() => decodeJournalCursor("%%%"), BadRequestException);
  assert.throws(
    () =>
      decodeJournalCursor(
        Buffer.from(JSON.stringify({ occurredOn: "nope" }), "utf8").toString(
          "base64url",
        ),
      ),
    BadRequestException,
  );
});
