import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { BiologicalSex } from "@soma/shared-types";
import { useAuth, translateAuthError } from "../features/auth/index.js";
import {
  AuthShell,
  authFieldClass,
  authLinkClass,
  authPrimaryButtonClass,
  authSubtitleClass,
  authTitleClass,
} from "../features/auth/components/AuthShell.js";

export function RegisterPage() {
  const { t } = useTranslation(["auth", "common"]);
  const { register, user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [biologicalSex, setBiologicalSex] = useState<BiologicalSex>("male");
  const [birthYear, setBirthYear] = useState<number>(1990);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  /** Prevents guest→/app redirect from winning over post-register onboarding. */
  const completingRegistration = useRef(false);

  if (loading) {
    return (
      <AuthShell>
        <p className="text-sm text-soma-ink-secondary">
          {t("common:loading", { defaultValue: "Loading…" })}
        </p>
      </AuthShell>
    );
  }

  // Already signed in: send through /login so pending users see the invite
  // gate instead of skipping straight into /app. Fresh register sets
  // completingRegistration and navigates to /onboarding below.
  if (user && !completingRegistration.current && !submitting) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    completingRegistration.current = true;
    try {
      await register({
        email,
        password,
        displayName,
        biologicalSex,
        birthYear,
      });
      navigate("/onboarding", { replace: true });
    } catch (err) {
      completingRegistration.current = false;
      setError(translateAuthError(err, t, "errors.registrationFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <div>
        <div className="mb-8">
          <h1 className={authTitleClass}>{t("register.title")}</h1>
          <p className={authSubtitleClass}>{t("register.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wider text-soma-ink-secondary">
              {t("register.displayName")}
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={authFieldClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-wider text-soma-ink-secondary">
              {t("register.email")}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authFieldClass}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-wider text-soma-ink-secondary">
              {t("register.password")}
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={authFieldClass}
              autoComplete="new-password"
            />
            <p className="mt-1 text-xs text-soma-ink-muted">
              {t("register.passwordHint")}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-wider text-soma-ink-secondary">
              {t("register.biologicalSex")}
            </label>
            <select
              value={biologicalSex}
              onChange={(e) =>
                setBiologicalSex(e.target.value as BiologicalSex)
              }
              className={`${authFieldClass} scheme-dark`}
            >
              <option value="male">{t("register.biologicalSexMale")}</option>
              <option value="female">
                {t("register.biologicalSexFemale")}
              </option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-wider text-soma-ink-secondary">
              {t("register.birthYear")}
            </label>
            <input
              type="number"
              required
              min={1900}
              max={new Date().getFullYear()}
              value={birthYear}
              onChange={(e) => setBirthYear(Number(e.target.value))}
              className={authFieldClass}
            />
          </div>

          {error && (
            <p className="text-sm text-soma-organ-damaged" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={authPrimaryButtonClass}
          >
            {submitting ? t("register.submitting") : t("register.submit")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-soma-ink-muted">
          {t("register.haveAccount")}{" "}
          <Link to="/login" className={authLinkClass}>
            {t("register.signIn")}
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
