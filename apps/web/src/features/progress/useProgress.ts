import { useCallback, useEffect, useRef, useState } from "react";
import type { ProgressTitleId } from "@soma/shared-types";
import { fetchMyProgress, patchEquippedTitle } from "./progress-api.js";
import { buildDemoProgress, DEMO_PROGRESS } from "./progress-demo.js";
import { equipProgressView, type ProgressView } from "./progress-model.js";

export type ProgressLoadState = "loading" | "ready" | "error";

export interface ProgressHookState {
  live: boolean;
  state: ProgressLoadState;
  progress: ProgressView | null;
  /** GET /me/progress failure. Independent from title PATCH. */
  error: string | null;
  /** PATCH /me/progress failure. Never clears loaded progress. */
  equipError: string | null;
  updatingTitle: boolean;
  reload: () => void;
  equipTitle: (titleId: ProgressTitleId) => Promise<void>;
}

/**
 * LIVE (`live: true`) reads GET /me/progress. DEMO never calls the API.
 * A LIVE error stays empty — it does not fall back to the DEMO fixture.
 */
export function useProgress(options: {
  live: boolean;
  userId: string | null;
}): ProgressHookState {
  const { live, userId } = options;
  const [state, setState] = useState<ProgressLoadState>(live ? "loading" : "ready");
  const [progress, setProgress] = useState<ProgressView | null>(
    live ? null : DEMO_PROGRESS,
  );
  const [error, setError] = useState<string | null>(null);
  const [equipError, setEquipError] = useState<string | null>(null);
  const [updatingTitle, setUpdatingTitle] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const progressRef = useRef(progress);
  const updatingRef = useRef(false);
  progressRef.current = progress;

  useEffect(() => {
    if (!live) {
      setState("ready");
      setProgress(buildDemoProgress());
      setError(null);
      setEquipError(null);
      return;
    }
    if (!userId) {
      setState("ready");
      setProgress(null);
      setError(null);
      setEquipError(null);
      return;
    }

    let cancelled = false;
    setState("loading");
    setError(null);
    void fetchMyProgress()
      .then((row) => {
        if (cancelled) return;
        setProgress(row);
        setState("ready");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setProgress(null);
        setState("error");
        setError(err instanceof Error ? err.message : "progress load failed");
      });

    return () => {
      cancelled = true;
    };
  }, [live, userId, reloadToken]);

  const reload = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!live || !userId) return;
    const onFocus = () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }
      setReloadToken((value) => value + 1);
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [live, userId]);

  const equipTitle = useCallback(
    async (titleId: ProgressTitleId) => {
      const current = progressRef.current;
      if (current?.equippedTitleId === titleId) return;
      if (!live) {
        setProgress((row) => (row ? equipProgressView(row, titleId) : buildDemoProgress(titleId)));
        setEquipError(null);
        return;
      }
      if (updatingRef.current) return;
      updatingRef.current = true;
      setUpdatingTitle(true);
      setEquipError(null);
      try {
        const row = await patchEquippedTitle(titleId);
        setProgress(row);
        setEquipError(null);
        setState("ready");
      } catch (err: unknown) {
        setEquipError(err instanceof Error ? err.message : "progress update failed");
        throw err;
      } finally {
        updatingRef.current = false;
        setUpdatingTitle(false);
      }
    },
    [live],
  );

  return {
    live,
    state,
    progress,
    error,
    equipError,
    updatingTitle,
    reload,
    equipTitle,
  };
}
