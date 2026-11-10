import { journalCreateCanonicalJson } from "@soma/shared-types";
import type { JournalEntryWrite } from "./journal-model.js";

const STORAGE_PREFIX = "soma.journal.createOp.";

export type JournalCreatePendingOp = {
  key: string;
  hash: string;
};

function storageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

export function newJournalCreateOpId(): string {
  return crypto.randomUUID();
}

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export async function journalCreateContentHash(
  draft: JournalEntryWrite,
): Promise<string> {
  return sha256Hex(journalCreateCanonicalJson(draft));
}

export function readPendingJournalCreateOp(
  userId: string,
): JournalCreatePendingOp | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(storageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof (parsed as JournalCreatePendingOp).key !== "string" ||
      typeof (parsed as JournalCreatePendingOp).hash !== "string"
    ) {
      return null;
    }
    return parsed as JournalCreatePendingOp;
  } catch {
    return null;
  }
}

export function persistPendingJournalCreateOp(
  userId: string,
  pending: JournalCreatePendingOp,
): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(storageKey(userId), JSON.stringify(pending));
}

export function clearPendingJournalCreateOp(userId: string): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(storageKey(userId));
}

/**
 * Reuse the in-memory key for retries of the same sheet.
 * After reload, reuse sessionStorage only when the canonical payload matches.
 * Title/body are not stored — only UUID + canonical JSON fingerprint.
 */
export async function resolveJournalCreateOpId(input: {
  userId: string;
  draft: JournalEntryWrite;
  inMemoryKey: string | null;
  lastHash: string | null;
}): Promise<{ key: string; hash: string }> {
  const hash = await journalCreateContentHash(input.draft);
  if (input.inMemoryKey && input.lastHash === hash) {
    persistPendingJournalCreateOp(input.userId, {
      key: input.inMemoryKey,
      hash,
    });
    return { key: input.inMemoryKey, hash };
  }
  if (input.inMemoryKey && input.lastHash && input.lastHash !== hash) {
    const key = newJournalCreateOpId();
    persistPendingJournalCreateOp(input.userId, { key, hash });
    return { key, hash };
  }
  const pending = readPendingJournalCreateOp(input.userId);
  if (pending && pending.hash === hash) {
    return { key: pending.key, hash };
  }
  const key = newJournalCreateOpId();
  persistPendingJournalCreateOp(input.userId, { key, hash });
  return { key, hash };
}
