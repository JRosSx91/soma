import { useState } from 'react';
import type { OrganId } from '@soma/shared-types';
import { useOrganStates, MOCK_PROFILE } from './features/profile/index.js';
import { BodyDiagram } from './features/body-diagram/index.js';
import type { OrganStateMap } from './features/body-diagram/index.js';

function App() {
  const { states, loading, error, profile } = useOrganStates(MOCK_PROFILE);
  const [hovered, setHovered] = useState<OrganId | null>(null);

  // Convert OrganState map to the OrganStateMap shape the diagram expects.
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
        {/* Body diagram — central, takes 2/3 of width */}
        <section className="col-span-8 bg-soma-bg-surface border border-soma-border-subtle rounded p-6 flex items-center justify-center">
          {loading && <p className="text-soma-fg-secondary">Loading...</p>}
          {error && <p className="text-soma-organ-damaged">{error.message}</p>}
          {!loading && !error && (
            <BodyDiagram
              biologicalSex={profile.biologicalSex}
              view="front"
              organStates={organStates}
              highlightedOrganId={hovered}
              onOrganHover={setHovered}
            />
          )}
        </section>

        {/* Side panel — info on hovered organ */}
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
                Affected by: <span className="text-soma-fg-secondary capitalize">{states.get(hovered)!.dominantSubstanceId}</span>
              </p>
              <p className="text-soma-fg-muted">
                Days abstinent: <span className="text-soma-fg-secondary tabular-nums">{Math.floor(states.get(hovered)!.daysAbstinent)}</span>
              </p>
              <p className="text-soma-fg-muted">
                Recovery: <span className="text-soma-accent tabular-nums">{(states.get(hovered)!.progressFraction * 100).toFixed(1)}%</span>
              </p>
              <span
                className="inline-block px-2 py-0.5 rounded text-xs mt-2"
                style={{
                  backgroundColor: `var(--soma-confidence-${states.get(hovered)!.confidenceLevel})`,
                  color: 'var(--soma-bg-base)',
                }}
              >
                {states.get(hovered)!.confidenceLevel} confidence
              </span>
            </div>
          )}
          {!hovered && (
            <p className="text-soma-fg-muted text-sm">
              Move your cursor over a colored organ to see details.
            </p>
          )}
        </aside>
      </main>
    </div>
  );
}

export default App;