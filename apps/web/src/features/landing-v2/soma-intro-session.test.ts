import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { afterEach, test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  SOMA_INTRO_SESSION_KEY,
  markLandingV2IntroSeen,
  shouldPlayLandingV2Intro,
} from "./soma-intro-session.js";

/**
 * Mirrors LandingV2Page first-paint flags. `showIntro` must be a boolean so
 * `useState(showIntro)` does not re-invoke a function, and so `!showIntro`
 * means "hero may enter" rather than `!Function`.
 */
function landingV2IntroFirstPaint(accountDeleted: boolean): {
  showIntro: boolean;
  introComplete: boolean;
} {
  const showIntro = !accountDeleted && shouldPlayLandingV2Intro();
  assert.equal(typeof showIntro, "boolean");
  return { showIntro, introComplete: !showIntro };
}

const originalWindow = globalThis.window;
const originalSessionStorage = Object.getOwnPropertyDescriptor(
  globalThis,
  "sessionStorage",
);

function installLandingEnv(options: {
  seen?: boolean;
  reduceMotion?: boolean;
}): Map<string, string> {
  const store = new Map<string, string>();
  if (options.seen) store.set(SOMA_INTRO_SESSION_KEY, "1");

  const storage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
  };

  Object.defineProperty(globalThis, "sessionStorage", {
    value: storage,
    configurable: true,
  });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      matchMedia: (query: string) => ({
        matches:
          Boolean(options.reduceMotion) &&
          query.includes("prefers-reduced-motion: reduce"),
      }),
    },
  });

  return store;
}

afterEach(() => {
  if (originalWindow === undefined) {
    Reflect.deleteProperty(globalThis, "window");
  } else {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
    });
  }
  if (originalSessionStorage) {
    Object.defineProperty(globalThis, "sessionStorage", originalSessionStorage);
  } else {
    Reflect.deleteProperty(globalThis, "sessionStorage");
  }
});

test("LandingV2Page first-paint calls shouldPlayLandingV2Intro()", () => {
  const page = readFileSync(
    fileURLToPath(new URL("./LandingV2Page.tsx", import.meta.url)),
    "utf8",
  );
  assert.match(page, /shouldPlayLandingV2Intro\(\)/);
  assert.equal(page.includes("shouldPlayLandingV2Intro,"), false);
});

test("first visit plays intro and keeps the hero gated until complete", () => {
  installLandingEnv({ seen: false });

  const flags = landingV2IntroFirstPaint(false);
  assert.equal(shouldPlayLandingV2Intro(), true);
  assert.equal(flags.showIntro, true);
  assert.equal(flags.introComplete, false);

  markLandingV2IntroSeen();
  const afterComplete = landingV2IntroFirstPaint(false);
  assert.equal(afterComplete.showIntro, false);
  assert.equal(afterComplete.introComplete, true);
});

test("return visit with intro seen skips overlay and shows the hero immediately", () => {
  installLandingEnv({ seen: true });

  const flags = landingV2IntroFirstPaint(false);
  assert.equal(shouldPlayLandingV2Intro(), false);
  assert.equal(flags.showIntro, false);
  assert.equal(flags.introComplete, true);
});
