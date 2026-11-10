import assert from "node:assert/strict";
import { test } from "node:test";
import { journalCreateCanonicalJson } from "@soma/shared-types";
import {
  isInvalidIdempotencyKey,
  journalCreateRequestHash,
  parseJournalIdempotencyKey,
} from "./journal-idempotency.js";
import type { CreateJournalEntryDto } from "./dto/create-journal-entry.dto.js";

const V4 = "550e8400-e29b-41d4-a716-446655440000";

test("parseJournalIdempotencyKey accepts UUID v4 and lowercases it", () => {
  assert.equal(parseJournalIdempotencyKey(undefined), undefined);
  assert.equal(parseJournalIdempotencyKey(V4.toUpperCase()), V4);
  assert.equal(isInvalidIdempotencyKey(undefined), false);
});

test("parseJournalIdempotencyKey rejects non-v4 and empty present values", () => {
  assert.equal(parseJournalIdempotencyKey(""), "");
  assert.equal(parseJournalIdempotencyKey("   "), "");
  assert.equal(parseJournalIdempotencyKey("not-a-uuid"), "");
  assert.equal(
    parseJournalIdempotencyKey("550e8400-e29b-11d4-a716-446655440000"),
    "",
  );
  assert.equal(parseJournalIdempotencyKey([V4, V4]), "");
  assert.equal(isInvalidIdempotencyKey(""), true);
});

test("journalCreateRequestHash is independent of JSON key order and tag order", () => {
  const a = {
    occurredOn: "2026-04-29",
    title: "  Hello ",
    body: "",
    mood: 3,
    emotionIds: ["grateful", "calm"],
    triggerIds: ["fatigue"],
    highlighted: true,
  } as CreateJournalEntryDto;
  const b = {
    triggerIds: ["fatigue"],
    emotionIds: ["calm", "grateful"],
    occurredOn: "2026-04-29",
    highlighted: true,
    mood: 3,
    title: "Hello",
    body: null,
  } as CreateJournalEntryDto;
  assert.equal(journalCreateCanonicalJson(a), journalCreateCanonicalJson(b));
  assert.equal(journalCreateRequestHash(a), journalCreateRequestHash(b));
  assert.match(journalCreateRequestHash(a), /^[0-9a-f]{64}$/);
});

test("journalCreateRequestHash changes when a semantic field changes", () => {
  const base = {
    occurredOn: "2026-04-29",
    mood: 3,
  } as CreateJournalEntryDto;
  const other = {
    occurredOn: "2026-04-29",
    mood: 4,
  } as CreateJournalEntryDto;
  assert.notEqual(journalCreateRequestHash(base), journalCreateRequestHash(other));
});
