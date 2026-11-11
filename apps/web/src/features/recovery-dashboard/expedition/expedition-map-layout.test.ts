import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  EXPEDITION_MAP_HEIGHT,
  EXPEDITION_MAP_SRC,
  EXPEDITION_MAP_WEBP_SRC,
  EXPEDITION_MAP_WIDTH,
  MAP_TRAIL_POINTS,
  nodeIdsForRoute,
  trailLayout,
} from "./expedition-map-layout.ts";
import {
  KNOWLEDGE_MARK_PX,
  knowledgeMark,
  nodeMark,
  perseveranceMark,
} from "./expedition-marks.ts";
import { KNOWLEDGE_NODE_IDS, PERSEVERANCE_NODE_IDS } from "./expedition-model.ts";

const layoutSource = readFileSync(
  new URL("./expedition-map-layout.ts", import.meta.url),
  "utf8",
);
const mapSource = readFileSync(new URL("./ExpeditionMap.tsx", import.meta.url), "utf8");
const modelSource = readFileSync(
  new URL("./expedition-model.ts", import.meta.url),
  "utf8",
);

test("knowledge marks are 36px discs and perseverance has no raster emblem", () => {
  assert.equal(KNOWLEDGE_MARK_PX, 36);
  for (const id of KNOWLEDGE_NODE_IDS) {
    const mark = knowledgeMark(id);
    assert.ok(mark);
    assert.match(mark.src, /192\.webp$/);
    assert.equal(mark.src.includes(".png"), false);
    assert.equal(perseveranceMark(id), null);
    assert.deepEqual(nodeMark(id), mark);
  }
  for (const id of PERSEVERANCE_NODE_IDS) {
    assert.equal(knowledgeMark(id), null);
  }
});

test("perseverance substances map to their approved circular WebP emblems", () => {
  const expected = {
    alcohol: "perseverance-alcohol",
    nicotine: "perseverance-nicotine",
    cannabis: "perseverance-cannabis",
    cocaine: "perseverance-cocaine",
    caffeine: "perseverance-caffeine",
  } as const;
  for (const id of PERSEVERANCE_NODE_IDS) {
    const mark = perseveranceMark(id);
    assert.ok(mark);
    assert.match(mark.src, new RegExp(`${expected[id]}-192\\.webp$`));
    assert.match(mark.srcSet, new RegExp(`${expected[id]}-96\\.webp 96w`));
    assert.equal(mark.src.includes(".png"), false);
    assert.deepEqual(nodeMark(id), mark);
  }
  assert.equal(mapSource.includes("perseverance-alcohol.png"), false);
  assert.match(mapSource, /nodeMark/);
  assert.equal(mapSource.includes("alcohol: Mountain"), false);
});

test("five beacon centres are percentages of the 1672×941 illustration", () => {
  assert.equal(EXPEDITION_MAP_WIDTH, 1672);
  assert.equal(EXPEDITION_MAP_HEIGHT, 941);
  assert.equal(EXPEDITION_MAP_SRC.endsWith("expedition-map.png"), true);
  assert.equal(EXPEDITION_MAP_WEBP_SRC.endsWith("expedition-map.webp"), true);
  assert.equal(MAP_TRAIL_POINTS.length, 5);
  for (const point of MAP_TRAIL_POINTS) {
    assert.ok(point.x > 10 && point.x < 95);
    assert.ok(point.y > 20 && point.y < 75);
    assert.ok(point.label === "above" || point.label === "below");
  }
});

test("knowledge and perseverance share the same five beacon coordinates", () => {
  const knowledge = trailLayout("knowledge");
  const perseverance = trailLayout("perseverance");
  assert.equal(KNOWLEDGE_NODE_IDS.length, 5);
  assert.equal(PERSEVERANCE_NODE_IDS.length, 5);
  assert.deepEqual(
    KNOWLEDGE_NODE_IDS.map((id) => knowledge[id]),
    PERSEVERANCE_NODE_IDS.map((id) => perseverance[id]),
  );
  assert.deepEqual(
    KNOWLEDGE_NODE_IDS.map((id) => knowledge[id]),
    [...MAP_TRAIL_POINTS],
  );
  assert.deepEqual(nodeIdsForRoute("knowledge"), [...KNOWLEDGE_NODE_IDS]);
  assert.deepEqual(nodeIdsForRoute("perseverance"), [...PERSEVERANCE_NODE_IDS]);
});

test("the map has no sixth Start node and no second cyan road", () => {
  assert.equal(KNOWLEDGE_NODE_IDS.includes("start" as never), false);
  assert.equal((PERSEVERANCE_NODE_IDS as readonly string[]).includes("start"), false);
  assert.equal(modelSource.includes('"start"'), false);
  assert.equal(mapSource.includes("nodeStart"), false);
  assert.match(mapSource, /pointer-events-none block h-auto w-full max-w-none/);
  assert.equal(mapSource.includes("object-cover"), true);
  assert.equal(mapSource.includes("preserveAspectRatio"), false);
  assert.equal(mapSource.includes("strokeDasharray"), false);
  assert.equal(layoutSource.includes("mobileLayout"), false);
  assert.equal(layoutSource.includes("smoothPath"), false);
  assert.match(mapSource, /overflow-x-auto/);
  assert.match(mapSource, /EXPEDITION_MAP_WIDTH/);
  assert.match(mapSource, /h-auto w-full/);
  assert.match(mapSource, /-translate-x-1\/2/);
  assert.match(mapSource, /-translate-y-1\/2/);
  assert.match(mapSource, /mapSwipeHint/);
  assert.match(mapSource, /ResizeObserver/);
  assert.match(mapSource, /min-h-11/);
  assert.match(mapSource, /KNOWLEDGE_MARK_PX/);
  assert.match(mapSource, /KNOWLEDGE_MARK_SIZES/);
  assert.match(mapSource, /revealHorizontally/);
  assert.equal(mapSource.includes("scrollIntoView"), false);
});
