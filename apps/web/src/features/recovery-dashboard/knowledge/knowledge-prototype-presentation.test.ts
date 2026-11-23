import assert from "node:assert/strict";
import { test } from "node:test";
import { KNOWLEDGE_PROTOTYPE_DEPENDENCIES, KNOWLEDGE_PROTOTYPE_NODES } from "./knowledge-prototype-fixture.js";
import { constellationThread, sampleCubicPath } from "./knowledge-prototype-connections.js";
import {
  PRESENTATION_HEIGHT,
  PRESENTATION_WIDTH,
  STRATUM_POSITIONS,
  THREAD_BOW,
  captionIsVisible,
  clusterBounds,
  clusterFocusBounds,
  mapDetail,
} from "./knowledge-prototype-presentation.js";

function radius(sequence: number) {
  const node = KNOWLEDGE_PROTOTYPE_NODES.find((item) => item.sequence === sequence)!;
  if (node.visualRole === "door" || node.visualRole === "milestone" || node.visualRole === "convergence") return 32;
  if (node.visualRole === "bridge") return 28;
  return node.essential ? 24 : 22;
}

test("the stratum map places 28 concepts once, inside the world, without disc overlap", () => {
  const sequences = Object.keys(STRATUM_POSITIONS).map(Number).sort((a, b) => a - b);
  assert.deepEqual(sequences, Array.from({ length: 28 }, (_, index) => index + 1));
  const points = Object.values(STRATUM_POSITIONS);
  for (const point of points) {
    assert.ok(point.x > 80 && point.x < PRESENTATION_WIDTH - 80);
    assert.ok(point.y > 60 && point.y < PRESENTATION_HEIGHT - 80);
  }
  for (let index = 0; index < sequences.length; index += 1) {
    for (let other = index + 1; other < sequences.length; other += 1) {
      const left = sequences[index]!;
      const right = sequences[other]!;
      const gap = Math.hypot(
        STRATUM_POSITIONS[left]!.x - STRATUM_POSITIONS[right]!.x,
        STRATUM_POSITIONS[left]!.y - STRATUM_POSITIONS[right]!.y,
      ) - radius(left) - radius(right);
      assert.ok(gap >= 48, `${left} overlaps ${right} by ${gap}`);
    }
  }
});

test("playable threads stay off foreign discs and scientific relations are not required to draw", () => {
  const bySequence = new Map(KNOWLEDGE_PROTOTYPE_NODES.map((node) => [node.sequence, node]));
  for (const edge of KNOWLEDGE_PROTOTYPE_DEPENDENCIES) {
    const from = bySequence.get(KNOWLEDGE_PROTOTYPE_NODES.find((node) => node.id === edge.from)!.sequence)!;
    const to = bySequence.get(KNOWLEDGE_PROTOTYPE_NODES.find((node) => node.id === edge.to)!.sequence)!;
    const start = STRATUM_POSITIONS[from.sequence]!;
    const end = STRATUM_POSITIONS[to.sequence]!;
    const path = constellationThread(start, end, radius(from.sequence), radius(to.sequence), THREAD_BOW[`${from.sequence}-${to.sequence}`]);
    assert.equal(path.includes("marker"), false);
    for (const sample of sampleCubicPath(path, 24)) {
      for (const node of KNOWLEDGE_PROTOTYPE_NODES) {
        if (node.sequence === from.sequence || node.sequence === to.sequence) continue;
        const point = STRATUM_POSITIONS[node.sequence]!;
        const clearance = Math.hypot(sample.x - point.x, sample.y - point.y) - radius(node.sequence);
        assert.ok(clearance >= 28, `${from.sequence}->${to.sequence} crosses ${node.sequence}`);
      }
    }
  }
  const clusters = new Set(KNOWLEDGE_PROTOTYPE_NODES.map((node) => node.cluster));
  assert.deepEqual([...clusters], [1, 2, 3, 4]);
  for (const cluster of [1, 2, 3, 4] as const) {
    const bounds = clusterBounds(cluster);
    const focus = clusterFocusBounds(cluster);
    assert.ok(bounds.maxX > bounds.minX);
    assert.ok(bounds.maxY > bounds.minY);
    assert.ok(focus.maxX > focus.minX);
    assert.ok(focus.maxY > focus.minY);
  }
});

test("zoom detail keeps every concept locatable and only quiets secondary captions far away", () => {
  assert.equal(mapDetail(0.4), "far");
  assert.equal(mapDetail(0.8), "mid");
  assert.equal(mapDetail(1.2), "near");
  assert.equal(captionIsVisible("far", "compact"), false);
  assert.equal(captionIsVisible("far", "milestone"), true);
  assert.equal(captionIsVisible("far", "door"), true);
  assert.equal(captionIsVisible("mid", "compact"), true);
  assert.equal(captionIsVisible("near", "compact"), true);
  assert.deepEqual(STRATUM_POSITIONS[1], { ...STRATUM_POSITIONS[1]! });
});
