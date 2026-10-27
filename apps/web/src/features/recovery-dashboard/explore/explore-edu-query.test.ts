import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { publishedExploreEduSheets } from "./explore-edu.ts";
import {
  EXPLORE_EDU_QUERY_KEY,
  exploreEduHref,
  exploreEduTargetFromSheetId,
  resolveExploreEduQueryParam,
  writeExploreEduSearchParams,
} from "./explore-edu-query.ts";

const page = readFileSync(new URL("../pages/ExplorePage.tsx", import.meta.url), "utf8");
const summary = readFileSync(new URL("../components/OrganSheetSummary.tsx", import.meta.url), "utf8");
const sheet = readFileSync(new URL("../components/DetailSheet.tsx", import.meta.url), "utf8");

test("edu query resolves the fourteen published sheets and rejects invalid ids", () => {
  assert.equal(EXPLORE_EDU_QUERY_KEY, "edu");
  assert.equal(publishedExploreEduSheets.length, 14);
  for (const id of publishedExploreEduSheets) {
    assert.equal(resolveExploreEduQueryParam(id), id);
    assert.ok(exploreEduTargetFromSheetId(id));
    assert.equal(exploreEduHref("/preview", id), `/preview/explore?edu=${id}`);
    assert.equal(exploreEduHref("/app", id), `/app/explore?edu=${id}`);
  }
  assert.equal(resolveExploreEduQueryParam(null), null);
  assert.equal(resolveExploreEduQueryParam(""), null);
  assert.equal(resolveExploreEduQueryParam("   "), null);
  assert.equal(resolveExploreEduQueryParam("dopamine "), null);
  assert.equal(resolveExploreEduQueryParam("DOPAMINE"), null);
  assert.equal(resolveExploreEduQueryParam("not-an-article"), null);
  assert.equal(resolveExploreEduQueryParam("process"), null);
  assert.equal(exploreEduHref("/preview", "dopamine"), "/preview/explore?edu=dopamine");
});

test("writing edu preserves sibling query params and drops unpublished values", () => {
  const current = new URLSearchParams("foo=1&edu=dopamine&bar=2");
  const cleared = writeExploreEduSearchParams(current, null);
  assert.equal(cleared.get("edu"), null);
  assert.equal(cleared.get("foo"), "1");
  assert.equal(cleared.get("bar"), "2");
  const next = writeExploreEduSearchParams(cleared, "metabolism");
  assert.equal(next.get("edu"), "metabolism");
  assert.equal(next.get("foo"), "1");
  const ignored = writeExploreEduSearchParams(next, "not-published" as never);
  assert.equal(ignored.get("edu"), null);
  assert.equal(ignored.get("foo"), "1");
});

test("ExplorePage opens articles from the edu query with replace history", () => {
  assert.match(page, /useSearchParams/);
  assert.match(page, /resolveExploreEduQueryParam/);
  assert.match(page, /writeExploreEduSearchParams/);
  assert.match(page, /replace: true/);
  assert.equal(page.includes("history.push"), false);
  assert.match(page, /onClose=\{\(\) => setExploreEdu\(null\)\}/);
  assert.match(page, /openRelatedEduSheet/);
  assert.match(page, /sheetId=\{eduTarget\.id\}/);
  assert.match(page, /openSubstance && !eduTarget/);
  assert.match(page, /openSystem && !eduTarget/);
  assert.match(sheet, /restoreOpener/);
  assert.match(sheet, /Escape/);
});

test("atlas educational links are real hrefs without a second dialog", () => {
  assert.match(summary, /exploreEduHref/);
  assert.match(summary, /<Link/);
  assert.match(summary, /data-edu-from-anatomy/);
  assert.equal(summary.includes("DetailSheet"), false);
  assert.equal(summary.includes("replace:"), false);
});
