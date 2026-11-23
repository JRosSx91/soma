import assert from "node:assert/strict";
import { test } from "node:test";
import {
  MAP_CAMERA_MAX_SCALE,
  MAP_CAMERA_MIN_SCALE,
  clampMapCamera,
  frameMapBounds,
  frameMapCamera,
  holdMapFocus,
  mapPointInView,
  zoomMapCamera,
} from "./knowledge-prototype-camera.js";

const viewport = { width: 800, height: 480 };
const world = { width: 1000, height: 2400 };

test("the camera frames a node inside the viewport and stays bounded", () => {
  const framed = frameMapCamera({ x: 520, y: 311 }, viewport, world, 1);
  assert.ok(framed.x < viewport.width / 2);
  assert.ok(framed.y < viewport.height / 2);
  const escaped = clampMapCamera({ x: 4000, y: -4000, scale: 9 }, viewport, world);
  assert.equal(escaped.scale, MAP_CAMERA_MAX_SCALE);
  assert.ok(escaped.x <= 72);
  assert.ok(escaped.y <= 72);
  const tiny = clampMapCamera({ x: 0, y: 0, scale: 0.01 }, viewport, world);
  assert.equal(tiny.scale, MAP_CAMERA_MIN_SCALE);
});

test("zooming keeps the anchor point stable and does not invent a pan by itself", () => {
  const start = frameMapCamera({ x: 200, y: 200 }, viewport, world, 1);
  const anchor = { x: 400, y: 240 };
  const worldX = (anchor.x - start.x) / start.scale;
  const worldY = (anchor.y - start.y) / start.scale;
  const zoomed = zoomMapCamera(start, viewport, world, anchor, -1);
  assert.ok(zoomed.scale > start.scale);
  assert.ok(Math.abs(anchor.x - (zoomed.x + worldX * zoomed.scale)) < 1.5);
  assert.ok(Math.abs(anchor.y - (zoomed.y + worldY * zoomed.scale)) < 1.5);
  assert.deepEqual(zoomMapCamera(start, viewport, world, anchor, 0), start);
});

test("resizing the viewport keeps the same world point centered", () => {
  const start = frameMapCamera({ x: 400, y: 300 }, { width: 1000, height: 600 }, world, 1);
  const worldX = (500 - start.x) / start.scale;
  const worldY = (300 - start.y) / start.scale;
  const held = holdMapFocus(start, { width: 1000, height: 600 }, { width: 700, height: 600 }, world);
  assert.equal(held.scale, start.scale);
  assert.ok(Math.abs(worldX - ((350 - held.x) / held.scale)) < 1.5);
  assert.ok(Math.abs(worldY - ((300 - held.y) / held.scale)) < 1.5);
});

test("a constellation frame fits the box and a visible node does not pull the camera", () => {
  const phone = { width: 360, height: 520 };
  const map = { width: 1760, height: 1500 };
  const framed = frameMapBounds({ minX: 40, minY: 20, maxX: 680, maxY: 520 }, phone, map, 1.05);
  assert.ok(framed.scale <= 1.05);
  assert.ok(framed.scale >= MAP_CAMERA_MIN_SCALE);
  const center = { x: 360, y: 270 };
  assert.equal(mapPointInView(center, framed, phone, 24), true);
  assert.equal(mapPointInView({ x: 20, y: 20 }, framed, phone), false);
  const readable = frameMapBounds({ minX: 0, minY: 0, maxX: 1600, maxY: 1400 }, phone, map, 1.05, 0.72);
  assert.ok(readable.scale >= 0.72);
  assert.ok(readable.scale <= 1.05);
});
