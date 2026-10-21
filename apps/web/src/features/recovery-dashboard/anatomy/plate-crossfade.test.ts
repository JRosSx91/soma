import assert from "node:assert/strict";
import { test } from "node:test";
import {
  applyCrossfadeOpacities,
  beginPlateCrossfade,
  crossfadeOpacities,
  PLATE_CROSSFADE_MS,
  settlePlateLayers,
  type PlateLayer,
} from "./plate-crossfade.ts";

const master = "/images/anatomy/body-master-anterior.png";
const respiratory = "/images/anatomy/respiratory-highlight-anterior.png";

test("opacity reaches the midpoint halfway through the fade", () => {
  assert.deepEqual(crossfadeOpacities(0, PLATE_CROSSFADE_MS), {
    outgoing: 1,
    incoming: 0,
    done: false,
  });
  const mid = crossfadeOpacities(PLATE_CROSSFADE_MS / 2, PLATE_CROSSFADE_MS);
  assert.equal(mid.outgoing, 0.5);
  assert.equal(mid.incoming, 0.5);
  assert.equal(mid.done, false);
  assert.equal(crossfadeOpacities(PLATE_CROSSFADE_MS, PLATE_CROSSFADE_MS).done, true);
});

test("a crossfade keeps the outgoing plate until it is settled", () => {
  const start: PlateLayer[] = [{ id: 1, src: master, opacity: 1 }];
  const fading = beginPlateCrossfade(start, respiratory, 2, false);
  const mid = applyCrossfadeOpacities(fading, 2, 0.5, 0.5);
  assert.deepEqual(
    mid.map((layer) => [layer.src, layer.opacity]),
    [
      [master, 0.5],
      [respiratory, 0.5],
    ],
  );
  assert.deepEqual(settlePlateLayers(mid, 2), [{ id: 2, src: respiratory, opacity: 1 }]);
});

test("switching back before the fade settles does not keep both plates", () => {
  const start: PlateLayer[] = [{ id: 1, src: master, opacity: 1 }];
  const halfway = applyCrossfadeOpacities(beginPlateCrossfade(start, respiratory, 2, false), 2, 0.4, 0.6);
  const back = beginPlateCrossfade(halfway, master, 3, false);
  assert.deepEqual(
    back.map((layer) => [layer.src, layer.opacity]),
    [
      [respiratory, 0.6],
      [master, 0],
    ],
  );
  assert.deepEqual(settlePlateLayers(back, 3), [{ id: 3, src: master, opacity: 1 }]);
});

test("reduced motion replaces the plate without an outgoing layer", () => {
  const start: PlateLayer[] = [{ id: 1, src: master, opacity: 1 }];
  assert.deepEqual(beginPlateCrossfade(start, respiratory, 2, true), [
    { id: 2, src: respiratory, opacity: 1 },
  ]);
});
