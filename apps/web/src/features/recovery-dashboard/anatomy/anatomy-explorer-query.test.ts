import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  anatomyExplorerHref,
  anatomyExplorerHrefForOrgan,
  atlasSystemIdForOrgan,
  resolveAnatomyExplorerSelection,
} from "./anatomy-explorer-query.ts";

test("explore system links keep a stable atlas id in the query", () => {
  assert.equal(
    anatomyExplorerHref("/preview", "cardiovascular"),
    "/preview/anatomy?system=cardiovascular",
  );
  assert.equal(
    anatomyExplorerHref("/app", "reproductive"),
    "/app/anatomy?system=reproductive",
  );
  assert.equal(
    anatomyExplorerHref("/preview", "respiratory"),
    "/preview/anatomy?system=respiratory",
  );
  assert.equal(anatomyExplorerHref("/preview", "not-a-system"), "/preview/anatomy");
  assert.equal(
    anatomyExplorerHref("/preview", "nervous-central", "brain-hippocampus"),
    "/preview/anatomy?system=nervous-central&organ=brain-hippocampus",
  );
  assert.equal(
    anatomyExplorerHref("/app", "nervous-central", "brain-hippocampus"),
    "/app/anatomy?system=nervous-central&organ=brain-hippocampus",
  );
  assert.equal(
    anatomyExplorerHref("/preview", "cardiovascular", "lungs"),
    "/preview/anatomy?system=cardiovascular",
  );
});

test("organ to system resolution follows atlasSystems only", () => {
  assert.equal(atlasSystemIdForOrgan("brain-hippocampus"), "nervous-central");
  assert.equal(atlasSystemIdForOrgan("heart"), "cardiovascular");
  assert.equal(atlasSystemIdForOrgan("hippocampus"), null);
  assert.equal(atlasSystemIdForOrgan("not-an-organ"), null);
  assert.equal(
    anatomyExplorerHrefForOrgan("/preview", "brain-hippocampus"),
    "/preview/anatomy?system=nervous-central&organ=brain-hippocampus",
  );
  assert.equal(
    anatomyExplorerHrefForOrgan("/app", "brain-hippocampus"),
    "/app/anatomy?system=nervous-central&organ=brain-hippocampus",
  );
  assert.equal(anatomyExplorerHrefForOrgan("/preview", "hippocampus"), null);
});

test("the explorer resolves known systems and ignores unknown query values", () => {
  assert.deepEqual(resolveAnatomyExplorerSelection(null), {
    systemId: null,
    organId: null,
  });
  assert.deepEqual(resolveAnatomyExplorerSelection("cardiovascular"), {
    systemId: "cardiovascular",
    organId: null,
  });
  assert.deepEqual(resolveAnatomyExplorerSelection("reproductive"), {
    systemId: "reproductive",
    organId: null,
  });
  assert.deepEqual(resolveAnatomyExplorerSelection("unknown-system"), {
    systemId: null,
    organId: null,
  });
  assert.deepEqual(resolveAnatomyExplorerSelection("cardiovascular", "heart"), {
    systemId: "cardiovascular",
    organId: "heart",
  });
  assert.deepEqual(resolveAnatomyExplorerSelection("cardiovascular", "lungs"), {
    systemId: "cardiovascular",
    organId: null,
  });
});

test("explore system detail uses the query href helper", () => {
  const explore = readFileSync(new URL("../pages/ExplorePage.tsx", import.meta.url), "utf8");
  const explorer = readFileSync(
    new URL("../pages/AnatomyExplorerPage.tsx", import.meta.url),
    "utf8",
  );
  assert.match(explore, /anatomyExplorerHref\(base, systemId\)/);
  assert.match(explore, /anatomyExplorerHrefForOrgan/);
  assert.match(explore, /anatomyExplorerHref\(base, systemId, organ\.id\)/);
  assert.equal(explore.includes("educationalAnatomyHrefForSignaling"), false);
  assert.match(explorer, /useSearchParams/);
  assert.match(explorer, /resolveAnatomyExplorerSelection/);
  assert.equal(explorer.includes('searchParams.get("substance")'), false);
  assert.equal(explorer.includes('searchParams.get("phase")'), false);
  assert.equal(explorer.includes('searchParams.get("tab")'), false);
});
