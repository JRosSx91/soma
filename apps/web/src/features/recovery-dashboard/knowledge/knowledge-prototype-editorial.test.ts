import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import katex from "katex";
import { KNOWLEDGE_PROTOTYPE_CATALOG, STRATUM_PLAYABLE_PARENTS, stratumProvisionalCode, stratumRuntimeId } from "./knowledge-prototype-fixture.js";
import { STRATUM_EDITORIAL_SHEETS, editorialSheetForSequence } from "./knowledge-prototype-editorial.js";
import { STRATUM_NODE_ART, STRATUM_SHEET_ART } from "./knowledge-prototype-lookdev.js";
import type { EditorialBlock } from "./knowledge-prototype-editorial.js";

const FORMULAS = [
  "\\vec F_{\\mathrm{neta}}=m\\vec a",
  "d=\\sqrt{(\\Delta x)^2+(\\Delta y)^2+(\\Delta z)^2}",
  "\\Delta\\tau=\\Delta t\\sqrt{1-\\frac{v^2}{c^2}}",
  "s^2=c^2(\\Delta t)^2-(\\Delta x)^2-(\\Delta y)^2-(\\Delta z)^2",
  "\\gamma=\\frac{1}{\\sqrt{1-v^2/c^2}}",
  "\\Delta t=\\gamma\\,\\Delta\\tau",
  "E_0=mc^2",
  "F=G\\frac{m_1m_2}{r^2}",
  "G_{\\mu\\nu}+\\Lambda g_{\\mu\\nu}=\\frac{8\\pi G}{c^4}T_{\\mu\\nu}",
  "ds^2=g_{\\mu\\nu}\\,dx^{\\mu}dx^{\\nu}",
  "\\frac{D^2\\xi^{\\mu}}{d\\tau^2}=-R^{\\mu}{}_{\\nu\\alpha\\beta}\\,u^{\\nu}\\xi^{\\alpha}u^{\\beta}",
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

test("stratum zero publishes nine candidate educational sheets", () => {
  assert.equal(STRATUM_EDITORIAL_SHEETS.length, 9);
  assert.deepEqual(
    STRATUM_EDITORIAL_SHEETS.map((sheet) => sheet.code),
    ["F00.01", "F00.02", "F00.03", "F00.04", "F00.05", "F00.06", "F00.07", "F00.08", "F00.09"],
  );
  assert.deepEqual(STRATUM_EDITORIAL_SHEETS.map((sheet) => sheet.sequence), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
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
  assert.equal(editorialSheetForSequence(10), null);
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
  const spacetime = STRATUM_EDITORIAL_SHEETS[4]!;
  const special = STRATUM_EDITORIAL_SHEETS[5]!;
  const gravitation = STRATUM_EDITORIAL_SHEETS[6]!;
  const general = STRATUM_EDITORIAL_SHEETS[7]!;
  const geometry = STRATUM_EDITORIAL_SHEETS[8]!;
  assert.match(spacetime.intro.at(-1)!, /\*\*espacio-tiempo\*\*\.$/);
  assert.match(spacetime.details[0]!, /^En nuestra experiencia utilizamos tres coordenadas/);
  assert.match(special.intro.at(-1)!, /medidas de espacio y tiempo\*\*\.$/);
  assert.match(special.details[0]!, /^A principios del siglo XX/);
  assert.match(gravitation.intro.at(-1)!, /\*\*la gravitación\*\*\.$/);
  assert.match(gravitation.details[0]!, /^En la vida cotidiana decimos/);
  assert.match(general.intro.at(-1)!, /\*\*la relatividad general\*\*\.$/);
  assert.match(general.details[0]!, /^En la descripción de Newton/);
  assert.match(geometry.intro.at(-1)!, /desde dentro de él\*\*\.$/);
  assert.match(geometry.details[0]!, /^En geometría plana/);
  for (const sheet of [spacetime, special, gravitation, general, geometry]) {
    assert.equal(sheet.intro.length, 2);
    assert.equal(sheet.details.length, 5);
  }
});

test("narrative connections do not rewrite the playable graph", () => {
  assert.deepEqual(STRATUM_PLAYABLE_PARENTS[1], []);
  assert.deepEqual(STRATUM_PLAYABLE_PARENTS[2], [1]);
  assert.deepEqual(STRATUM_PLAYABLE_PARENTS[3], [1]);
  assert.deepEqual(STRATUM_PLAYABLE_PARENTS[4], [2, 3]);
  assert.deepEqual(STRATUM_PLAYABLE_PARENTS[5], [2, 3]);
  assert.equal(STRATUM_PLAYABLE_PARENTS[5]?.includes(4), false);
  assert.deepEqual(STRATUM_PLAYABLE_PARENTS[6], [5]);
  assert.deepEqual(STRATUM_PLAYABLE_PARENTS[7], [5]);
  assert.deepEqual(STRATUM_PLAYABLE_PARENTS[8], [6, 7]);
  assert.deepEqual(STRATUM_PLAYABLE_PARENTS[9], [8]);
  assert.equal(STRATUM_PLAYABLE_PARENTS[9]?.includes(28), false);
  assert.deepEqual(STRATUM_PLAYABLE_PARENTS[28], [7]);
  const causality = STRATUM_EDITORIAL_SHEETS[3]!;
  assert.match(causality.narrative.join(" "), /no constituye un requisito para desbloquear Espacio-tiempo/);
  const geometry = STRATUM_EDITORIAL_SHEETS[8]!;
  assert.match(geometry.narrative.join(" "), /sin convertirlo aquí en un prerrequisito jugable/);
});

test("new stratum sheets keep their own panoramic art and map thumbnails", () => {
  for (const sequence of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
    const sheet = fileURLToPath(STRATUM_SHEET_ART[sequence]!);
    const node = fileURLToPath(STRATUM_NODE_ART[sequence]!);
    assert.equal(existsSync(sheet), true, sheet);
    assert.equal(existsSync(node), true, node);
  }
  assert.equal(STRATUM_SHEET_ART[10], undefined);
  assert.equal(STRATUM_SHEET_ART[1]?.includes("f00-01.webp"), true);
  assert.equal(STRATUM_NODE_ART[9]?.includes("node-f00-09.webp"), true);
});
