import assert from "node:assert/strict";
import { test } from "node:test";
import {
  KNOWLEDGE_PROTOTYPE_DEPENDENCIES,
  KNOWLEDGE_PROTOTYPE_NODES,
  prototypeNodesForScenario,
} from "./knowledge-prototype-fixture.js";
import { buildPrototypeLayout, mergeLayoutScenarioNodes } from "./knowledge-prototype-layout.js";
import { cardsOverlap } from "./knowledge-prototype-organic-layout.js";

const DESKTOP = {
  width: 1000,
  top: 92,
  rowGap: 200,
  sideMargin: 130,
  cardHalfHeight: 96,
};

const MOBILE = {
  width: 360,
  top: 84,
  rowGap: 198,
  sideMargin: 72,
  cardHalfHeight: 88,
};

test("layout is deterministic for repeated builds", () => {
  const nodes = KNOWLEDGE_PROTOTYPE_NODES.map((node) => ({ ...node, state: "discovered" as const }));
  const first = buildPrototypeLayout(nodes, KNOWLEDGE_PROTOTYPE_DEPENDENCIES, DESKTOP);
  const second = buildPrototypeLayout(nodes, KNOWLEDGE_PROTOTYPE_DEPENDENCIES, DESKTOP);
  assert.equal(first.nodes.length, 19);
  assert.deepEqual(
    first.nodes.map((item) => [item.node.id, item.x, item.y]),
    second.nodes.map((item) => [item.node.id, item.x, item.y]),
  );
});

test("visible-only updates do not move positions of discovered nodes", () => {
  const early = buildPrototypeLayout(prototypeNodesForScenario("start"), KNOWLEDGE_PROTOTYPE_DEPENDENCIES, DESKTOP);
  const late = buildPrototypeLayout(prototypeNodesForScenario("middle"), KNOWLEDGE_PROTOTYPE_DEPENDENCIES, DESKTOP);
  const charge = KNOWLEDGE_PROTOTYPE_NODES[0]!.id;
  const ion = KNOWLEDGE_PROTOTYPE_NODES[1]!.id;
  const earlyCharge = early.nodes.find((item) => item.node.id === charge);
  const lateCharge = late.nodes.find((item) => item.node.id === charge);
  const earlyIon = early.nodes.find((item) => item.node.id === ion);
  const lateIon = late.nodes.find((item) => item.node.id === ion);
  assert.deepEqual([earlyCharge?.x, earlyCharge?.y], [lateCharge?.x, lateCharge?.y]);
  assert.deepEqual([earlyIon?.x, earlyIon?.y], [lateIon?.x, lateIon?.y]);
});

test("mergeLayoutScenarioNodes pads hidden slots without dropping geometry", () => {
  const start = prototypeNodesForScenario("start");
  const merged = mergeLayoutScenarioNodes(start);
  assert.equal(merged.length, 19);
  assert.equal(merged.filter((node) => node.state === "hidden").length, 17);
});

test("organic topology avoids card overlap across the full chapter", () => {
  const nodes = KNOWLEDGE_PROTOTYPE_NODES.map((node) => ({ ...node, state: "discovered" as const }));
  for (const metrics of [DESKTOP, MOBILE]) {
    const layout = buildPrototypeLayout(nodes, KNOWLEDGE_PROTOTYPE_DEPENDENCIES, metrics);
    assert.equal(layout.nodes.length, 19);
    for (let left = 0; left < layout.nodes.length; left += 1) {
      for (let right = left + 1; right < layout.nodes.length; right += 1) {
        const a = layout.nodes[left]!;
        const b = layout.nodes[right]!;
        assert.equal(
          cardsOverlap(a, b, metrics),
          false,
          `overlap ${a.node.id} vs ${b.node.id}`,
        );
      }
    }
  }
});

test("branch clusters stay near pedagogical anchors on desktop", () => {
  const nodes = KNOWLEDGE_PROTOTYPE_NODES.map((node) => ({ ...node, state: "discovered" as const }));
  const layout = buildPrototypeLayout(nodes, KNOWLEDGE_PROTOTYPE_DEPENDENCIES, DESKTOP);
  const byId = new Map(layout.nodes.map((item) => [item.node.id, item]));
  const membrane = byId.get(KNOWLEDGE_PROTOTYPE_NODES[3]!.id)!;
  const solution = byId.get(KNOWLEDGE_PROTOTYPE_NODES[7]!.id)!;
  const potential = byId.get(KNOWLEDGE_PROTOTYPE_NODES[5]!.id)!;
  const capacitance = byId.get(KNOWLEDGE_PROTOTYPE_NODES[11]!.id)!;
  assert.ok(solution.y - membrane.y < 620, "chem branch should stay closer to membrane");
  assert.ok(capacitance.y - potential.y < 520, "electrical branch should stay closer to potential");
  assert.ok(Math.abs(solution.x - membrane.x) > 120, "chem branch keeps lateral cluster separation");
});

test("early spine nodes use distinct horizontal progression", () => {
  const nodes = KNOWLEDGE_PROTOTYPE_NODES.map((node) => ({ ...node, state: "discovered" as const }));
  const layout = buildPrototypeLayout(nodes, KNOWLEDGE_PROTOTYPE_DEPENDENCIES, DESKTOP);
  const xs = KNOWLEDGE_PROTOTYPE_NODES.slice(0, 4).map(
    (node) => layout.nodes.find((item) => item.node.id === node.id)!.x,
  );
  assert.ok(new Set(xs.map((x) => Math.round(x))).size >= 3);
  assert.ok(Math.max(...xs) - Math.min(...xs) > 90);
});