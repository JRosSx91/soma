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
  "P(Tx)=P(x)",
  "\\mathbf r\\,'=\\mathbf r+\\mathbf a",
  "\\mathbf r\\,'=R\\mathbf r,\\qquad R^{\\mathsf T}R=I",
  "E=\\sum_i \\dot q_i\\,\\frac{\\partial L}{\\partial\\dot q_i}-L",
  "S[q]=\\int_{t_1}^{t_2}L(q,\\dot q,t)\\,dt",
  "\\frac{dQ}{dt}=0",
  "\\frac{dQ_{\\mathrm{dentro}}}{dt}=\\text{entrada}-\\text{salida}+\\text{producción neta}",
  "\\frac{d\\mathbf P}{dt}=\\mathbf F_{\\mathrm{ext}}=\\mathbf 0",
  "K=\\frac{1}{2}mv^2",
  "W_{\\mathrm{neto}}=\\Delta K",
  "\\mathbf p=m\\mathbf v",
  "\\mathbf F_{\\mathrm{neta}}=\\frac{d\\mathbf p}{dt}",
  "\\mathbf J=\\int_{t_1}^{t_2}\\mathbf F_{\\mathrm{neta}}\\,dt=\\Delta\\mathbf p",
  "\\mathbf p=\\gamma m\\mathbf v,\\qquad\\gamma=\\frac{1}{\\sqrt{1-v^2/c^2}}",
  "\\mathbf L=\\mathbf r\\times\\mathbf p",
  "\\boldsymbol\\tau_{\\mathrm{ext}}=\\frac{d\\mathbf L}{dt}",
  "L=I\\omega",
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

