import { computeRecovery } from './features/recovery-engine/index.js';
import type { RecoveryCurveShape } from '@soma/shared-types';

interface TestCase {
  label: string;
  shape: RecoveryCurveShape;
  daysTo95Recovery: number;
  recoveryCeiling: number;
  daysElapsed: number;
}

const TEST_CASES: TestCase[] = [
  // Bronchi after nicotine: fast logarithmic, ceiling 0.90
  { label: 'Bronchi (nicotine), 3 days', shape: 'logarithmic', daysTo95Recovery: 270, recoveryCeiling: 0.90, daysElapsed: 3 },
  { label: 'Bronchi (nicotine), 30 days', shape: 'logarithmic', daysTo95Recovery: 270, recoveryCeiling: 0.90, daysElapsed: 30 },
  { label: 'Bronchi (nicotine), 270 days', shape: 'logarithmic', daysTo95Recovery: 270, recoveryCeiling: 0.90, daysElapsed: 270 },

  // VTA after cannabis: fast sigmoidal, ceiling 0.95
  { label: 'VTA (cannabis), 7 days', shape: 'sigmoidal', daysTo95Recovery: 30, recoveryCeiling: 0.95, daysElapsed: 7 },
  { label: 'VTA (cannabis), 15 days', shape: 'sigmoidal', daysTo95Recovery: 30, recoveryCeiling: 0.95, daysElapsed: 15 },
  { label: 'VTA (cannabis), 30 days', shape: 'sigmoidal', daysTo95Recovery: 30, recoveryCeiling: 0.95, daysElapsed: 30 },

  // VTA after cocaine: slow sigmoidal, ceiling 0.85 (limited reversibility)
  { label: 'VTA (cocaine), 30 days', shape: 'sigmoidal', daysTo95Recovery: 270, recoveryCeiling: 0.85, daysElapsed: 30 },
  { label: 'VTA (cocaine), 135 days', shape: 'sigmoidal', daysTo95Recovery: 270, recoveryCeiling: 0.85, daysElapsed: 135 },
  { label: 'VTA (cocaine), 270 days', shape: 'sigmoidal', daysTo95Recovery: 270, recoveryCeiling: 0.85, daysElapsed: 270 },

  // Liver after alcohol: logarithmic, ceiling 0.95
  { label: 'Liver (alcohol), 14 days', shape: 'logarithmic', daysTo95Recovery: 90, recoveryCeiling: 0.95, daysElapsed: 14 },
  { label: 'Liver (alcohol), 90 days', shape: 'logarithmic', daysTo95Recovery: 90, recoveryCeiling: 0.95, daysElapsed: 90 },
];

function App() {
  const now = Date.now();

  return (
    <div className="min-h-screen bg-soma-bg-base text-soma-fg-primary p-8">
      <header className="border-b border-soma-border-subtle pb-4 mb-8">
        <h1 className="text-3xl font-light tracking-wide">Soma</h1>
        <p className="text-sm text-soma-fg-muted mt-1">Recovery engine sanity check</p>
      </header>

      <section className="max-w-3xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-soma-border-subtle">
              <th className="py-2 pr-4 font-medium text-soma-fg-secondary">Scenario</th>
              <th className="py-2 pr-4 font-medium text-soma-fg-secondary">Shape</th>
              <th className="py-2 pr-4 font-medium text-soma-fg-secondary text-right">Progress</th>
              <th className="py-2 pr-4 font-medium text-soma-fg-secondary text-right">Absolute</th>
            </tr>
          </thead>
          <tbody>
            {TEST_CASES.map((tc, i) => {
              const lastUseMs = now - tc.daysElapsed * 24 * 60 * 60 * 1000;
              const lastUseDate = new Date(lastUseMs).toISOString();
              const result = computeRecovery(
                {
                  shape: tc.shape,
                  daysTo95Recovery: tc.daysTo95Recovery,
                  recoveryCeiling: tc.recoveryCeiling,
                  lastUseDate,
                },
                now,
              );
              return (
                <tr key={i} className="border-b border-soma-border-subtle/40">
                  <td className="py-2 pr-4 text-soma-fg-primary">{tc.label}</td>
                  <td className="py-2 pr-4 text-soma-fg-muted">{tc.shape}</td>
                  <td className="py-2 pr-4 text-right tabular-nums text-soma-accent">
                    {(result.progressFraction * 100).toFixed(1)}%
                  </td>
                  <td className="py-2 pr-4 text-right tabular-nums text-soma-fg-secondary">
                    {(result.absoluteRecovery * 100).toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default App;