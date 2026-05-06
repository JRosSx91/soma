import { useEffect, useState, useCallback } from 'react';
import { apiRequest } from '../../auth/client/api.js';
import type { OrganNarrativeStateEntry } from '../types.js';

interface UseOrganNarrativeStateResult {
  entries: OrganNarrativeStateEntry[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Loads the narrative state for non-neural organs affected by the
 * authenticated user's tracked substances.
 *
 * Same interaction pattern as useNeurotransmitterState: fetch on
 * mount, refresh on demand. The data changes slowly (one phase
 * transition per substance over weeks) so on-mount fetching is
 * sufficient.
 */
export function useOrganNarrativeState(): UseOrganNarrativeStateResult {
  const [entries, setEntries] = useState<OrganNarrativeStateEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<OrganNarrativeStateEntry[]>(
        '/me/organ-narrative-state',
      );
      setEntries(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load organ narrative state',
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