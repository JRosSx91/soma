import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { OrganId } from '@soma/shared-types';
import { useAuth } from '../features/auth/index.js';
import { useUserProfile, useOrganStates, MOCK_PROFILE } from '../features/profile/index.js';
import type { UserProfile } from '../features/profile/types.js';
import { BodyDiagram3D } from '../features/body-diagram-3d/index.js';
import type { OrganStateMap } from '../features/body-diagram-3d/index.js';
import {
  useNeurotransmitterState,
  NeurotransmitterPanel,
} from '../features/neurotransmitter-state/index.js';
import { LanguageSelector } from '../components/LanguageSelector.js';
import {
  useOrganNarrativeState,
  OrganNarrativePanel,
} from '../features/organ-narrative-state/index.js';

export function MainPage() {
  const { t } = useTranslation([
  'main',
  'common',
  'organs',
  'substances',
  'neurotransmitters',
  'neurotransmitter-phases',
  'phases',
  'organ-narrative',
  'achievements',
]);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    profile: serverProfile,
    loading: loadingProfile,
    error: profileError,
  } = useUserProfile();
  const { entries: ntEntries } = useNeurotransmitterState();

  // Hover: drives the visual highlight in the 3D model.
  // Selected: drives the side panel content. Decoupled so the panel
  // persists when the cursor moves away from the organ to read it.
  const [hovered, setHovered] = useState<OrganId | null>(null);
  const [selected, setSelected] = useState<OrganId | null>(null);
  const [showNeurotransmitters, setShowNeurotransmitters] = useState(false);

  const { entries: narrativeEntries } = useOrganNarrativeState();
  const [showNarrative, setShowNarrative] = useState(false);

  const handleSelect = (organId: OrganId | null) => {
  setSelected((prev) => (prev === organId ? null : organId));
  setShowNeurotransmitters(false);
  setShowNarrative(false);
};

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

  // Filtered NT entries for the currently selected organ.
  const ntForSelected = selected
    ? ntEntries.filter((e) => e.organId === selected)
    : [];
  const narrativeForSelected = selected
  ? narrativeEntries.filter((e) => e.organId === selected)
  : [];
const hasNarrativeData = narrativeForSelected.length > 0;
  const hasNtData = ntForSelected.length > 0;

  return (
    <div className="min-h-screen bg-soma-bg-base text-soma-fg-primary">
      <header className="border-b border-soma-border-subtle px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light tracking-wide">Soma</h1>
          <p className="text-xs text-soma-fg-muted mt-1">{user?.displayName ?? '—'}</p>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSelector />
          <button
            onClick={() => navigate('/achievements')}
            className="text-xs text-soma-fg-muted hover:text-soma-fg-secondary transition-colors"
          >
            {t('main:header.trophies')}
          </button>
          <button
            onClick={() => navigate('/onboarding')}
            className="text-xs text-soma-fg-muted hover:text-soma-fg-secondary transition-colors"
          >
            {t('main:header.editProfile')}
          </button>
          <button
            onClick={logout}
            className="text-xs text-soma-fg-muted hover:text-soma-fg-secondary transition-colors"
          >
            {t('common:signOut')}
          </button>
          
        </div>
      </header>

      <main className="grid grid-cols-12 gap-6 p-8 max-w-7xl mx-auto">
        <section className="col-span-8 bg-soma-bg-surface border border-soma-border-subtle rounded p-2 flex items-center justify-center min-h-[600px]">
          {loading && <p className="text-soma-fg-secondary">{t('common:loading')}</p>}
          {error && <p className="text-soma-organ-damaged">{error}</p>}
          {!loading && !error && hasNoUsages && (
            <div className="text-center px-8 py-12">
              <p className="text-soma-fg-secondary mb-4">{t('main:empty.noSubstances')}</p>
              <button
                onClick={() => navigate('/onboarding')}
                className="text-soma-accent hover:underline"
              >
                {t('main:empty.addFirst')}
              </button>
            </div>
          )}
          {!loading && !error && !hasNoUsages && (
            <BodyDiagram3D
              biologicalSex={organProfile.biologicalSex}
              view="front"
              organStates={organStates}
              highlightedOrganId={hovered ?? selected}
              onOrganHover={setHovered}
              onOrganClick={handleSelect}
            />
          )}
        </section>

        <aside className="col-span-4 bg-soma-bg-surface border border-soma-border-subtle rounded p-6">
          <h2 className="text-soma-fg-secondary text-sm uppercase tracking-wider mb-3">
            {selected ? t('main:panel.selectedOrgan') : t('main:panel.clickPrompt')}
          </h2>
          {selected && states.has(selected) && (
            <div className="space-y-2 text-sm">
              <p className="text-soma-fg-primary text-base">
                {t(`organs:${selected}`, { defaultValue: states.get(selected)!.organName })}
              </p>
              <p className="text-soma-fg-muted">
                {t('main:panel.affectedBy')}:{' '}
                <span className="text-soma-fg-secondary capitalize">
                  {t(`substances:${states.get(selected)!.dominantSubstanceId}.name`, {
                    defaultValue: states.get(selected)!.dominantSubstanceId,
                  })}
                </span>
              </p>
              <p className="text-soma-fg-muted">
                {t('main:panel.daysAbstinent')}:{' '}
                <span className="text-soma-fg-secondary tabular-nums">
                  {Math.floor(states.get(selected)!.daysAbstinent)}
                </span>
              </p>
              <p className="text-soma-fg-muted">
                {t('main:panel.recovery')}:{' '}
                <span className="text-soma-accent tabular-nums">
                  {(states.get(selected)!.progressFraction * 100).toFixed(1)}%
                </span>
              </p>
            </div>
          )}

          {selected && hasNtData && (
            <div className="mt-4 pt-4 border-t border-soma-border-subtle">
              <button
                onClick={() => setShowNeurotransmitters((prev) => !prev)}
                className="text-xs text-soma-accent hover:underline"
              >
                {showNeurotransmitters
                  ? t('main:panel.hideNeurotransmitterState')
                  : t('main:panel.showNeurotransmitterState')}
              </button>
              {showNeurotransmitters && (
                <NeurotransmitterPanel entries={ntForSelected} />
              )}
            </div>
          )}

          {selected && hasNarrativeData && (
  <div className="mt-4 pt-4 border-t border-soma-border-subtle">
    <button
      onClick={() => setShowNarrative((prev) => !prev)}
      className="text-xs text-soma-accent hover:underline"
    >
      {showNarrative
        ? t('main:panel.hideRecoveryProcess')
        : t('main:panel.showRecoveryProcess')}
    </button>
    {showNarrative && (
      <OrganNarrativePanel entries={narrativeForSelected} />
    )}
  </div>
)}
        </aside>
      </main>
    </div>
  );
}