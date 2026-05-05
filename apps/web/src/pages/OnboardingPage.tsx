import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubstances } from '../features/substances/index.js';
import { useUserProfile } from '../features/profile/index.js';
import type { UsageInput } from '../features/profile/index.js';

interface SubstanceFormState {
  active: boolean;
  yearStarted: string;
  lastUseDate: string;
  frequency: UsageInput['frequency'];
}

const FREQUENCY_OPTIONS: Array<{
  value: UsageInput['frequency'];
  label: string;
}> = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'occasional', label: 'Occasional' },
];

const TODAY = new Date().toISOString().split('T')[0];

export function OnboardingPage() {
  const navigate = useNavigate();
  const { data: substances, loading: loadingSubstances } = useSubstances();
  const { saveProfile } = useUserProfile();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formState, setFormState] = useState<Record<string, SubstanceFormState>>({});

  const updateField = (
    substanceId: string,
    field: keyof SubstanceFormState,
    value: string | boolean,
  ) => {
    setFormState((prev) => ({
      ...prev,
      [substanceId]: {
        ...(prev[substanceId] ?? {
          active: false,
          yearStarted: '',
          lastUseDate: '',
          frequency: 'daily',
        }),
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const usages: UsageInput[] = [];

      for (const substance of substances ?? []) {
        const state = formState[substance.id];
        if (!state || !state.active) continue;

        const yearStarted = parseInt(state.yearStarted, 10);
        if (Number.isNaN(yearStarted)) {
          throw new Error(`Invalid year for ${substance.name}`);
        }

        if (!state.lastUseDate) {
          throw new Error(`Last use date required for ${substance.name}`);
        }

        usages.push({
          substanceId: substance.id,
          yearStarted,
          lastUseDate: state.lastUseDate,
          frequency: state.frequency,
        });
      }

      await saveProfile(usages);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingSubstances || !substances) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soma-bg-base text-soma-fg-secondary">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soma-bg-base text-soma-fg-primary px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-light tracking-wide mb-2">
            Tell us about you
          </h1>
          <p className="text-sm text-soma-fg-muted">
            For each substance you've stopped using, mark it active and tell
            us when you last used it. You can update this later.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {substances.map((substance) => {
            const state = formState[substance.id] ?? {
              active: false,
              yearStarted: '',
              lastUseDate: '',
              frequency: 'daily' as const,
            };

            return (
              <div
                key={substance.id}
                className="bg-soma-bg-surface border border-soma-border-subtle rounded p-4"
              >
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.active}
                    onChange={(e) =>
                      updateField(substance.id, 'active', e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="text-soma-fg-primary capitalize">
                      {substance.name}
                    </p>
                    <p className="text-xs text-soma-fg-muted">
                      {substance.shortDescription}
                    </p>
                  </div>
                </label>

                {state.active && (
                  <div className="mt-4 space-y-3 pl-7">
                    <div>
                      <label className="block text-xs text-soma-fg-secondary uppercase tracking-wider mb-2">
                        Last use date
                      </label>
                      <input
                        type="date"
                        required
                        max={TODAY}
                        value={state.lastUseDate}
                        onChange={(e) =>
                          updateField(substance.id, 'lastUseDate', e.target.value)
                        }
                        className="w-full bg-soma-bg-base border border-soma-border-subtle rounded px-3 py-2 text-soma-fg-primary focus:outline-none focus:border-soma-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-soma-fg-secondary uppercase tracking-wider mb-2">
                        Year started
                      </label>
                      <input
                        type="number"
                        required
                        min={1900}
                        max={new Date().getFullYear()}
                        value={state.yearStarted}
                        onChange={(e) =>
                          updateField(substance.id, 'yearStarted', e.target.value)
                        }
                        className="w-full bg-soma-bg-base border border-soma-border-subtle rounded px-3 py-2 text-soma-fg-primary focus:outline-none focus:border-soma-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-soma-fg-secondary uppercase tracking-wider mb-2">
                        Frequency
                      </label>
                      <select
                        value={state.frequency}
                        onChange={(e) =>
                          updateField(
                            substance.id,
                            'frequency',
                            e.target.value as UsageInput['frequency'],
                          )
                        }
                        className="w-full bg-soma-bg-base border border-soma-border-subtle rounded px-3 py-2 text-soma-fg-primary focus:outline-none focus:border-soma-accent"
                      >
                        {FREQUENCY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {error && (
            <p className="text-sm text-soma-organ-damaged">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-soma-accent text-soma-bg-base rounded px-4 py-3 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Saving…' : 'Continue'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-soma-fg-muted">
          You can skip substances you haven't used or aren't tracking.
        </p>
      </div>
    </div>
  );
}