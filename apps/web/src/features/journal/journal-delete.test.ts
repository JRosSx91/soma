import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { runDeleteJournalEntry } from "./journal-delete.js";

test("LIVE delete waits for the remote call and returns ok", async () => {
  const calls: string[] = [];
  const outcome = await runDeleteJournalEntry({
    live: true,
    demo: false,
    id: "entry-1",
    inFlight: { current: false },
    deleteRemote: async (id) => {
      calls.push(id);
    },
  });
  assert.equal(outcome, "ok");
  assert.deepEqual(calls, ["entry-1"]);
});

test("LIVE delete error does not report success", async () => {
  const outcome = await runDeleteJournalEntry({
    live: true,
    demo: false,
    id: "entry-1",
    inFlight: { current: false },
    deleteRemote: async () => {
      throw new Error("network");
    },
  });
  assert.equal(outcome, "error");
});

test("in-flight delete is ignored so the remote runs once", async () => {
  let started = 0;
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const inFlight = { current: false };
  const first = runDeleteJournalEntry({
    live: true,
    demo: false,
    id: "entry-1",
    inFlight,
    deleteRemote: async () => {
      started += 1;
      await gate;
    },
  });
  while (started === 0) await Promise.resolve();
  const second = await runDeleteJournalEntry({
    live: true,
    demo: false,
    id: "entry-1",
    inFlight,
    deleteRemote: async () => {
      started += 1;
    },
  });
  assert.equal(second, "busy");
  release();
  assert.equal(await first, "ok");
  assert.equal(started, 1);
});

test("DEMO delete succeeds without calling the API", async () => {
  let called = 0;
  const outcome = await runDeleteJournalEntry({
    live: false,
    demo: true,
    id: "demo-1",
    inFlight: { current: false },
    deleteRemote: async () => {
      called += 1;
    },
  });
  assert.equal(outcome, "ok");
  assert.equal(called, 0);
});

test("journal delete client stays on DELETE /me/journal/:id", () => {
  const api = readFileSync(new URL("./journal-api.ts", import.meta.url), "utf8");
  const page = readFileSync(
    new URL("../recovery-dashboard/pages/JournalPage.tsx", import.meta.url),
    "utf8",
  );
  const demo = readFileSync(new URL("./journal-demo.ts", import.meta.url), "utf8");
  assert.match(api, /export function deleteJournalEntry/);
  assert.match(api, /\/me\/journal\/\$\{id\}/);
  assert.match(api, /method: "DELETE"/);
  assert.match(page, /runDeleteJournalEntry/);
  assert.match(page, /deleteJournalEntry/);
  assert.match(page, /rows\.filter\(\(row\) => row\.id !== id\)/);
  assert.match(page, /form\.deleteConfirm/);
  assert.match(page, /role="alertdialog"/);
  assert.equal(demo.includes("deleteJournalEntry"), false);
  assert.equal(demo.includes("/me/journal"), false);
});
