import { useState } from 'react';
import type { OrganId } from '@soma/shared-types';
import { useOrganStates, MOCK_PROFILE } from './features/profile/index.js';
import { BodyDiagram3D } from './features/body-diagram-3d/index.js';
import type { OrganStateMap } from './features/body-diagram-3d/index.js';

function App() {
  const { states, loading, error, profile } = useOrganStates(MOCK_PROFILE);
  const [hovered, setHovered] = useState<OrganId | null>(null);

  const organStates: OrganStateMap = new Map();
  states.forEach((state, organId) => {
    organStates.set(organId, {
      progressFraction: state.progressFraction,
      active: true,
    });
  });

  return (
    <div className="min-h-screen bg-soma-bg-base text-soma-fg-primary">
      <header className="border-b border-soma-border-subtle px-8 py-4">
        <h1 className="text-2xl font-light tracking-wide">Soma</h1>
        <p className="text-xs text-soma-fg-muted mt-1">{profile.displayName}</p>
      </header>

      <main className="grid grid-cols-12 gap-6 p-8 max-w-7xl mx-auto">
        {/* 3D body diagram */}
        <section className="col-span-8 bg-soma-bg-surface border border-soma-border-subtle rounded p-2 flex items-center justify-center">
          {loading && <p className="text-soma-fg-secondary">Loading...</p>}
          {error && <p className="text-soma-organ-damaged">{error.message}</p>}
          {!loading && !error && (
            <BodyDiagram3D
              biologicalSex={profile.biologicalSex}
              view="front"
              organStates={organStates}
              highlightedOrganId={hovered}
              onOrganHover={setHovered}
            />
          )}
        </section>

        {/* Side panel */}
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

export default App;