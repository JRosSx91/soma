import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../../auth/client/api.js";
import type { UserProfileResponse } from "../../profile/hooks/useUserProfile.js";

interface LiveProfileState {
  profile: UserProfileResponse | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Loads GET /me/profile only when a user id is present.
 * A null id fetches nothing and clears any previous payload, so a public
 * visit or logout cannot keep another person's rows in memory.
 */
export function useLiveProfile(userId: string | null): LiveProfileState {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [request, setRequest] = useState(0);

  const reload = useCallback(() => setRequest((value) => value + 1), []);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setProfile(null);
    setError(null);
    setLoading(true);

    apiRequest<UserProfileResponse>("/me/profile")
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setProfile(null);
        setError(
          err instanceof Error ? err.message : "No se ha podido cargar el perfil.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, request]);

  return { profile, loading, error, reload };
}