test("stratum zero publishes seventeen candidate educational sheets", () => {
  assert.equal(STRATUM_EDITORIAL_SHEETS.length, 17);
  assert.deepEqual(
    STRATUM_EDITORIAL_SHEETS.map((sheet) => sheet.code),
    ["F00.01", "F00.02", "F00.03", "F00.04", "F00.05", "F00.06", "F00.07", "F00.08", "F00.09", "F00.10", "F00.11", "F00.12", "F00.13", "F00.14", "F00.15", "F00.16", "F00.17"],
  );
  assert.deepEqual(STRATUM_EDITORIAL_SHEETS.map((sheet) => sheet.sequence), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
  for (const sheet of STRATUM_EDITORIAL_SHEETS) {
    assert.equal(sheet.editorialStatus, "candidate");
    assert.equal(stratumProvisionalCode(sheet.sequence), sheet.code);
    assert.equal(editorialSheetForSequence(sheet.sequence)?.code, sheet.code);
    assert.equal(editorialSheetForSequence(sheet.sequence + 20), null);
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
  for (let sequence = 18; sequence <= 28; sequence += 1) {
    assert.equal(editorialSheetForSequence(sequence), null);
  }
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
  const symmetry = editorialSheetForSequence(10)!;
  const spatial = editorialSheetForSequence(11)!;
  const temporal = editorialSheetForSequence(12)!;
  const noether = editorialSheetForSequence(13)!;
  const conservation = editorialSheetForSequence(14)!;
  const energy = editorialSheetForSequence(15)!;
  const momentum = editorialSheetForSequence(16)!;
  const angular = editorialSheetForSequence(17)!;
  assert.match(symmetry.intro.at(-1)!, /algo relevante permanece inalterado\.$/);
  assert.match(symmetry.details[0]!, /^Solemos asociar simetría/);
  assert.match(spatial.intro.at(-1)!, /\*\*simetría espacial\*\*:/);
  assert.match(spatial.details[0]!, /^Hay dos transformaciones espaciales/);
  assert.match(temporal.intro.at(-1)!, /también se mantienen equivalentes\.$/);
  assert.match(temporal.details[0]!, /^Decir que «las leyes son las mismas mañana»/);
  assert.match(noether.intro.at(-1)!, /cantidades conservadas\.$/);
  assert.match(noether.details[0]!, /^Durante mucho tiempo/);
  assert.match(conservation.intro.at(-1)!, /repartirse entre sus partes\.$/);
  assert.match(conservation.details[0]!, /^La palabra conservación suele evocar/);
  assert.match(energy.intro.at(-1)!, /relacionar los cambios en los sistemas\.$/);
  assert.match(energy.details[0]!, /^Cuando alguien dice «tengo energía»/);
  assert.match(momentum.intro.at(-1)!, /en la mecánica clásica\.$/);
  assert.match(momentum.details[0]!, /^En el lenguaje cotidiano/);
  assert.match(angular.intro.at(-1)!, /respecto de un punto o eje\.$/);
  assert.match(angular.details[0]!, /^Un objeto puede desplazarse en línea recta/);
  for (const sheet of [symmetry, spatial, temporal, noether, conservation, energy, momentum, angular]) {
    assert.equal(sheet.intro.length, 2);
    assert.equal(sheet.examples.length, 3);
    assert.equal(sheet.narrativeTitle, "Conexión narrativa");
  }
  assert.equal(symmetry.details.length, 5);
  assert.equal(noether.details.length, 6);
  assert.equal(energy.details.length, 6);
  assert.equal(angular.details.length, 5);
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
  assert.deepEqual(STRATUM_PLAYABLE_PARENTS[10], [2, 3]);
  assert.deepEqual(STRATUM_PLAYABLE_PARENTS[11], [10]);
  assert.deepEqual(STRATUM_PLAYABLE_PARENTS[12], [10]);
  assert.equal(STRATUM_PLAYABLE_PARENTS[12]?.includes(11), false);
  assert.deepEqual(STRATUM_PLAYABLE_PARENTS[13], [10]);
  assert.equal(STRATUM_PLAYABLE_PARENTS[13]?.includes(12), false);
  assert.deepEqual(STRATUM_PLAYABLE_PARENTS[14], [13]);
  assert.deepEqual(STRATUM_PLAYABLE_PARENTS[15], [14]);
  assert.deepEqual(STRATUM_PLAYABLE_PARENTS[16], [14, 11]);
  assert.equal(STRATUM_PLAYABLE_PARENTS[16]?.includes(15), false);
  assert.deepEqual(STRATUM_PLAYABLE_PARENTS[17], [14, 11]);
  assert.equal(STRATUM_PLAYABLE_PARENTS[17]?.includes(16), false);
  assert.deepEqual(STRATUM_PLAYABLE_PARENTS[18], [15]);
  const causality = STRATUM_EDITORIAL_SHEETS[3]!;
  assert.match(causality.narrative.join(" "), /no constituye un requisito para desbloquear Espacio-tiempo/);
  const geometry = STRATUM_EDITORIAL_SHEETS[8]!;
  assert.match(geometry.narrative.join(" "), /sin convertirlo aquí en un prerrequisito jugable/);
  const energy = editorialSheetForSequence(15)!;
  assert.match(energy.narrative.join(" "), /ruta jugable hacia \*\*Cuantización\*\*/);
  assert.match(energy.narrative.join(" "), /no significa que la cuantización se deduzca únicamente/);
  assert.equal(STRATUM_PLAYABLE_PARENTS[18]?.includes(17), false);
});

test("new stratum sheets keep their own panoramic art and map thumbnails", () => {
  for (let sequence = 1; sequence <= 17; sequence += 1) {
    const sheet = fileURLToPath(STRATUM_SHEET_ART[sequence]!);
    const node = fileURLToPath(STRATUM_NODE_ART[sequence]!);
    assert.equal(existsSync(sheet), true, sheet);
    assert.equal(existsSync(node), true, node);
    const code = String(sequence).padStart(2, "0");
    assert.equal(STRATUM_SHEET_ART[sequence]?.includes(`f00-${code}.webp`), true);
    assert.equal(STRATUM_NODE_ART[sequence]?.includes(`node-f00-${code}.webp`), true);
  }
  assert.equal(STRATUM_SHEET_ART[18], undefined);
  assert.equal(STRATUM_NODE_ART[18], undefined);
});
