import { useEffect, useState } from 'react';
import { fetchSubstances } from './substances.js';
import type { ApiSubstance } from '../../shared/api/types.js';

interface UseSubstancesState {
  data: ApiSubstance[] | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Loads the substance catalog once on mount.
 *
 * Intentionally minimal. No revalidation, no manual refetch trigger,
 * no global cache. The catalog is static seed data — there's nothing
 * to invalidate during a session.
 *
 * If we later need cross-component sharing without prop drilling,
 * lift this into a React Context or move to TanStack Query.
 */
export function useSubstances(): UseSubstancesState {
  const [state, setState] = useState<UseSubstancesState>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

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
  }, []);

  return state;
}