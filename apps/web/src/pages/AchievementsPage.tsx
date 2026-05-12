import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../features/auth/index.js';
import {
  useAchievements,
  SubstanceTrophyGroup,
} from '../features/achievements/index.js';
import { LanguageSelector } from '../components/LanguageSelector.js';

export function AchievementsPage() {
  const { t } = useTranslation(['main', 'common']);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { achievements, loading, error } = useAchievements();

  // Group by substance, preserving the substance order seen in the
  // catalog (alcohol, nicotine, cannabis, cocaine, caffeine).
  const groupedBySubstance = useMemo(() => {
    const groups = new Map<string, typeof achievements>();
    for (const a of achievements) {
      const existing = groups.get(a.triggerSubstanceId) ?? [];
      existing.push(a);
      groups.set(a.triggerSubstanceId, existing);
    }
    return Array.from(groups.entries());
  }, [achievements]);

  const totalUnlocked = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

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
          <LanguageSelector />
          <button
            onClick={() => navigate('/app')}
            className="text-xs text-soma-fg-muted hover:text-soma-fg-secondary transition-colors"
          >
            {t('main:header.dashboard')}
          </button>
          <button
            onClick={logout}
            className="text-xs text-soma-fg-muted hover:text-soma-fg-secondary transition-colors"
          >
            {t('common:signOut')}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-light tracking-wide mb-2">
            {t('main:trophies.title')}
          </h2>
          <p className="text-sm text-soma-fg-muted tabular-nums">
            {t('main:trophies.unlockedRatio', {
              unlocked: totalUnlocked,
              total: totalCount,
            })}
          </p>
        </div>

        {loading && (
          <p className="text-soma-fg-secondary">{t('common:loading')}</p>
        )}
        {error && <p className="text-soma-organ-damaged">{error}</p>}

        {!loading && !error && (
          <>
            {groupedBySubstance.map(([substanceId, items]) => (
              <SubstanceTrophyGroup
                key={substanceId}
                substanceId={substanceId}
                achievements={items}
              />
            ))}
          </>
        )}
      </main>
    </div>
  );
}