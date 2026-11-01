import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { ApiError } from "../auth/client/api.js";
import enJournal from "../../i18n/locales/en/journal.json" with { type: "json" };
import esJournal from "../../i18n/locales/es/journal.json" with { type: "json" };
import {
  beginExclusive,
  classifyJournalWriteFailure,
  endExclusive,
  runJournalLiveSave,
} from "./journal-live-save.js";

const page = readFileSync(
  new URL("../recovery-dashboard/pages/JournalPage.tsx", import.meta.url),
  "utf8",
);
const form = readFileSync(new URL("./JournalEntryForm.tsx", import.meta.url), "utf8");
const demo = readFileSync(new URL("./journal-demo.ts", import.meta.url), "utf8");

test("POST 201 plus calendar refresh failure is one write without saveError", async () => {
  let writes = 0;
  const outcome = await runJournalLiveSave({
    write: async () => {
      writes += 1;
      return { id: "entry-1" };
    },
    refresh: async () => {
      throw new Error("calendar");
    },
  });
  assert.equal(writes, 1);
  assert.equal(outcome.write, "ok");
  assert.equal(outcome.refresh, "failed");
  assert.equal(outcome.closeSheet, true);
  assert.equal(outcome.entry?.id, "entry-1");
  assert.match(page, /form\.refreshError/);
  assert.doesNotMatch(
    page,
    /else await createJournalEntry\(draft\);\s*await loadLive\(\);/s,
  );
});

test("POST 201 plus history refresh failure closes the sheet with a refresh warning", async () => {
  const outcome = await runJournalLiveSave({
    write: async () => ({ id: "entry-2" }),
    refresh: async () => {
      throw new Error("history");
    },
  });
  assert.equal(outcome.write, "ok");
  assert.equal(outcome.closeSheet, true);
  assert.equal(outcome.refresh, "failed");
  assert.match(page, /setSheet\(null\)/);
  assert.match(page, /setRefreshError\(result\.refresh === "failed"\)/);
  assert.match(page, /\{t\("form\.refreshError"\)\}/);
  assert.doesNotMatch(page, /setRefreshError\(t\(/);
  assert.equal(
    enJournal.form.refreshError,
    "Saved. The journal view could not be updated. Retry without creating another entry.",
  );
  assert.equal(
    esJournal.form.refreshError,
    "Guardado. No se ha podido actualizar la vista del diario. Reintenta sin crear otra entrada.",
  );
  assert.equal(enJournal.form.refreshRetry, "Update view");
  assert.equal(esJournal.form.refreshRetry, "Actualizar vista");
});

test("POST 4xx keeps the form and reports a real save error", async () => {
  let refreshed = false;
  const outcome = await runJournalLiveSave({
    write: async () => {
      throw new ApiError(400, "At least one significant field is required");
    },
    refresh: async () => {
      refreshed = true;
    },
  });
  assert.equal(outcome.write, "http");
  assert.equal(outcome.closeSheet, false);
  assert.equal(outcome.refresh, "skipped");
  assert.equal(refreshed, false);
  assert.equal(classifyJournalWriteFailure(new ApiError(403, "forbidden")), "http");
  assert.match(page, /form\.saveError/);
});

test("double submit while a write is pending issues a single POST", async () => {
  const lock = { current: false };
  let writes = 0;
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });

  async function attempt() {
    if (!beginExclusive(lock)) return "busy";
    try {
      return await runJournalLiveSave({
        write: async () => {
          writes += 1;
          await gate;
          return { id: "entry-3" };
        },
        refresh: async () => {},
      });
    } finally {
      endExclusive(lock);
    }
  }

  const first = attempt();
  const second = attempt();
  release();
  const [a, b] = await Promise.all([first, second]);
  assert.equal(writes, 1);
  assert.equal(a === "busy" || b === "busy", true);
  assert.match(page, /beginExclusive\(entrySaveLock\)/);
  assert.match(form, /disabled=\{saving\}/);
});

