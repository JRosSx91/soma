import { useState } from 'react';
import type { FormEvent } from 'react';
import { LanguageSelector } from '../components/LanguageSelector.js';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { BiologicalSex } from '@soma/shared-types';
import { useAuth } from '../features/auth/index.js';

export function RegisterPage() {
  const { t } = useTranslation('auth');
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [biologicalSex, setBiologicalSex] = useState<BiologicalSex>('male');
  const [birthYear, setBirthYear] = useState<number>(1990);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({
        email,
        password,
        displayName,
        biologicalSex,
        birthYear,
      });
      navigate('/onboarding', { replace: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t('errors.registrationFailed');
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-soma-bg-base text-soma-fg-primary px-4 py-12">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light tracking-wide">{t('appName')}</h1>
          <p className="text-xs text-soma-fg-muted mt-2">{t('register.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-soma-fg-secondary uppercase tracking-wider mb-2">
              {t('register.displayName')}
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-soma-bg-surface border border-soma-border-subtle rounded px-3 py-2 text-soma-fg-primary focus:outline-none focus:border-soma-accent"
            />
          </div>

          <div>
            <label className="block text-xs text-soma-fg-secondary uppercase tracking-wider mb-2">
              {t('register.email')}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-soma-bg-surface border border-soma-border-subtle rounded px-3 py-2 text-soma-fg-primary focus:outline-none focus:border-soma-accent"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-xs text-soma-fg-secondary uppercase tracking-wider mb-2">
              {t('register.password')}
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-soma-bg-surface border border-soma-border-subtle rounded px-3 py-2 text-soma-fg-primary focus:outline-none focus:border-soma-accent"
              autoComplete="new-password"
            />
            <p className="text-xs text-soma-fg-muted mt-1">{t('register.passwordHint')}</p>
          </div>

          <div>
            <label className="block text-xs text-soma-fg-secondary uppercase tracking-wider mb-2">
              {t('register.biologicalSex')}
            </label>
            <select
              value={biologicalSex}
              onChange={(e) => setBiologicalSex(e.target.value as BiologicalSex)}
              className="w-full bg-soma-bg-surface border border-soma-border-subtle rounded px-3 py-2 text-soma-fg-primary focus:outline-none focus:border-soma-accent"
            >
              <option value="male">{t('register.biologicalSexMale')}</option>
              <option value="female">{t('register.biologicalSexFemale')}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-soma-fg-secondary uppercase tracking-wider mb-2">
              {t('register.birthYear')}
            </label>
            <input
              type="number"
              required
              min={1900}
              max={new Date().getFullYear()}
              value={birthYear}
              onChange={(e) => setBirthYear(Number(e.target.value))}
              className="w-full bg-soma-bg-surface border border-soma-border-subtle rounded px-3 py-2 text-soma-fg-primary focus:outline-none focus:border-soma-accent"
            />
          </div>

          {error && <p className="text-sm text-soma-organ-damaged">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-soma-accent text-soma-bg-base rounded px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? t('register.submitting') : t('register.submit')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-soma-fg-muted">
          {t('register.haveAccount')}{' '}
          <Link to="/login" className="text-soma-accent hover:underline">
            {t('register.signIn')}
          </Link>
        </p>
      </div>
    </div>
  );
}