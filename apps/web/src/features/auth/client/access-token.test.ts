import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  LEGACY_TOKEN_STORAGE_KEY,
  bumpSessionEpoch,
  clearAccessToken,
  clearLegacyAuthStorage,
  getAccessToken,
  getSessionEpoch,
  setAccessToken,
} from "./access-token.js";

beforeEach(() => {
  clearAccessToken();
  bumpSessionEpoch();
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch {
    // Node may lack storage; tests that need it polyfill below.
  }
});

function ensureStorage() {
  if (typeof globalThis.localStorage === "undefined") {
    const store = new Map<string, string>();
    const storage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, String(v));
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
      clear: () => store.clear(),
    };
    Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });
    Object.defineProperty(globalThis, "sessionStorage", {
      value: { ...storage, clear: () => store.clear(), getItem: storage.getItem, setItem: storage.setItem, removeItem: storage.removeItem },
      configurable: true,
    });
  }
}

test("access token lives only in memory", () => {
  ensureStorage();
  setAccessToken("jwt-abc");
  assert.equal(getAccessToken(), "jwt-abc");
  assert.equal(localStorage.getItem(LEGACY_TOKEN_STORAGE_KEY), null);
  assert.equal(sessionStorage.getItem(LEGACY_TOKEN_STORAGE_KEY), null);
});

test("clearAccessToken removes the in-memory JWT", () => {
  setAccessToken("jwt-abc");
  clearAccessToken();
  assert.equal(getAccessToken(), null);
});

test("clearLegacyAuthStorage removes soma.auth.token without minting a session", () => {
  ensureStorage();
  localStorage.setItem(LEGACY_TOKEN_STORAGE_KEY, "legacy-jwt");
  clearLegacyAuthStorage();
  assert.equal(localStorage.getItem(LEGACY_TOKEN_STORAGE_KEY), null);
  assert.equal(getAccessToken(), null);
});

test("bumpSessionEpoch clears access and advances epoch", () => {
  const before = getSessionEpoch();
  setAccessToken("jwt");
  const next = bumpSessionEpoch();
  assert.equal(getAccessToken(), null);
  assert.equal(next, before + 1);
  assert.equal(getSessionEpoch(), next);
});
