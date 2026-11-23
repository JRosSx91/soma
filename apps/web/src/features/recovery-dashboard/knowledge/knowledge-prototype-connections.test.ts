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
  connectionEmphasis,
  constellationThread,
  playableConnectionRole,
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

test("constellation threads meet the disc rims and do not encode an arrow", () => {
  const from = { x: 460, y: 280 };
  const to = { x: 300, y: 390 };
  const path = constellationThread(from, to, 32, 24);
  assert.equal(path.includes("marker"), false);
  const samples = sampleCubicPath(path);
  const start = samples[0]!;
  const end = samples.at(-1)!;
  assert.ok(Math.abs(Math.hypot(start.x - from.x, start.y - from.y) - 34) < 1.5);
  assert.ok(Math.abs(Math.hypot(end.x - to.x, end.y - to.y) - 26) < 1.5);
  assert.ok(path.includes("C "));
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

test("scientific edges stay off the playable map even when a concept is selected", () => {
  const universe = KNOWLEDGE_PROTOTYPE_NODES[0]!.id;
  const space = KNOWLEDGE_PROTOTYPE_NODES[1]!.id;
  const shared = {
    kind: "scientific" as const,
    from: universe,
    to: space,
    fromCluster: 1,
    toCluster: 1,
    length: 180,
    selectedId: null,
    role: "trunk" as const,
  };
  assert.equal(connectionEmphasis(shared), "hidden");
  assert.equal(connectionEmphasis({ ...shared, selectedId: universe }), "hidden");
  assert.equal(connectionEmphasis({
    kind: "game",
    from: universe,
    to: space,
    fromCluster: 1,
    toCluster: 1,
    length: 180,
    selectedId: null,
    role: "trunk",
  }), "regional");
  assert.equal(connectionEmphasis({
    kind: "game",
    from: universe,
    to: space,
    fromCluster: 1,
    toCluster: 2,
    length: 80,
    selectedId: null,
    role: "secondary",
  }), "hidden");
  assert.equal(connectionEmphasis({
    kind: "game",
    from: universe,
    to: space,
    fromCluster: 1,
    toCluster: 2,
    length: 900,
    selectedId: space,
    role: "secondary",
  }), "focus");
});

test("essential playable joins stay visible across constellations", () => {
  const bySequence = new Map(KNOWLEDGE_PROTOTYPE_NODES.map((node) => [node.sequence, node]));
  const trunkPairs = [
    [1, 2],
    [1, 3],
    [2, 5],
    [3, 5],
    [2, 10],
    [3, 10],
    [5, 6],
    [6, 26],
    [19, 26],
  ] as const;
  const other = bySequence.get(14)!.id;
  for (const [fromSequence, toSequence] of trunkPairs) {
    const from = bySequence.get(fromSequence)!;
    const to = bySequence.get(toSequence)!;
    const dependency = KNOWLEDGE_PROTOTYPE_DEPENDENCIES.find(
      (edge) => edge.from === from.id && edge.to === to.id,
    );
    assert.ok(dependency, `${fromSequence}→${toSequence}`);
    assert.equal(playableConnectionRole(from.essential, to.essential), "trunk");
    const base = {
      kind: "game" as const,
      from: from.id,
      to: to.id,
      fromCluster: from.cluster,
      toCluster: to.cluster,
      length: 640,
      role: "trunk" as const,
    };
    assert.equal(connectionEmphasis({ ...base, selectedId: null }), "regional");
    assert.equal(connectionEmphasis({ ...base, selectedId: other }), "dim");
    assert.equal(connectionEmphasis({ ...base, selectedId: to.id }), "focus");
  }

  const spacetime = bySequence.get(5)!;
  const gravitation = bySequence.get(7)!;
  const bridge = bySequence.get(25)!;
  const quantum = bySequence.get(19)!;
  assert.equal(playableConnectionRole(spacetime.essential, gravitation.essential), "secondary");
  assert.equal(playableConnectionRole(quantum.essential, bridge.essential), "secondary");
  assert.equal(KNOWLEDGE_PROTOTYPE_DEPENDENCIES.some(
    (edge) => edge.from === spacetime.id && edge.to === bySequence.get(10)!.id,
  ), false);
  assert.equal(KNOWLEDGE_PROTOTYPE_DEPENDENCIES.some(
    (edge) => edge.from === bySequence.get(23)!.id && edge.to === bySequence.get(26)!.id,
  ), true);
});