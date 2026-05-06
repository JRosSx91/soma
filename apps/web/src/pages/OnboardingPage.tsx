import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSubstances } from '../features/substances/index.js';
import { useUserProfile } from '../features/profile/index.js';
import type { UsageInput } from '../features/profile/index.js';
import { LanguageSelector } from '../components/LanguageSelector.js';

interface SubstanceFormState {
  active: boolean;
  yearStarted: string;
  lastUseDate: string;
  frequency: UsageInput['frequency'];
}

const FREQUENCY_KEYS: Array<{
  value: UsageInput['frequency'];
  labelKey: string;
}> = [
  { value: 'daily', labelKey: 'frequency.daily' },
  { value: 'weekly', labelKey: 'frequency.weekly' },
  { value: 'monthly', labelKey: 'frequency.monthly' },
  { value: 'occasional', labelKey: 'frequency.occasional' },
];

const TODAY = new Date().toISOString().split('T')[0];

const EMPTY_STATE: SubstanceFormState = {
  active: false,
  yearStarted: '',
  lastUseDate: '',
  frequency: 'daily',
};

/**
 * Converts an ISO date string from the backend (e.g. "2025-01-15T00:00:00.000Z")
 * into the YYYY-MM-DD format expected by <input type="date">.
 */
function toDateInputValue(isoDate: string): string {
  return isoDate.split('T')[0];
}

export function OnboardingPage() {
  const { t } = useTranslation(['onboarding', 'substances', 'common']);
  const navigate = useNavigate();
  const { data: substances, loading: loadingSubstances } = useSubstances();
  const { profile, loading: loadingProfile, saveProfile } = useUserProfile();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formState, setFormState] = useState<Record<string, SubstanceFormState>>({});
  const [initialized, setInitialized] = useState(false);

  /**
   * Pre-fill the form with the user's current usages the first time
   * the profile arrives from the backend. This effect runs at most
   * once per mount — subsequent changes to the profile (e.g. after
   * saveProfile) don't reset the user's edits.
   */
  useEffect(() => {
    if (initialized || !profile || !substances) return;

    const initial: Record<string, SubstanceFormState> = {};
    for (const usage of profile.usages) {
      initial[usage.substanceId] = {
        active: true,
        yearStarted: String(usage.yearStarted),
        lastUseDate: toDateInputValue(usage.lastUseDate),
        frequency: usage.frequency,
      };
    }
    setFormState(initial);
    setInitialized(true);
  }, [profile, substances, initialized]);

  const updateField = (
    substanceId: string,
    field: keyof SubstanceFormState,
    value: string | boolean,
  ) => {
    setFormState((prev) => ({
      ...prev,
      [substanceId]: {
        ...(prev[substanceId] ?? EMPTY_STATE),
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
          throw new Error(t('errors.invalidYear', { substance: substance.name }));
        }

        if (!state.lastUseDate) {
          throw new Error(
            t('errors.lastUseDateRequired', { substance: substance.name }),
          );
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
      setError(err instanceof Error ? err.message : t('errors.saveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingSubstances || loadingProfile || !substances) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soma-bg-base text-soma-fg-secondary">
        {t('common:loading')}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soma-bg-base text-soma-fg-primary px-4 py-12 relative">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-light tracking-wide mb-2">{t('title')}</h1>
          <p className="text-sm text-soma-fg-muted">{t('subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {substances.map((substance) => {
            const state = formState[substance.id] ?? EMPTY_STATE;

            return (
              <div
                key={substance.id}
                className="bg-soma-bg-surface border border-soma-border-subtle rounded p-4"
              >
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.active}
                    onChange={(e) => updateField(substance.id, 'active', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="text-soma-fg-primary capitalize">
                      {t(`substances:${substance.id}.name`, { defaultValue: substance.name })}
                    </p>
                    <p className="text-xs text-soma-fg-muted">
                      {t(`substances:${substance.id}.shortDescription`, {
                        defaultValue: substance.shortDescription,
                      })}
                    </p>
                  </div>
                </label>

                {state.active && (
                  <div className="mt-4 space-y-3 pl-7">
                    <div>
                      <label className="block text-xs text-soma-fg-secondary uppercase tracking-wider mb-2">
                        {t('fields.lastUseDate')}
                      </label>
                      <input
                        type="date"
                        required
                        max={TODAY}
                        value={state.lastUseDate}
                        onChange={(e) => updateField(substance.id, 'lastUseDate', e.target.value)}
                        className="w-full bg-soma-bg-base border border-soma-border-subtle rounded px-3 py-2 text-soma-fg-primary focus:outline-none focus:border-soma-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-soma-fg-secondary uppercase tracking-wider mb-2">
                        {t('fields.yearStarted')}
                      </label>
                      <input
                        type="number"
                        required
                        min={1900}
                        max={new Date().getFullYear()}
                        value={state.yearStarted}
                        onChange={(e) => updateField(substance.id, 'yearStarted', e.target.value)}
                        className="w-full bg-soma-bg-base border border-soma-border-subtle rounded px-3 py-2 text-soma-fg-primary focus:outline-none focus:border-soma-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-soma-fg-secondary uppercase tracking-wider mb-2">
                        {t('fields.frequency')}
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
                        {FREQUENCY_KEYS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {t(opt.labelKey)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {error && <p className="text-sm text-soma-organ-damaged">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-soma-accent text-soma-bg-base rounded px-4 py-3 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? t('submitting') : t('submit')}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-soma-fg-muted">{t('skip')}</p>
      </div>
    </div>
  );
}