test("confirmed save keeps highlighted, learning and boredom on the write payload", () => {
  assert.match(page, /createJournalEntry\(draft\)/);
  assert.match(page, /patchJournalEntry\(editing\.id, draft\)/);
  assert.match(form, /highlighted,/);
  assert.match(form, /learning,/);
  assert.match(form, /triggerIds,/);
  assert.match(form, /JOURNAL_TRIGGER_IDS/);
});

test("editing an existing LIVE entry still PATCHes and does not POST", () => {
  assert.match(page, /if \(editing\) return patchJournalEntry\(editing\.id, draft\)/);
  assert.match(page, /return createJournalEntry\(draft\)/);
  assert.doesNotMatch(page, /createJournalEntry\(draft\).*patchJournalEntry/s);
});

test("DEMO journal save never calls LIVE journal endpoints", () => {
  assert.equal(demo.includes("/me/journal"), false);
  assert.equal(demo.includes("createJournalEntry"), false);
  assert.match(page, /if \(demo\) \{/);
  const demoBlock = page.slice(page.indexOf("if (demo) {"), page.indexOf("} else if (live)"));
  assert.equal(demoBlock.includes("createJournalEntry"), false);
  assert.equal(demoBlock.includes("patchJournalEntry"), false);
  assert.equal(demoBlock.includes("runJournalLiveSave"), false);
});

test("network failure after an unknown persist result is recovery, not a second POST", async () => {
  let refreshed = false;
  const outcome = await runJournalLiveSave({
    write: async () => {
      throw new TypeError("Failed to fetch");
    },
    refresh: async () => {
      refreshed = true;
    },
  });
  assert.equal(outcome.write, "uncertain");
  assert.equal(outcome.closeSheet, false);
  assert.equal(outcome.refresh, "skipped");
  assert.equal(refreshed, false);
  assert.equal(classifyJournalWriteFailure(new TypeError("network")), "uncertain");
  assert.equal(
    enJournal.form.saveUnconfirmed,
    "We could not confirm whether the entry was saved. Refresh the journal before creating another.",
  );
  assert.equal(
    esJournal.form.saveUnconfirmed,
    "No hemos podido confirmar si la entrada se guardó. Actualiza el diario antes de crear otra.",
  );
  assert.match(page, /form\.saveUnconfirmed/);
  assert.match(page, /saveUnconfirmed \? handleUnconfirmedCheck/);
});

test("successful write plus monthly refresh clears the refresh warning", async () => {
  const outcome = await runJournalLiveSave({
    write: async () => ({ id: "entry-4" }),
    refresh: async () => {},
  });
  assert.equal(outcome.write, "ok");
  assert.equal(outcome.refresh, "ok");
  assert.match(page, /fetchJournalMonthEntries\(calYear, calMonth\)/);
  assert.match(page, /setRefreshError\(result\.refresh === "failed"\)/);
  assert.match(page, /setRefreshError\(false\)/);
});

test("refresh warning keeps an i18n key so EN and ES switch with the UI", () => {
  assert.match(page, /useState\(false\)/);
  assert.match(
    page,
    /<p className="text-sm text-soma-ink-secondary">\{t\("form\.refreshError"\)\}<\/p>/,
  );
  assert.match(page, /\{t\("form\.refreshRetry"\)\}/);
  assert.doesNotMatch(
    page,
    /<p className="text-sm text-soma-ink-secondary">\{refreshError\}<\/p>/,
  );
  assert.equal(
    enJournal.form.refreshError !== esJournal.form.refreshError,
    true,
  );
});

test("Actualizar vista only drops the warning after a successful refresh", () => {
  assert.match(page, /async function retryJournalRefresh/);
  const retry = page.slice(
    page.indexOf("async function retryJournalRefresh"),
    page.indexOf("async function handleUnconfirmedCheck"),
  );
  assert.match(retry, /setRefreshError\(false\)/);
  assert.match(retry, /await refreshLiveViewsAfterWrite\(\)/);
  assert.match(retry, /setRefreshError\(true\)/);
});
