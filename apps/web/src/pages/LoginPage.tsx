import { useState } from 'react';
import type { FormEvent } from 'react';
import { LanguageSelector } from '../components/LanguageSelector.js';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, translateAuthError } from '../features/auth/index.js';

export function LoginPage() {
  const { t } = useTranslation('auth');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate('/app', { replace: true });
    } catch (err) {
  setError(translateAuthError(err, t, 'errors.loginFailed'));
} finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-soma-bg-base text-soma-fg-primary px-4">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light tracking-wide">{t('appName')}</h1>
          <p className="text-xs text-soma-fg-muted mt-2">{t('login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-soma-fg-secondary uppercase tracking-wider mb-2">
              {t('login.email')}
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
              {t('login.password')}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-soma-bg-surface border border-soma-border-subtle rounded px-3 py-2 text-soma-fg-primary focus:outline-none focus:border-soma-accent"
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-sm text-soma-organ-damaged">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-soma-accent text-soma-bg-base rounded px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? t('login.submitting') : t('login.submit')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-soma-fg-muted">
          {t('login.noAccount')}{' '}
          <Link to="/register" className="text-soma-accent hover:underline">
            {t('login.createOne')}
          </Link>
        </p>
      </div>
    </div>
  );
}