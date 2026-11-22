import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KnowledgeConceptId } from "./knowledge-types.js";
import type { PrototypeGeneratorId } from "./knowledge-prototype-game-config.js";
import {
  canPurchaseDiscovery,
  createInitialPrototypeGameState,
  derivePrototypeGameView,
  reducePrototypeGame,
  type PrototypeGameError,
  type PrototypeGameState,
} from "./knowledge-prototype-game-engine.js";
import { clearPrototypeEconomy, loadPrototypeEconomy, savePrototypeEconomy } from "./knowledge-prototype-save.js";

const QUIET_ERRORS = new Set<PrototypeGameError>(["rate_limited", "clock_regressed"]);

export function useKnowledgePrototypeGame() {
  const [state, setState] = useState<PrototypeGameState>(() => {
    const now = Date.now();
    const loaded = loadPrototypeEconomy();
    const base = loaded ?? createInitialPrototypeGameState(now);
    return reducePrototypeGame(base, { type: "tick", now }).state;
  });
  const [lastError, setLastError] = useState<PrototypeGameError | null>(null);
  const pendingTaps = useRef(0);
  const frame = useRef<number | null>(null);

  const apply = useCallback((action: Parameters<typeof reducePrototypeGame>[1]) => {
    setState((current) => {
      const result = reducePrototypeGame(current, action);
      if (result.error && !QUIET_ERRORS.has(result.error)) setLastError(result.error);
      return result.state;
    });
  }, []);

  const queueTap = useCallback(() => {
    pendingTaps.current += 1;
    if (frame.current !== null) return;
    const flush = () => {
      const count = pendingTaps.current;
      pendingTaps.current = 0;
      frame.current = null;
      if (count > 0) apply({ type: "tap", count, now: Date.now() });
    };
    if (typeof requestAnimationFrame === "function") {
      frame.current = requestAnimationFrame(flush);
    } else {
      flush();
    }
  }, [apply]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setState((current) => reducePrototypeGame(current, { type: "tick", now: Date.now() }).state);
    }, 250);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    savePrototypeEconomy(state);
  }, [state]);

  useEffect(() => {
    if (state.discoveryPulse === 0) return undefined;
    const timeout = window.setTimeout(() => {
      setState((current) => reducePrototypeGame(current, { type: "clear_discovery_pulse" }).state);
    }, 2200);
    return () => window.clearTimeout(timeout);
  }, [state.discoveryPulse]);

  useEffect(() => () => {
    if (frame.current !== null && typeof cancelAnimationFrame === "function") {
      cancelAnimationFrame(frame.current);
    }
  }, []);

  const view = useMemo(() => derivePrototypeGameView(state), [state]);

  const canDiscoverConcept = useCallback(
    (conceptId: KnowledgeConceptId) => canPurchaseDiscovery(state, conceptId),
    [state],
  );

  return {
    ...view,
    lastError,
    canDiscoverConcept,
    queueTap,
    buyManual: () => apply({ type: "buy_manual", now: Date.now() }),
    buyGenerator: (generatorId: PrototypeGeneratorId) => apply({ type: "buy_generator", generatorId, now: Date.now() }),
    discover: (conceptId: KnowledgeConceptId) => apply({ type: "discover", conceptId, now: Date.now() }),
    reset: () => {
      clearPrototypeEconomy();
      apply({ type: "reset", now: Date.now() });
    },
  };
}
