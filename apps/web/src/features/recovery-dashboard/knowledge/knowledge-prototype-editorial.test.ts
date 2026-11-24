import assert from "node:assert/strict";
import test from "node:test";
import katex from "katex";
import { KNOWLEDGE_PROTOTYPE_CATALOG, STRATUM_PLAYABLE_PARENTS, stratumProvisionalCode, stratumRuntimeId } from "./knowledge-prototype-fixture.js";
import { STRATUM_EDITORIAL_SHEETS, editorialSheetForSequence } from "./knowledge-prototype-editorial.js";
import type { EditorialBlock } from "./knowledge-prototype-editorial.js";

const FORMULAS = [
  "\\vec F_{\\mathrm{neta}}=m\\vec a",
  "d=\\sqrt{(\\Delta x)^2+(\\Delta y)^2+(\\Delta z)^2}",
  "\\Delta\\tau=\\Delta t\\sqrt{1-\\frac{v^2}{c^2}}",
  "s^2=c^2(\\Delta t)^2-(\\Delta x)^2-(\\Delta y)^2-(\\Delta z)^2",
];

function formulasIn(blocks: readonly EditorialBlock[]) {
  return blocks.flatMap((block) => {
    if (block.kind === "formula") return [block.latex];
    if (block.kind === "list") {
      return block.items.flatMap((item) => [...item.matchAll(/\\\((.+?)\\\)/g)].map((match) => match[1]!));
    }
    if (block.kind === "paragraph") {
      return [...block.text.matchAll(/\\\((.+?)\\\)/g)].map((match) => match[1]!);
    }
    return [];
  });
}

test("stratum zero publishes exactly four candidate educational sheets", () => {
  assert.equal(STRATUM_EDITORIAL_SHEETS.length, 4);
  assert.deepEqual(STRATUM_EDITORIAL_SHEETS.map((sheet) => sheet.code), ["F00.01", "F00.02", "F00.03", "F00.04"]);
  assert.deepEqual(STRATUM_EDITORIAL_SHEETS.map((sheet) => sheet.sequence), [1, 2, 3, 4]);
  for (const sheet of STRATUM_EDITORIAL_SHEETS) {
    assert.equal(sheet.editorialStatus, "candidate");
    assert.equal(stratumProvisionalCode(sheet.sequence), sheet.code);
    assert.equal(editorialSheetForSequence(sheet.sequence)?.code, sheet.code);
    assert.equal(editorialSheetForSequence(sheet.sequence + 10), null);
    const concept = KNOWLEDGE_PROTOTYPE_CATALOG.concepts.find((item) => item.id === stratumRuntimeId(sheet.sequence));
    assert.equal(concept?.editorialStatus, "candidate");
    assert.ok(sheet.hookQuestion.length > 20);
    assert.ok(sheet.shortSummary.length > 20);
    assert.ok(sheet.intro.length >= 2);
    assert.ok(sheet.details.length >= 3);
    assert.equal(sheet.intro.filter((paragraph) => sheet.details.includes(paragraph)).length, 0);
    assert.equal(sheet.examples.length, 3);
    assert.ok(sheet.examples.every((example) => example.title.length > 0 && example.paragraphs.length > 0));
    assert.ok(sheet.deepDive.some((block) => block.kind === "heading"));
    assert.ok(sheet.narrativeTitle.length > 0);
    assert.ok(sheet.narrative.length > 0);
  }
  assert.equal(editorialSheetForSequence(5), null);
  assert.equal(editorialSheetForSequence(28), null);
});

test("editorial formulas stay intact and KaTeX can render them", () => {
  const latex = STRATUM_EDITORIAL_SHEETS.flatMap((sheet) => formulasIn(sheet.deepDive));
  for (const expected of FORMULAS) assert.ok(latex.includes(expected), expected);
  for (const expression of latex) {
    const html = katex.renderToString(expression, { throwOnError: true, displayMode: expression.includes("=") });
    assert.match(html, /katex/);
    assert.match(html, /<annotation encoding="application\/x-tex">/);
  }
});

test("visible introductions are paragraph cuts, not rewritten sentences", () => {
  const [universe, space, time, causality] = STRATUM_EDITORIAL_SHEETS;
  assert.match(universe!.intro.at(-1)!, /forman parte del universo físico\.$/);
  assert.match(universe!.details[0]!, /^Cuando hablamos del universo físico/);
  assert.match(space!.intro.at(-1)!, /distancia que te separa de la puerta\.$/);
  assert.match(space!.details[0]!, /^Todo eso es posible porque describimos/);
  assert.match(time!.intro.at(-1)!, /qué estamos midiendo realmente\?$/);
  assert.match(time!.details[0]!, /^El tiempo nos permite ordenar/);
  assert.match(causality!.intro.join(" "), /canto del pájaro hace salir el Sol/);
  assert.match(causality!.intro.at(-1)!, /^Por supuesto que no\.$/);
  assert.match(causality!.details[0]!, /idea fundamental: \*\*la causalidad\*\*\.$/);
  assert.equal(universe!.intro.length + universe!.details.length, 8);
  assert.equal(space!.intro.length + space!.details.length, 9);
  assert.equal(time!.intro.length + time!.details.length, 10);
  assert.equal(causality!.intro.length + causality!.details.length, 12);
});

test("narrative connections do not rewrite the playable graph", () => {
  assert.deepEqual(STRATUM_PLAYABLE_PARENTS[1], []);
  assert.deepEqual(STRATUM_PLAYABLE_PARENTS[2], [1]);
  assert.deepEqual(STRATUM_PLAYABLE_PARENTS[3], [1]);
  assert.deepEqual(STRATUM_PLAYABLE_PARENTS[4], [2, 3]);
  assert.deepEqual(STRATUM_PLAYABLE_PARENTS[5], [2, 3]);
  assert.equal(STRATUM_PLAYABLE_PARENTS[5]?.includes(4), false);
  const causality = STRATUM_EDITORIAL_SHEETS[3]!;
  assert.match(causality.narrative.join(" "), /no constituye un requisito para desbloquear Espacio-tiempo/);
});
