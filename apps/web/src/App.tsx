import { useOrganStates, MOCK_PROFILE } from './features/profile/index.js';

function App() {
  const { states, loading, error, profile } = useOrganStates(MOCK_PROFILE);

  // Sort organs by progressFraction asc — most damaged shown first.
  const sortedStates = Array.from(states.values()).sort(
    (a, b) => a.progressFraction - b.progressFraction,
  );

  return (
    <div className="min-h-screen bg-soma-bg-base text-soma-fg-primary p-8">
      <header className="border-b border-soma-border-subtle pb-4 mb-8">
        <h1 className="text-3xl font-light tracking-wide">Soma</h1>
        <p className="text-sm text-soma-fg-muted mt-1">
          Profile + recovery state preview
        </p>
      </header>

      <section className="max-w-4xl space-y-8">
        <div className="bg-soma-bg-surface border border-soma-border-subtle rounded p-4">
          <h2 className="text-soma-fg-secondary text-sm uppercase tracking-wider mb-3">
            Profile
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-soma-fg-muted">Name: </span>
              <span className="text-soma-fg-primary">{profile.displayName}</span>
            </div>
            <div>
              <span className="text-soma-fg-muted">Sex: </span>
              <span className="text-soma-fg-primary">{profile.biologicalSex}</span>
            </div>
            <div>
              <span className="text-soma-fg-muted">Born: </span>
              <span className="text-soma-fg-primary">{profile.birthYear}</span>
            </div>
            <div>
              <span className="text-soma-fg-muted">Weight: </span>
              <span className="text-soma-fg-primary">{profile.weightKg ?? '—'} kg</span>
            </div>
          </div>
          <h3 className="text-soma-fg-secondary text-sm uppercase tracking-wider mt-4 mb-2">
            Substances in abstinence
          </h3>
          <ul className="text-sm space-y-1">
            {profile.usages.map((u) => {
              const days = Math.floor(
                (Date.now() - new Date(u.lastUseDate).getTime()) / (24 * 60 * 60 * 1000),
              );
              return (
                <li key={u.substanceId} className="flex justify-between">
                  <span className="text-soma-fg-primary capitalize">{u.substanceId}</span>
                  <span className="text-soma-fg-muted tabular-nums">{days} days clean</span>
                </li>
              );
            })}
          </ul>
        </div>

        {loading && (
          <p className="text-soma-fg-secondary">Loading recovery state…</p>
        )}

        {error && (
          <div className="bg-soma-bg-surface border border-soma-organ-damaged p-4 rounded">
            <p className="text-soma-fg-primary">Failed to compute recovery state</p>
            <p className="text-sm text-soma-fg-muted mt-1">{error.message}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="bg-soma-bg-surface border border-soma-border-subtle rounded p-4">
            <h2 className="text-soma-fg-secondary text-sm uppercase tracking-wider mb-3">
              Organ states
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-soma-border-subtle">
                  <th className="py-2 pr-4 font-medium text-soma-fg-muted">Organ</th>
                  <th className="py-2 pr-4 font-medium text-soma-fg-muted">Dominant substance</th>
                  <th className="py-2 pr-4 font-medium text-soma-fg-muted text-right">Days abst.</th>
                  <th className="py-2 pr-4 font-medium text-soma-fg-muted text-right">Progress</th>
                  <th className="py-2 pr-4 font-medium text-soma-fg-muted text-right">Absolute</th>
                  <th className="py-2 font-medium text-soma-fg-muted">Conf.</th>
                </tr>
              </thead>
              <tbody>
                {sortedStates.map((s) => (
                  <tr
                    key={s.organId}
                    className="border-b border-soma-border-subtle/40"
                  >
                    <td className="py-2 pr-4 text-soma-fg-primary">{s.organName}</td>
                    <td className="py-2 pr-4 text-soma-fg-muted capitalize">
                      {s.dominantSubstanceId}
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums text-soma-fg-secondary">
                      {Math.floor(s.daysAbstinent)}
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums text-soma-accent">
                      {(s.progressFraction * 100).toFixed(1)}%
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums text-soma-fg-secondary">
                      {(s.absoluteRecovery * 100).toFixed(1)}%
                    </td>
                    <td className="py-2 text-xs">
                      <span
                        className="px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: `var(--soma-confidence-${s.confidenceLevel})`,
                          color: 'var(--soma-bg-base)',
                        }}
                      >
                        {s.confidenceLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default App;