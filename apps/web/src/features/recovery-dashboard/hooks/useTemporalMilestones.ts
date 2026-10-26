import { useEffect, useMemo, useRef, useState } from "react";
import {
  nextTemporalMilestones,
  pickFeaturedTemporalMilestone,
  temporalDueSyncKeys,
  upcomingTemporalDues,
} from "@soma/shared-types";
import { achievementSync } from "../../achievements/sync/achievement-sync.js";
import type { DemoSubstance } from "../demo-data.js";
import {
  dashboardUsageFingerprint,
  usagesFromDashboardSubstances,
} from "../dashboard/temporal-usage.js";

const TICK_MS = 30_000;

function readNow(): Date {
  return new Date();
}

function useVisibleNow(enabled: boolean): Date {
  const [now, setNow] = useState(readNow);

  useEffect(() => {
    if (!enabled) return undefined;

    const tick = () => setNow(readNow());
    let intervalId: number | null = null;

    const start = () => {
      if (intervalId != null) return;
      intervalId = window.setInterval(tick, TICK_MS);
    };
    const stop = () => {
      if (intervalId == null) return;
      window.clearInterval(intervalId);
      intervalId = null;
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        tick();
        start();
        return;
      }
      stop();
    };

    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", tick);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", tick);
    };
  }, [enabled]);

  return now;
}

export function useTemporalMilestones(
  substances: readonly DemoSubstance[],
  options: { enabled: boolean; syncUnlocks: boolean },
) {
  const now = useVisibleNow(options.enabled && substances.length > 0);
  const usages = useMemo(() => usagesFromDashboardSubstances(substances), [substances]);
  const states = useMemo(
    () => nextTemporalMilestones({ usages, now }),
    [now, usages],
  );
  const featured = useMemo(() => pickFeaturedTemporalMilestone(states), [states]);
  const fingerprint = dashboardUsageFingerprint(substances);
  const previousDues = useRef(upcomingTemporalDues(states));
  const syncedKeys = useRef(new Set<string>());
  const lastFingerprint = useRef(fingerprint);

  useEffect(() => {
    if (lastFingerprint.current !== fingerprint) {
      lastFingerprint.current = fingerprint;
      syncedKeys.current = new Set();
      previousDues.current = upcomingTemporalDues(states);
      return;
    }

    const reached = temporalDueSyncKeys(previousDues.current, now.getTime());
    previousDues.current = upcomingTemporalDues(states);

    if (!options.syncUnlocks || reached.length === 0) return;

    const fresh = reached.filter((key) => !syncedKeys.current.has(key));
    if (fresh.length === 0) return;
    for (const key of fresh) syncedKeys.current.add(key);
    achievementSync.invalidate();
  }, [fingerprint, now, options.syncUnlocks, states]);

  return { now, states, featured };
}
