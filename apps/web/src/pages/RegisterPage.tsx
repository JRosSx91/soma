import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { BiologicalSex } from '@soma/shared-types';
import { useAuth } from '../features/auth/index.js';

export function RegisterPage() {
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
        err instanceof Error ? err.message : 'Registration failed';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-soma-bg-base text-soma-fg-primary px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light tracking-wide">Soma</h1>
          <p className="text-xs text-soma-fg-muted mt-2">
            Create your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-soma-fg-secondary uppercase tracking-wider mb-2">
              Display name
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
              Email
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
              Password
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
            <p className="text-xs text-soma-fg-muted mt-1">
              Minimum 8 characters
            </p>
          </div>

          <div>
            <label className="block text-xs text-soma-fg-secondary uppercase tracking-wider mb-2">
              Biological sex
            </label>
            <select
              value={biologicalSex}
              onChange={(e) => setBiologicalSex(e.target.value as BiologicalSex)}
              className="w-full bg-soma-bg-surface border border-soma-border-subtle rounded px-3 py-2 text-soma-fg-primary focus:outline-none focus:border-soma-accent"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-soma-fg-secondary uppercase tracking-wider mb-2">
              Birth year
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

          {error && (
            <p className="text-sm text-soma-organ-damaged">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-soma-accent text-soma-bg-base rounded px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-soma-fg-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-soma-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}