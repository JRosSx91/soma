import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { OrganId } from '@soma/shared-types';
import type { UserProfile } from '../features/profile/types.js';
import { useAuth } from '../features/auth/index.js';
import { useUserProfile, useOrganStates, MOCK_PROFILE } from '../features/profile/index.js';
import { BodyDiagram3D } from '../features/body-diagram-3d/index.js';
import type { OrganStateMap } from '../features/body-diagram-3d/index.js';

export function MainPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    profile: serverProfile,
    loading: loadingProfile,
    error: profileError,
  } = useUserProfile();
  const [hovered, setHovered] = useState<OrganId | null>(null);

  // Adapt the backend response into the shape useOrganStates expects.
  // While the server profile is loading, fall back to MOCK_PROFILE so
  // the hook always has a valid profile (hooks can't be called
  // conditionally). The body diagram is hidden during loading anyway.
  const adaptedProfile: UserProfile = useMemo(() => {
    if (!serverProfile) return MOCK_PROFILE;
    return {
      displayName: serverProfile.user.displayName,
      biologicalSex: serverProfile.user.biologicalSex,
      birthYear: serverProfile.user.birthYear,
      weightKg: serverProfile.user.weightKg ?? undefined,
      usages: serverProfile.usages.map((u) => ({
        substanceId: u.substanceId as UserProfile['usages'][number]['substanceId'],
        yearStarted: u.yearStarted,
        lastUseDate: u.lastUseDate,
        frequency: u.frequency,
      })),
    };
  }, [serverProfile]);

  const {
    states,
    loading: loadingStates,
    error: statesError,
    profile: organProfile,
  } = useOrganStates(adaptedProfile);

  const organStates: OrganStateMap = new Map();
  states.forEach((state, organId) => {
    organStates.set(organId, {
      progressFraction: state.progressFraction,
      active: true,
    });
  });

  const loading = loadingProfile || loadingStates;
  const error = profileError ?? statesError?.message ?? null;
  const hasNoUsages = serverProfile && serverProfile.usages.length === 0;

  return (
    <div className="min-h-screen bg-soma-bg-base text-soma-fg-primary">
      <header className="border-b border-soma-border-subtle px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light tracking-wide">Soma</h1>
          <p className="text-xs text-soma-fg-muted mt-1">
            {user?.displayName ?? '—'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/onboarding')}
            className="text-xs text-soma-fg-muted hover:text-soma-fg-secondary transition-colors"
          >
            Edit profile
          </button>
          <button
            onClick={logout}
            className="text-xs text-soma-fg-muted hover:text-soma-fg-secondary transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="grid grid-cols-12 gap-6 p-8 max-w-7xl mx-auto">
        <section className="col-span-8 bg-soma-bg-surface border border-soma-border-subtle rounded p-2 flex items-center justify-center min-h-[600px]">
          {loading && <p className="text-soma-fg-secondary">Loading…</p>}
          {error && <p className="text-soma-organ-damaged">{error}</p>}
          {!loading && !error && hasNoUsages && (
            <div className="text-center px-8 py-12">
              <p className="text-soma-fg-secondary mb-4">
                No substances tracked yet.
              </p>
              <button
                onClick={() => navigate('/onboarding')}
                className="text-soma-accent hover:underline"
              >
                Add your first one →
              </button>
            </div>
          )}
          {!loading && !error && !hasNoUsages && (
            <BodyDiagram3D
              biologicalSex={organProfile.biologicalSex}
              view="front"
              organStates={organStates}
              highlightedOrganId={hovered}
              onOrganHover={setHovered}
            />
          )}
        </section>

        <aside className="col-span-4 bg-soma-bg-surface border border-soma-border-subtle rounded p-6">
          <h2 className="text-soma-fg-secondary text-sm uppercase tracking-wider mb-3">
            {hovered ? 'Selected organ' : 'Hover an organ'}
          </h2>
          {hovered && states.has(hovered) && (
            <div className="space-y-2 text-sm">
              <p className="text-soma-fg-primary text-base">
                {states.get(hovered)!.organName}
              </p>
              <p className="text-soma-fg-muted">
                Affected by:{' '}
                <span className="text-soma-fg-secondary capitalize">
                  {states.get(hovered)!.dominantSubstanceId}
                </span>
              </p>
              <p className="text-soma-fg-muted">
                Days abstinent:{' '}
                <span className="text-soma-fg-secondary tabular-nums">
                  {Math.floor(states.get(hovered)!.daysAbstinent)}
                </span>
              </p>
              <p className="text-soma-fg-muted">
                Recovery:{' '}
                <span className="text-soma-accent tabular-nums">
                  {(states.get(hovered)!.progressFraction * 100).toFixed(1)}%
                </span>
              </p>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}