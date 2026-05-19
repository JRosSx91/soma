import { useEffect, useState, useCallback } from 'react';
import { apiRequest } from '../../auth/client/api.js';
import type { ComposedNTState } from '../types.js';

interface UseNeurotransmitterStateResult {
  entries: ComposedNTState[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useNeurotransmitterState(): UseNeurotransmitterStateResult {
  const [entries, setEntries] = useState<ComposedNTState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<ComposedNTState[]>(
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