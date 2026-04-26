import { useSubstances } from './features/substances/index.js';

function App() {
  const { data, loading, error } = useSubstances();

  return (
    <div className="min-h-screen bg-soma-bg-base text-soma-fg-primary p-8">
      <header className="border-b border-soma-border-subtle pb-4 mb-8">
        <h1 className="text-3xl font-light tracking-wide">Soma</h1>
        <p className="text-sm text-soma-fg-muted mt-1">API connectivity check</p>
      </header>

      {loading && <p className="text-soma-fg-secondary">Loading substances…</p>}

      {error && (
        <div className="bg-soma-bg-surface border border-soma-organ-damaged p-4 rounded">
          <p className="text-soma-fg-primary font-medium">Failed to load substances</p>
          <p className="text-sm text-soma-fg-muted mt-1">{error.message}</p>
        </div>
      )}

      {data && (
        <section className="space-y-4 max-w-2xl">
          <p className="text-soma-fg-secondary">
            Loaded <span className="text-soma-accent">{data.length}</span> substances
            from the API.
          </p>
          <ul className="space-y-2">
            {data.map((substance) => (
              <li
                key={substance.id}
                className="bg-soma-bg-surface border border-soma-border-subtle rounded p-3"
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-soma-fg-primary font-medium">{substance.name}</span>
                  <span className="text-xs text-soma-fg-muted uppercase tracking-wider">
                    {substance.category}
                  </span>
                </div>
                <div className="text-xs text-soma-fg-muted mt-2 flex gap-4">
                  <span>{substance.damageProfiles.length} damage profiles</span>
                  <span>{substance.recoveryCurves.length} recovery curves</span>
                  <span>{substance.achievements.length} achievements</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default App;