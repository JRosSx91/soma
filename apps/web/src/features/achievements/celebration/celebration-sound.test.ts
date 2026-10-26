import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CELEBRATE_SOUND_STORAGE_KEY,
  isCelebrateSoundEnabled,
  playCelebrateChime,
  setCelebrateSoundEnabled,
  type MemoryStorage,
} from "./celebration-sound.js";

function memoryStorage(initial: Record<string, string> = {}): MemoryStorage {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
  };
}

test("celebration sound is off by default", () => {
  const storage = memoryStorage();
  assert.equal(isCelebrateSoundEnabled(storage), false);
  assert.equal(playCelebrateChime(), false);
});

test("the sound preference persists locally once the user enables it", () => {
  const storage = memoryStorage();
  setCelebrateSoundEnabled(true, storage);
  assert.equal(storage.getItem(CELEBRATE_SOUND_STORAGE_KEY), "1");
  assert.equal(isCelebrateSoundEnabled(storage), true);
  setCelebrateSoundEnabled(false, storage);
  assert.equal(isCelebrateSoundEnabled(storage), false);
});
