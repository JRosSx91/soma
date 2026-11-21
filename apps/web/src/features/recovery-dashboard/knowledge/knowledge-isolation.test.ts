import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const runtimeSources = ["knowledge-types.ts", "knowledge-catalog.ts"].map(
  (name) => readFileSync(new URL(name, import.meta.url), "utf8"),
);

test("runtime modules cannot pull candidate design catalogs into the public bundle", () => {
  for (const source of runtimeSources) {
    const moduleSpecifiers = [
      ...source.matchAll(/(?:from|import)\s*(?:\([^)]*)?\s*["']([^"']+)["']/g),
    ].map((match) => match[1] ?? "");
    assert.equal(
      moduleSpecifiers.some(
        (specifier) =>
          specifier.includes("docs/design") || specifier.endsWith(".json"),
      ),
      false,
    );
  }
});

test("the data layer has no integration with existing product features or effects", () => {
  const source = runtimeSources.join("\n");
  for (const forbidden of [
    "@soma/shared-types",
    "../missions",
    "../anatomy",
    "../expedition",
    "fetch(",
    "apiRequest",
    "localStorage",
    "sessionStorage",
  ]) {
    assert.equal(source.includes(forbidden), false, forbidden);
  }
});
