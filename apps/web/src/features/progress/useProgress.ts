import { useCallback, useEffect, useState } from "react";
import type { ProgressTitleId } from "@soma/shared-types";
import { fetchMyProgress, patchEquippedTitle } from "./progress-api.js";
import { buildDemoProgress, DEMO_PROGRESS } from "./progress-demo.js";
import { equipProgressView, type ProgressView } from "./progress-model.js";

export type ProgressLoadState = "loading" | "ready" | "error";

export interface ProgressHookState {
  live: boolean;
  state: ProgressLoadState;
  progress: ProgressView | null;
  error: string | null;
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
  const [updatingTitle, setUpdatingTitle] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!live) {
      setState("ready");
      setProgress(buildDemoProgress());
      setError(null);
      return;
    }
    if (!userId) {
      setState("ready");
      setProgress(null);
      setError(null);
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

  const equipTitle = useCallback(
    async (titleId: ProgressTitleId) => {
      if (!live) {
        setProgress((current) =>
          current ? equipProgressView(current, titleId) : buildDemoProgress(titleId),
        );
        return;
      }
      setUpdatingTitle(true);
      setError(null);
      try {
        const row = await patchEquippedTitle(titleId);
        setProgress(row);
        setState("ready");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "progress update failed");
        throw err;
      } finally {
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
    updatingTitle,
    reload,
    equipTitle,
  };
}
