import assert from "node:assert/strict";
import { test } from "node:test";
import {
  KNOWLEDGE_PROTOTYPE_DEPENDENCIES,
  KNOWLEDGE_PROTOTYPE_NODES,
  prototypeNodesForScenario,
} from "./knowledge-prototype-fixture.js";
import { buildPrototypeLayout, mergeLayoutScenarioNodes, visibleFrameHeight } from "./knowledge-prototype-layout.js";
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
  assert.equal(first.nodes.length, 28);
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
  assert.equal(merged.length, 28);
  assert.equal(merged.filter((node) => node.state === "hidden").length, 25);
});

test("organic topology avoids card overlap across the full chapter", () => {
  const nodes = KNOWLEDGE_PROTOTYPE_NODES.map((node) => ({ ...node, state: "discovered" as const }));
  for (const metrics of [DESKTOP, MOBILE]) {
    const layout = buildPrototypeLayout(nodes, KNOWLEDGE_PROTOTYPE_DEPENDENCIES, metrics);
    assert.equal(layout.nodes.length, 28);
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
  const space = byId.get(KNOWLEDGE_PROTOTYPE_NODES[1]!.id)!;
  const field = byId.get(KNOWLEDGE_PROTOTYPE_NODES[22]!.id)!;
  const spacetime = byId.get(KNOWLEDGE_PROTOTYPE_NODES[4]!.id)!;
  const special = byId.get(KNOWLEDGE_PROTOTYPE_NODES[5]!.id)!;
  assert.ok(field.y > space.y, "the field sits below space");
  assert.ok(field.y - space.y < 620, "the field stays near space");
  assert.ok(special.y - spacetime.y < 520, "special relativity stays near spacetime");
  assert.equal(cardsOverlap(space, field, DESKTOP), false);
});

test("the opening frame stops before hidden constellations", () => {
  const start = buildPrototypeLayout(prototypeNodesForScenario("start"), KNOWLEDGE_PROTOTYPE_DEPENDENCIES, DESKTOP);
  const full = buildPrototypeLayout(
    KNOWLEDGE_PROTOTYPE_NODES.map((node) => ({ ...node, state: "discovered" as const })),
    KNOWLEDGE_PROTOTYPE_DEPENDENCIES,
    DESKTOP,
  );
  const frame = visibleFrameHeight(start, DESKTOP);
  const door = start.nodes.find((item) => item.node.sequence === 26)!;
  const universe = start.nodes.find((item) => item.node.sequence === 1)!;
  const fullUniverse = full.nodes.find((item) => item.node.sequence === 1)!;
  assert.ok(frame < full.height * 0.62);
  assert.ok(door.y > frame);
  assert.deepEqual([universe.x, universe.y], [fullUniverse.x, fullUniverse.y]);
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