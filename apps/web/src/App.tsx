function App() {
  return (
    <div className="min-h-screen bg-soma-bg-base text-soma-fg-primary p-8">
      <header className="border-b border-soma-border-subtle pb-4 mb-8">
        <h1 className="text-3xl font-light tracking-wide">Soma</h1>
        <p className="text-sm text-soma-fg-muted mt-1">Design tokens preview</p>
      </header>

      <section className="space-y-6 max-w-2xl">
        <div className="bg-soma-bg-surface p-4 rounded border border-soma-border-subtle">
          <h2 className="text-lg text-soma-fg-secondary mb-2">Surfaces</h2>
          <div className="flex gap-2">
            <div className="flex-1 h-12 bg-soma-bg-base border border-soma-border-default rounded flex items-center justify-center text-xs text-soma-fg-muted">base</div>
            <div className="flex-1 h-12 bg-soma-bg-surface border border-soma-border-default rounded flex items-center justify-center text-xs text-soma-fg-muted">surface</div>
            <div className="flex-1 h-12 bg-soma-bg-elevated border border-soma-border-default rounded flex items-center justify-center text-xs text-soma-fg-muted">elevated</div>
          </div>
        </div>

        <div className="bg-soma-bg-surface p-4 rounded border border-soma-border-subtle">
          <h2 className="text-lg text-soma-fg-secondary mb-2">Organ state gradient</h2>
          <div className="flex gap-2">
            <div className="flex-1 h-12 rounded flex items-center justify-center text-xs" style={{ backgroundColor: 'var(--soma-organ-damaged)', color: 'var(--soma-bg-base)' }}>damaged</div>
            <div className="flex-1 h-12 rounded flex items-center justify-center text-xs" style={{ backgroundColor: 'var(--soma-organ-mid)', color: 'var(--soma-bg-base)' }}>mid</div>
            <div className="flex-1 h-12 rounded flex items-center justify-center text-xs" style={{ backgroundColor: 'var(--soma-organ-healthy)', color: 'var(--soma-bg-base)' }}>healthy</div>
          </div>
        </div>

        <div className="bg-soma-bg-surface p-4 rounded border border-soma-border-subtle">
          <h2 className="text-lg text-soma-fg-secondary mb-2">Typography</h2>
          <p className="text-soma-fg-primary">Primary text — full weight, used for body content.</p>
          <p className="text-soma-fg-secondary mt-1">Secondary text — slightly muted, for supporting copy.</p>
          <p className="text-soma-fg-muted mt-1">Muted text — low priority, captions, hints.</p>
        </div>

        <div className="bg-soma-bg-surface p-4 rounded border border-soma-border-subtle">
          <h2 className="text-lg text-soma-fg-secondary mb-2">Confidence indicators</h2>
          <div className="flex gap-3 text-xs">
            <span className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--soma-confidence-high)', color: 'var(--soma-bg-base)' }}>high</span>
            <span className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--soma-confidence-medium)', color: 'var(--soma-bg-base)' }}>medium</span>
            <span className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--soma-confidence-low)', color: 'var(--soma-bg-base)' }}>low</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;