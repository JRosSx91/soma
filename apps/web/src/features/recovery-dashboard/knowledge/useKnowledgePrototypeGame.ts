import { useCallback, useEffect, useMemo, useState } from "react";
import type { KnowledgeConceptId } from "./knowledge-types.js";
import type { PrototypeUpgradeId } from "./knowledge-prototype-game-config.js";
import {
  canPurchaseDiscovery,
  createInitialPrototypeGameState,
  derivePrototypeGameView,
  reducePrototypeGame,
  upgradeOffers,
  type PrototypeGameError,
  type PrototypeGameState,
} from "./knowledge-prototype-game-engine.js";

export function useKnowledgePrototypeGame() {
  const [state, setState] = useState<PrototypeGameState>(() => createInitialPrototypeGameState(Date.now()));
  const [lastError, setLastError] = useState<PrototypeGameError | null>(null);

  const apply = useCallback((action: Parameters<typeof reducePrototypeGame>[1]) => {
    setState((current) => {
      const result = reducePrototypeGame(current, action);
      if (result.error && result.error !== "rate_limited") {
        setLastError(result.error);
      }
      return result.state;
    });
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setState((current) => reducePrototypeGame(current, { type: "tick", now: Date.now() }).state);
    }, 250);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (state.discoveryPulse === 0) return undefined;
    const timeout = window.setTimeout(() => {
      setState((current) => reducePrototypeGame(current, { type: "clear_discovery_pulse" }).state);
    }, 2200);
    return () => window.clearTimeout(timeout);
  }, [state.discoveryPulse]);

  const view = useMemo(() => derivePrototypeGameView(state), [state]);
  const upgrades = useMemo(() => upgradeOffers(state), [state]);

  const canDiscoverConcept = useCallback(
    (conceptId: KnowledgeConceptId) => canPurchaseDiscovery(state, conceptId),
    [state],
  );

  return {
    ...view,
    upgrades,
    lastError,
    canDiscoverConcept,
    analyze: () => apply({ type: "manual_analyze", now: Date.now() }),
    buyUpgrade: (upgradeId: PrototypeUpgradeId) => apply({ type: "buy_upgrade", upgradeId, now: Date.now() }),
    discover: (conceptId: KnowledgeConceptId) => apply({ type: "discover", conceptId, now: Date.now() }),
    reset: () => apply({ type: "reset", now: Date.now() }),
  };
}