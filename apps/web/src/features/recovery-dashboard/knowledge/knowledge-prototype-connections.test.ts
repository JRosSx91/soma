import assert from "node:assert/strict";
import { test } from "node:test";
import {
  KNOWLEDGE_PROTOTYPE_CATALOG,
  KNOWLEDGE_PROTOTYPE_DEPENDENCIES,
  KNOWLEDGE_PROTOTYPE_NODES,
} from "./knowledge-prototype-fixture.js";
import { buildPrototypeLayout } from "./knowledge-prototype-layout.js";
import { cardsOverlap, prototypeCardFootprint } from "./knowledge-prototype-organic-layout.js";
import {
  buildRenderedConnections,
  sampleCubicPath,
  verticalFlowPath,
} from "./knowledge-prototype-connections.js";

const DESKTOP = {
  width: 1000,
  top: 92,
  rowGap: 200,
  sideMargin: 130,
  cardHalfHeight: 96,
};

test("rendered connections mirror catalog relations and game dependencies without duplicates", () => {
  const nodes = KNOWLEDGE_PROTOTYPE_NODES.map((node) => ({ ...node, state: "discovered" as const }));
  const layout = buildPrototypeLayout(nodes, KNOWLEDGE_PROTOTYPE_DEPENDENCIES, DESKTOP);
  const positions = new Map(layout.nodes.map((item) => [item.node.id, { x: item.x, y: item.y }]));
  const rendered = buildRenderedConnections(
    KNOWLEDGE_PROTOTYPE_CATALOG.relations,
    KNOWLEDGE_PROTOTYPE_DEPENDENCIES,
    positions,
  );
  assert.equal(rendered.length, KNOWLEDGE_PROTOTYPE_CATALOG.relations.length + KNOWLEDGE_PROTOTYPE_DEPENDENCIES.length);
  assert.equal(new Set(rendered.map((edge) => edge.id)).size, rendered.length);
  const kindsByPair = new Map<string, Set<string>>();
  for (const edge of rendered) {
    kindsByPair.set(edge.pairKey, new Set([...(kindsByPair.get(edge.pairKey) ?? []), edge.kind]));
  }
  const shared = `${KNOWLEDGE_PROTOTYPE_NODES[1]!.id}→${KNOWLEDGE_PROTOTYPE_NODES[4]!.id}`;
  assert.ok(kindsByPair.get(shared)?.has("scientific"));
  assert.ok(kindsByPair.get(shared)?.has("game"));
});

test("lateral connections prefer compact routing over shallow anchors", () => {
  const from = { x: 520, y: 820 };
  const to = { x: 218, y: 1120 };
  const d = `M ${from.x} ${from.y + 96} C ${from.x} ${from.y + 260} ${to.x} ${to.y - 260} ${to.x} ${to.y - 96}`;
  const legacyLength = sampleCubicPath(d).reduce((total, point, index, points) => {
    if (index === 0) return 0;
    const previous = points[index - 1]!;
    return total + Math.hypot(point.x - previous.x, point.y - previous.y);
  }, 0);
  const next = verticalFlowPath(from, to, 96, -16, "lateral-case", 88);
  const nextLength = sampleCubicPath(next).reduce((total, point, index, points) => {
    if (index === 0) return 0;
    const previous = points[index - 1]!;
    return total + Math.hypot(point.x - previous.x, point.y - previous.y);
  }, 0);
  assert.ok(nextLength < legacyLength * 0.92);
  assert.ok(next.includes("C "));
});

test("sampled connection paths avoid foreign card centers on representative edges", () => {
  const nodes = KNOWLEDGE_PROTOTYPE_NODES.map((node) => ({ ...node, state: "discovered" as const }));
  const layout = buildPrototypeLayout(nodes, KNOWLEDGE_PROTOTYPE_DEPENDENCIES, DESKTOP);
  const positions = new Map(layout.nodes.map((item) => [item.node.id, { x: item.x, y: item.y }]));
  const { halfWidth, halfHeight } = prototypeCardFootprint(DESKTOP);
  const byId = new Map(layout.nodes.map((item) => [item.node.id, item]));

  const focusPairs = [
    [KNOWLEDGE_PROTOTYPE_NODES[0]!.id, KNOWLEDGE_PROTOTYPE_NODES[1]!.id],
    [KNOWLEDGE_PROTOTYPE_NODES[1]!.id, KNOWLEDGE_PROTOTYPE_NODES[4]!.id],
    [KNOWLEDGE_PROTOTYPE_NODES[4]!.id, KNOWLEDGE_PROTOTYPE_NODES[5]!.id],
  ] as const;

  for (const [fromId, toId] of focusPairs) {
    const from = positions.get(fromId)!;
    const to = positions.get(toId)!;
    const path = verticalFlowPath(from, to, DESKTOP.cardHalfHeight, -16, `${fromId}-${toId}`, halfWidth);
    const samples = sampleCubicPath(path);
  assert.ok(samples.length > 4);
    for (const sample of samples) {
      for (const node of layout.nodes) {
        if (node.node.id === fromId || node.node.id === toId) continue;
        const inside =
          Math.abs(sample.x - node.x) < halfWidth * 0.72 && Math.abs(sample.y - node.y) < halfHeight * 0.72;
        assert.equal(inside, false, `path ${fromId}→${toId} crosses ${node.node.id}`);
      }
    }
  }

  const space = byId.get(KNOWLEDGE_PROTOTYPE_NODES[1]!.id)!;
  const field = byId.get(KNOWLEDGE_PROTOTYPE_NODES[22]!.id)!;
  assert.ok(Math.hypot(field.x - space.x, field.y - space.y) < 780);
  assert.equal(cardsOverlap(space, field, DESKTOP), false);
});