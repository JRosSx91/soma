import { useCallback, useEffect, useState } from "react";
import { fetchSubstances } from "./substances.js";
import type { ApiSubstance } from "../../shared/api/types.js";

interface UseSubstancesState {
  data: ApiSubstance[] | null;
  loading: boolean;
  error: Error | null;
  /** User-initiated refetch. Does not loop on its own. */
  retry: () => void;
}

/**
 * Loads the substance catalog once on mount, and again when `retry` runs.
 *
 * Intentionally minimal. No revalidation, no global cache, no auto-retry.
 * The catalog is static seed data — there's nothing to invalidate during
 * a session besides recovering from a failed fetch.
 */
export function useSubstances(): UseSubstancesState {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<
    Pick<UseSubstancesState, "data" | "loading" | "error">
  >({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    fetchSubstances()
      .then((data) => {
        if (!cancelled) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setState({ data: null, loading: false, error });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setAttempt((current) => current + 1);
  }, []);

  return { ...state, retry };
}
