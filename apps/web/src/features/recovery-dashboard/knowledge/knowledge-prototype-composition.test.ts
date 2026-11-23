import assert from "node:assert/strict";
import { test } from "node:test";
import { frameMapBounds } from "./knowledge-prototype-camera.js";
import {
  CLUSTER_TITLE_BOX,
  circleHitsRect,
  introSafeRect,
  placeClusterTitles,
  prototypeDiscPixels,
  rectsOverlap,
  shiftCameraClearOf,
  type ClearanceNode,
} from "./knowledge-prototype-composition.js";
import { KNOWLEDGE_PROTOTYPE_NODES } from "./knowledge-prototype-fixture.js";
import { PRESENTATION_HEIGHT, PRESENTATION_WIDTH, STRATUM_POSITIONS } from "./knowledge-prototype-presentation.js";

function clearance(sequences: readonly number[], state = "discovered"): ClearanceNode[] {
  return sequences.map((sequence) => {
    const node = KNOWLEDGE_PROTOTYPE_NODES.find((item) => item.sequence === sequence)!;
    const point = STRATUM_POSITIONS[sequence]!;
    return {
      sequence,
      x: point.x,
      y: point.y,
      r: prototypeDiscPixels(node) / 2,
      role: node.visualRole,
      state,
    };
  });
}

const world = { width: PRESENTATION_WIDTH, height: PRESENTATION_HEIGHT };

test("the opening frame moves the first discs out of the intro block", () => {
  for (const viewport of [
    { width: 1368, height: 820 },
    { width: 1012, height: 820 },
  ]) {
    const intro = introSafeRect("desktop", viewport.width);
    const framed = frameMapBounds(
      { minX: 40, minY: 40, maxX: world.width - 40, maxY: world.height - 40 },
      viewport,
      world,
      1,
    );
    const nodes = clearance([1, 2, 3, 4]);
    const shifted = shiftCameraClearOf(framed, viewport, world, intro, nodes);
    for (const node of nodes) {
      const cx = shifted.x + node.x * shifted.scale;
      const cy = shifted.y + node.y * shifted.scale;
      assert.equal(
        circleHitsRect(cx, cy, node.r * shifted.scale, intro, 12),
        false,
        `F00.${String(node.sequence).padStart(2, "0")} still meets the intro at ${viewport.width}`,
      );
    }
  }
});

test("a clear camera is left on its framed point", () => {
  const viewport = { width: 1368, height: 820 };
  const intro = introSafeRect("desktop");
  const framed = frameMapBounds({ minX: 40, minY: 40, maxX: world.width - 40, maxY: world.height - 40 }, viewport, world, 1);
  const shifted = shiftCameraClearOf(framed, viewport, world, intro, []);
  assert.equal(shifted.x, framed.x);
  assert.equal(shifted.y, framed.y);
});

test("constellation titles skip a candidate that covers a disc or a caption", () => {
  const camera = { x: 180, y: 40, scale: 0.62 };
  const viewport = { width: 1368, height: 820 };
  const nodes = clearance([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 28]);
  const placed = placeClusterTitles(camera, viewport, nodes, [introSafeRect("desktop")]);
  for (const cluster of [1, 2, 3, 4] as const) {
    const title = {
      x: placed[cluster].left,
      y: placed[cluster].top,
      width: CLUSTER_TITLE_BOX[cluster].width,
      height: CLUSTER_TITLE_BOX[cluster].height,
    };
    assert.ok(title.x >= 8 && title.y >= 8, `cluster ${cluster} leaves the viewport`);
    assert.ok(title.x + title.width <= viewport.width - 8, `cluster ${cluster} touches the right edge`);
    for (const node of nodes) {
      const cx = camera.x + node.x * camera.scale;
      const cy = camera.y + node.y * camera.scale;
      assert.equal(circleHitsRect(cx, cy, node.r * camera.scale, title, 8), false, `cluster ${cluster} covers ${node.sequence}`);
    }
    assert.equal(rectsOverlap(title, introSafeRect("desktop"), 8), false, `cluster ${cluster} covers the intro`);
  }
});
