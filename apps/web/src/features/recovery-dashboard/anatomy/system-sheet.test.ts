import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { atlasSystems } from "./atlas-config.ts";
import { educationalAnatomy } from "./anatomy-education.ts";
import { listOrganSheets } from "./organ-sheet.ts";
import { resolveSystemSheet } from "./system-sheet.ts";

const anatomyPublicDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../../public/images/anatomy",
);

function systemById(id: string) {
  const system = atlasSystems.find((item) => item.id === id);
  assert.ok(system, id);
  return system;
}

test("empty systems resolve educational sheets without inventing organs", () => {
  for (const id of ["endocrine", "nervous-peripheral"] as const) {
    const system = systemById(id);
    assert.equal(system.organs.length, 0);
    assert.deepEqual(listOrganSheets(system), []);

    const sheet = resolveSystemSheet(system);
    assert.equal(sheet.systemId, id);
    assert.equal(sheet.catalogSystem, id);
    assert.equal(sheet.emptySystem, true);
    assert.equal(sheet.organCount, 0);
    assert.equal(sheet.availability.hasEducation, true);
    assert.equal(sheet.availability.hasNarratives, false);
    assert.equal(sheet.availability.hasRecoveryCurves, false);
    assert.ok(sheet.sources.length > 0);
    assert.ok(sheet.plate?.src);
    assert.equal(sheet.availability.hasPlate, true);
    const file = sheet.plate!.src.replace("/images/anatomy/", "");
    assert.equal(existsSync(join(anatomyPublicDir, file)), true);
  }
});

test("systems with organs do not receive empty-system education by default", () => {
  const respiratory = resolveSystemSheet(systemById("respiratory"));
  assert.equal(respiratory.emptySystem, false);
  assert.equal(respiratory.organCount, 3);
  assert.equal(respiratory.availability.hasEducation, false);
  assert.equal(respiratory.education, null);
  assert.deepEqual(respiratory.sources, []);
});

test("system sheets stay compatible with twenty-one organ fichas", () => {
  const organSheets = atlasSystems.flatMap((system) => listOrganSheets(system));
  assert.equal(organSheets.length, 21);
  for (const sheet of organSheets) {
    assert.equal(sheet.availability.hasEducation, true, sheet.organId);
    assert.ok(educationalAnatomy(sheet.organId));
  }

  const endocrine = resolveSystemSheet(systemById("endocrine"));
  const pns = resolveSystemSheet(systemById("nervous-peripheral"));
  assert.ok(endocrine.education);
  assert.ok(pns.education);
  assert.notEqual(endocrine.systemId, pns.systemId);
  assert.notDeepEqual(endocrine.sources, pns.sources);
});
