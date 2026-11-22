import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { PUBLIC_KNOWLEDGE_CATALOG } from "./public-knowledge-catalog.ts";

test("the empty publication manifest keeps the runtime catalog empty and safe", () => {
  assert.deepEqual(PUBLIC_KNOWLEDGE_CATALOG.concepts, []);
  assert.deepEqual(PUBLIC_KNOWLEDGE_CATALOG.relations, []);
  assert.deepEqual(PUBLIC_KNOWLEDGE_CATALOG.prerequisites, []);
  assert.deepEqual(PUBLIC_KNOWLEDGE_CATALOG.prerequisitePolicy, {
    blocksAccess: false,
    grantsXp: false,
    incomingAreCumulative: false,
  });
});

test("the generated runtime source contains no design catalog import", () => {
  const source = readFileSync(
    new URL("public-knowledge-catalog.generated.ts", import.meta.url),
    "utf8",
  );
  assert.equal(source.includes("docs/design/gam-03b"), false);
  assert.equal(source.includes("content-01-editorial-batch"), false);
  assert.equal(source.includes("soma:K"), false);
});
