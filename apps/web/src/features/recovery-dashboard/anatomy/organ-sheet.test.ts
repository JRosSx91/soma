import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { atlasSystems } from "./atlas-config.ts";
import { educationalAnatomy } from "./anatomy-education.ts";
import {
  listOrganSheets,
  resolveOrganSheet,
  resolveOrganSheetById,
  systemSheetCoverage,
} from "./organ-sheet.ts";

function systemById(id: string) {
  const system = atlasSystems.find((item) => item.id === id);
  assert.ok(system, id);
  return system;
}

test("respiratory organs resolve a complete sheet without inventing ids", () => {
  const respiratory = systemById("respiratory");
  for (const organ of respiratory.organs) {
    const sheet = resolveOrganSheet(respiratory, organ);
    assert.equal(sheet.organId, organ.id);
    assert.equal(sheet.name, organ.name);
    assert.equal(sheet.systemId, "respiratory");
    assert.equal(sheet.catalogSystem, "respiratory");
    assert.equal(sheet.availability.hasPlate, true);
    assert.equal(sheet.availability.hasEducation, true);
    assert.ok(sheet.education);
    assert.equal(sheet.education, educationalAnatomy(organ.id));
    assert.ok(sheet.anatomy && sheet.anatomy.length > 40);
    assert.ok(sheet.physiology && sheet.physiology.length > 40);
    assert.ok(sheet.relations && sheet.relations.length > 40);
    assert.ok(sheet.sources.length > 0);
    assert.equal(sheet.location, null);
  }
});

test("heart has a plate but no anatomical ficha", () => {
  const cardio = systemById("cardiovascular");
  const heart = cardio.organs[0];
  assert.ok(heart);
  const sheet = resolveOrganSheet(cardio, heart);
  assert.equal(sheet.organId, "heart");
  assert.equal(sheet.availability.hasPlate, true);
  assert.equal(sheet.availability.hasEducation, false);
  assert.equal(sheet.education, null);
  assert.equal(sheet.anatomy, null);
  assert.equal(sheet.physiology, null);
  assert.equal(sheet.relations, null);
  assert.deepEqual(sheet.sources, []);
  assert.equal(sheet.availability.hasNarratives, true);
  assert.equal(sheet.availability.hasRecoveryCurves, true);
  assert.ok(sheet.availability.narrativeSubstanceIds.includes("caffeine"));
});

test("central nervous organs resolve plates and fichas without narratives", () => {
  const nervous = systemById("nervous-central");
  assert.equal(nervous.organs.length, 5);
  for (const organ of nervous.organs) {
    const sheet = resolveOrganSheet(nervous, organ);
    assert.equal(sheet.availability.hasPlate, true);
    assert.equal(sheet.availability.hasEducation, true);
    assert.ok(sheet.location);
    assert.ok(sheet.anatomy && sheet.anatomy.length > 40);
    assert.equal(sheet.availability.hasNarratives, false);
    assert.equal(sheet.availability.hasRecoveryCurves, true);
  }
});

test("testes have a recovery curve without a narrative", () => {
  const reproductive = systemById("reproductive");
  const testes = reproductive.organs.find((organ) => organ.id === "testes");
  assert.ok(testes);
  const sheet = resolveOrganSheet(reproductive, testes);
  assert.equal(sheet.availability.hasNarratives, false);
  assert.equal(sheet.availability.hasRecoveryCurves, true);
  assert.deepEqual([...sheet.availability.recoverySubstanceIds], ["cannabis"]);
});

test("empty systems report zero organs without inventing sheets", () => {
  for (const id of ["endocrine", "nervous-peripheral"] as const) {
    const system = systemById(id);
    const coverage = systemSheetCoverage(system);
    assert.equal(coverage.emptySystem, true);
    assert.equal(coverage.organCount, 0);
    assert.deepEqual(listOrganSheets(system), []);
  }
});

test("resolveOrganSheetById uses the atlas catalog once per organ", () => {
  const lungs = resolveOrganSheetById(atlasSystems, "lungs");
  assert.ok(lungs);
  assert.equal(lungs.systemId, "respiratory");
  assert.equal(lungs.availability.hasEducation, true);
  assert.equal(resolveOrganSheetById(atlasSystems, "not-an-organ"), null);
});

test("system coverage counts stay within atlas membership", () => {
  const respiratory = systemSheetCoverage(systemById("respiratory"));
  assert.equal(respiratory.organCount, 3);
  assert.equal(respiratory.organsWithPlate, 3);
  assert.equal(respiratory.organsWithEducation, 3);
  assert.equal(respiratory.emptySystem, false);

  const digestive = systemSheetCoverage(systemById("digestive"));
  assert.equal(digestive.organCount, 4);
  assert.equal(digestive.organsWithPlate, 1);
  assert.equal(digestive.organsWithEducation, 0);
  assert.ok(digestive.organsWithNarratives >= 1);
});

test("organ sheets never invent parallel organ identifiers", () => {
  const source = readFileSync(new URL("./organ-sheet.ts", import.meta.url), "utf8");
  assert.match(source, /OrganId/);
  assert.match(source, /educationalAnatomy/);
  assert.match(source, /narrativeSubstances/);
  assert.match(source, /recoverySubstances/);
  for (const token of ["demo-data", "estimateCurve", "computeRecovery", "daysAbstinent"]) {
    assert.equal(source.includes(token), false, token);
  }

  for (const system of atlasSystems) {
    for (const sheet of listOrganSheets(system)) {
      assert.ok(system.organs.some((organ) => organ.id === sheet.organId));
      assert.equal(sheet.catalogSystem, system.catalogSystem);
    }
  }
});

test("anatomical education stays separate from substance and recovery catalogs", () => {
  const educationSource = readFileSync(new URL("./anatomy-education.ts", import.meta.url), "utf8");
  assert.equal(educationSource.includes("narrative-catalog"), false);
  assert.equal(educationSource.includes("recovery-catalog"), false);
  assert.equal(educationSource.includes("organ-sheet"), false);

  const sheetSource = readFileSync(new URL("./organ-sheet.ts", import.meta.url), "utf8");
  assert.match(sheetSource, /Substance narratives and recovery curves stay in their own catalogs/);
});
