import { PROTOTYPE_SAVE_KEY } from "./knowledge-prototype-game-config.js";
import {
  prototypeStateFromDocument,
  prototypeStateToDocument,
  type PrototypeGameState,
} from "./knowledge-prototype-game-engine.js";

/**
 * DEV prototype ledger only. The key is namespaced so product accounts and
 * recovery records never read it. A failed or outdated document is discarded
 * and the caller starts a fresh bench save.
 */
function browserStorage(): Storage | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage;
  } catch {
    return null;
  }
}

export function loadPrototypeEconomy(): PrototypeGameState | null {
  const storage = browserStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(PROTOTYPE_SAVE_KEY);
    if (!raw) return null;
    return prototypeStateFromDocument(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function savePrototypeEconomy(state: PrototypeGameState) {
  const storage = browserStorage();
  if (!storage) return;
  try {
    storage.setItem(PROTOTYPE_SAVE_KEY, JSON.stringify(prototypeStateToDocument(state)));
  } catch {
    // A full private store must not break the playable bench.
  }
}

export function clearPrototypeEconomy() {
  const storage = browserStorage();
  if (!storage) return;
  try {
    storage.removeItem(PROTOTYPE_SAVE_KEY);
  } catch {
    // Ignore a storage that cannot be written during teardown.
  }
}
