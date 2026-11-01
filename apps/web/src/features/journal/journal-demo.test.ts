import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { JOURNAL_MILESTONE_KIND_IDS } from "@soma/shared-types";
import enJournal from "../../i18n/locales/en/journal.json" with { type: "json" };
import esJournal from "../../i18n/locales/es/journal.json" with { type: "json" };
import {
  buildJournalDemoEntries,
  buildJournalDemoMilestones,
  presentJournalDemoEntries,
  presentJournalDemoMilestones,
  relocalizeJournalDemoEntries,
  relocalizeJournalDemoMilestones,
} from "./journal-demo.js";

type DemoBundle = {
  demo: {
    entries: Record<string, { title?: string; body: string }>;
    milestones: Record<string, string>;
  };
};

const es = esJournal as DemoBundle;
const en = enJournal as DemoBundle;

function copyFrom(
  bundle: DemoBundle,
): (key: string, options?: { defaultValue?: string }) => string {
  return (key, options) => {
    const parts = key.split(".");
    if (parts[0] !== "demo") return options?.defaultValue ?? key;
    if (parts[1] === "entries") {
      const id = parts[2];
      const field = parts[3] as "title" | "body";
      return bundle.demo.entries[id]?.[field] ?? options?.defaultValue ?? key;
    }
    if (parts[1] === "milestones") {
      const kind = parts[2];
      return bundle.demo.milestones[kind] ?? options?.defaultValue ?? key;
    }
    return options?.defaultValue ?? key;
  };
}

test("DEMO journal samples never call the journal HTTP API", () => {
  const demo = readFileSync(new URL("./journal-demo.ts", import.meta.url), "utf8");
  assert.equal(demo.includes("apiRequest"), false);
  assert.equal(demo.includes("/me/journal"), false);
});

test("ES and EN DEMO journal copy cover every sample id and milestone kind", () => {
  const now = new Date("2026-11-01T12:00:00.000Z");
  const entries = buildJournalDemoEntries(now);
  const milestones = buildJournalDemoMilestones(now);

  for (const row of entries) {
    assert.ok(es.demo.entries[row.id], row.id);
    assert.ok(en.demo.entries[row.id], row.id);
    assert.equal(typeof es.demo.entries[row.id].body, "string");
    assert.equal(typeof en.demo.entries[row.id].body, "string");
    if (row.title) {
      assert.equal(typeof es.demo.entries[row.id].title, "string");
      assert.equal(typeof en.demo.entries[row.id].title, "string");
    } else {
      assert.equal(es.demo.entries[row.id].title, undefined);
      assert.equal(en.demo.entries[row.id].title, undefined);
    }
  }

  assert.deepEqual(Object.keys(es.demo.entries).sort(), Object.keys(en.demo.entries).sort());
  assert.deepEqual(Object.keys(es.demo.milestones).sort(), [...JOURNAL_MILESTONE_KIND_IDS].sort());
  assert.deepEqual(Object.keys(en.demo.milestones).sort(), [...JOURNAL_MILESTONE_KIND_IDS].sort());
  assert.equal(milestones.length, JOURNAL_MILESTONE_KIND_IDS.length);
});

test("presenting DEMO journal copy switches ES and EN without changing ids or dates", () => {
  const now = new Date("2026-11-01T12:00:00.000Z");
  const esRows = presentJournalDemoEntries(copyFrom(es), now);
  const enRows = presentJournalDemoEntries(copyFrom(en), now);
  const firstEs = esRows.find((row) => row.id === "demo-journal-1");
  const firstEn = enRows.find((row) => row.id === "demo-journal-1");

  assert.ok(firstEs);
  assert.ok(firstEn);
  assert.equal(firstEs.title, "Un día más cerca");
  assert.equal(firstEn.title, "One day closer");
  assert.match(firstEs.body ?? "", /tranquil/);
  assert.match(firstEn.body ?? "", /calmer/);
  assert.equal(firstEs.occurredOn, firstEn.occurredOn);
  assert.equal(firstEs.id, firstEn.id);
  assert.notEqual(firstEs.title, firstEn.title);

  const esMarks = presentJournalDemoMilestones(copyFrom(es), now);
  const enMarks = presentJournalDemoMilestones(copyFrom(en), now);
  assert.equal(esMarks[0]?.kind, enMarks[0]?.kind);
  assert.notEqual(esMarks[0]?.note, enMarks[0]?.note);
  assert.match(enMarks[0]?.note ?? "", /clarity/i);
});

test("JournalPage relocalizes DEMO copy when the interface language changes", () => {
  const page = readFileSync(
    new URL("../recovery-dashboard/pages/JournalPage.tsx", import.meta.url),
    "utf8",
  );
  assert.match(page, /relocalizeJournalDemoEntries/);
  assert.match(page, /relocalizeJournalDemoMilestones/);
  assert.match(page, /i18n\.language/);
  assert.doesNotMatch(page, /setEntries\(\[\.\.\.JOURNAL_DEMO_ENTRIES\]\)/);
});

test("deleted DEMO sample stays gone after a language relocalize", () => {
  const now = new Date("2026-11-01T12:00:00.000Z");
  const esRows = presentJournalDemoEntries(copyFrom(es), now);
  const afterDelete = esRows.filter((row) => row.id !== "demo-journal-1");
  const created = {
    ...esRows[0],
    id: "demo-local-created",
    title: "Nota propia",
    body: "Creada en la sesión.",
  };
  const session = [...afterDelete, created];
  const enSeed = presentJournalDemoEntries(copyFrom(en), now);
  const next = relocalizeJournalDemoEntries(session, enSeed);

  assert.equal(next.some((row) => row.id === "demo-journal-1"), false);
  assert.equal(next.some((row) => row.id === "demo-journal-1b"), true);
  const morning = next.find((row) => row.id === "demo-journal-1b");
  assert.equal(morning?.title, "In the morning");
  const own = next.find((row) => row.id === "demo-local-created");
  assert.equal(own?.title, "Nota propia");
  assert.equal(own?.body, "Creada en la sesión.");
  assert.equal(next.length, session.length);
});

test("deleted DEMO milestone stays gone after a language relocalize", () => {
  const now = new Date("2026-11-01T12:00:00.000Z");
  const esMarks = presentJournalDemoMilestones(copyFrom(es), now);
  const removedId = esMarks[0]?.id;
  assert.ok(removedId);
  const afterDelete = esMarks.filter((row) => row.id !== removedId);
  const enSeed = presentJournalDemoMilestones(copyFrom(en), now);
  const next = relocalizeJournalDemoMilestones(afterDelete, enSeed);
  assert.equal(next.some((row) => row.id === removedId), false);
  assert.equal(next.length, afterDelete.length);
  assert.notEqual(next[0]?.note, afterDelete[0]?.note);
});
