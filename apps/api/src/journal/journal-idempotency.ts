import { createHash } from "node:crypto";
import { journalCreateCanonicalJson } from "@soma/shared-types";
import type { CreateJournalEntryDto } from "./dto/create-journal-entry.dto.js";

/** UUID v4, case-insensitive. */
const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const INVALID_IDEMPOTENCY_KEY = "INVALID_IDEMPOTENCY_KEY";
export const IDEMPOTENCY_KEY_REUSED = "IDEMPOTENCY_KEY_REUSED";

export function parseJournalIdempotencyKey(
  raw: string | string[] | undefined,
): string | undefined {
  if (raw === undefined) return undefined;
  if (Array.isArray(raw)) {
    if (raw.length === 0) return undefined;
    if (raw.length > 1) return "";
    return parseJournalIdempotencyKey(raw[0]);
  }
  const trimmed = raw.trim();
  if (trimmed.length === 0) return "";
  if (!UUID_V4.test(trimmed)) return "";
  return trimmed.toLowerCase();
}

export function isInvalidIdempotencyKey(parsed: string | undefined): boolean {
  return parsed === "";
}

export function journalCreateRequestHash(dto: CreateJournalEntryDto): string {
  return createHash("sha256")
    .update(journalCreateCanonicalJson(dto), "utf8")
    .digest("hex");
}
