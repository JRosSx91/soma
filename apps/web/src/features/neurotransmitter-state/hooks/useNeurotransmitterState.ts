import { useEffect, useState, useCallback } from 'react';
import { apiRequest } from '../../auth/client/api.js';
import type { NeurotransmitterStateEntry } from '../types.js';

interface UseNeurotransmitterStateResult {
  entries: NeurotransmitterStateEntry[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Loads the current neurotransmitter state for the authenticated user.
 *
 * Refreshes on demand via `refresh()`. Doesn't refresh on its own —
 * the underlying state changes slowly (one phase transition per
 * substance over weeks) so re-querying on a timer would waste cycles.
 * Components that need freshness can call refresh() after a known
 * profile change (e.g. after the user edits their substances).
 */
export function useNeurotransmitterState(): UseNeurotransmitterStateResult {
  const [entries, setEntries] = useState<NeurotransmitterStateEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<NeurotransmitterStateEntry[]>(
        '/me/neurotransmitter-state',
      );
      setEntries(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load neurotransmitter state',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { entries, loading, error, refresh };
}