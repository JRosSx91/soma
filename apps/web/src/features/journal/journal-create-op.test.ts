import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import {
  clearPendingJournalCreateOp,
  journalCreateContentHash,
  persistPendingJournalCreateOp,
  readPendingJournalCreateOp,
  resolveJournalCreateOpId,
} from "./journal-create-op.js";
import type { JournalEntryWrite } from "./journal-model.js";

const memory = new Map<string, string>();

function installSessionStorage() {
  memory.clear();
  const sessionStorage = {
    getItem(key: string) {
      return memory.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      memory.set(key, value);
    },
    removeItem(key: string) {
      memory.delete(key);
    },
  };
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: sessionStorage,
  });
}

const draftA: JournalEntryWrite = {
  occurredOn: "2026-05-01",
  mood: 3,
  title: "Same",
};
const draftB: JournalEntryWrite = {
  occurredOn: "2026-05-01",
  mood: 4,
  title: "Other",
};

test("resolveJournalCreateOpId reuses the in-memory key for the same payload", async () => {
  installSessionStorage();
  const first = await resolveJournalCreateOpId({
    userId: "u1",
    draft: draftA,
    inMemoryKey: null,
    lastHash: null,
  });
  const retry = await resolveJournalCreateOpId({
    userId: "u1",
    draft: draftA,
    inMemoryKey: first.key,
    lastHash: first.hash,
  });
  assert.equal(retry.key, first.key);
});

test("resolveJournalCreateOpId mints a new key when the in-memory draft changes", async () => {
  installSessionStorage();
  const first = await resolveJournalCreateOpId({
    userId: "u1",
    draft: draftA,
    inMemoryKey: null,
    lastHash: null,
  });
  const changed = await resolveJournalCreateOpId({
    userId: "u1",
    draft: draftB,
    inMemoryKey: first.key,
    lastHash: first.hash,
  });
  assert.notEqual(changed.key, first.key);
});

test("resolveJournalCreateOpId reuses sessionStorage after reload only for the same fingerprint", async () => {
  installSessionStorage();
  persistPendingJournalCreateOp("u1", {
    key: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeee01",
    hash: await journalCreateContentHash(draftA),
  });
  const resumed = await resolveJournalCreateOpId({
    userId: "u1",
    draft: draftA,
    inMemoryKey: null,
    lastHash: null,
  });
  assert.equal(resumed.key, "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeee01");
  const other = await resolveJournalCreateOpId({
    userId: "u1",
    draft: draftB,
    inMemoryKey: null,
    lastHash: null,
  });
  assert.notEqual(other.key, resumed.key);
});

test("pending create ops store a SHA-256 fingerprint, not title or body", async () => {
  installSessionStorage();
  await resolveJournalCreateOpId({
    userId: "u1",
    draft: { ...draftA, body: "private recovery note" },
    inMemoryKey: null,
    lastHash: null,
  });
  const raw = memory.get("soma.journal.createOp.u1");
  assert.ok(raw);
  assert.equal(raw.includes("private recovery note"), false);
  assert.equal(raw.includes("Same"), false);
  const stored = JSON.parse(raw) as { key: string; hash: string };
  assert.match(stored.hash, /^[0-9a-f]{64}$/);
});

test("pending ops are isolated per user and can be cleared", () => {
  installSessionStorage();
  persistPendingJournalCreateOp("u1", {
    key: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeee01",
    hash: "h1",
  });
  persistPendingJournalCreateOp("u2", {
    key: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeee02",
    hash: "h2",
  });
  assert.equal(readPendingJournalCreateOp("u1")?.key.endsWith("ee01"), true);
  clearPendingJournalCreateOp("u1");
  assert.equal(readPendingJournalCreateOp("u1"), null);
  assert.equal(readPendingJournalCreateOp("u2")?.hash, "h2");
});

test("LIVE create wiring sends Idempotency-Key and DEMO does not", () => {
  const page = readFileSync(
    new URL("../recovery-dashboard/pages/JournalPage.tsx", import.meta.url),
    "utf8",
  );
  const api = readFileSync(new URL("./journal-api.ts", import.meta.url), "utf8");
  assert.match(api, /Idempotency-Key/);
  assert.match(page, /resolveJournalCreateOpId/);
  assert.match(page, /createJournalEntry\(draft,\s*\{\s*idempotencyKey/);
  assert.match(page, /clearPendingJournalCreateOp/);
  const demoBlock = page.slice(
    page.indexOf("if (demo) {"),
    page.indexOf("} else if (live)"),
  );
  assert.equal(demoBlock.includes("idempotencyKey"), false);
  assert.equal(demoBlock.includes("resolveJournalCreateOpId"), false);
  assert.match(
    page,
    /if \(editing\) return patchJournalEntry\(editing\.id, draft\)/,
  );
});
