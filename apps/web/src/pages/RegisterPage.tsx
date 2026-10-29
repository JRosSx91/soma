import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { BiologicalSex } from "@soma/shared-types";
import { useAuth, translateAuthError } from "../features/auth/index.js";
import { takeRegistrationInviteToken } from "../features/auth/lib/registration-invite.js";
import { prepareRegisterCredentials } from "../features/auth/lib/registration-passwords.js";
import { AuthPasswordField } from "../features/auth/components/AuthPasswordField.js";
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
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [biologicalSex, setBiologicalSex] = useState<BiologicalSex>("male");
  const [birthYear, setBirthYear] = useState<number>(1990);
  const [error, setError] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<"password" | "confirm" | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  /** Prevents guest→/app redirect from winning over post-register onboarding. */
  const completingRegistration = useRef(false);
  // Module-scoped capture survives StrictMode remounts after the URL is stripped.
  const inviteRef = useRef<string | null | undefined>(undefined);
  if (inviteRef.current === undefined) {
    inviteRef.current = takeRegistrationInviteToken(location.search);
  }

  if (loading) {
    return (
      <AuthShell>
        <p
          className="text-sm text-soma-ink-secondary"
          role="status"
        >
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
    setErrorField(null);
    const prepared = prepareRegisterCredentials({
      email,
      password,
      confirmPassword,
      displayName,
      biologicalSex,
      birthYear,
      ...(inviteRef.current ? { inviteToken: inviteRef.current } : {}),
    });
    if (!prepared.ok) {
      setError(t(prepared.messageKey));
      if (prepared.messageKey === "register.passwordTooShort") {
        setErrorField("password");
      } else if (prepared.messageKey === "register.passwordMismatch") {
        setErrorField("confirm");
      } else {
        setErrorField(null);
      }
      return;
    }
    setSubmitting(true);
    completingRegistration.current = true;
    try {
      await register(prepared.credentials);
      navigate("/onboarding", { replace: true });
    } catch (err) {
      completingRegistration.current = false;
      setError(translateAuthError(err, t, "errors.registrationFailed"));
      setErrorField(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <meta name="referrer" content="no-referrer" />
      <div>
        <div className="mb-8">
          <h1 className={authTitleClass}>{t("register.title")}</h1>
          <p className={authSubtitleClass}>{t("register.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="register-display-name"
              className="mb-2 block text-xs uppercase tracking-wider text-soma-ink-secondary"
            >
              {t("register.displayName")}
            </label>
            <input
              id="register-display-name"
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={authFieldClass}
              autoComplete="nickname"
            />
          </div>

          <div>
            <label
              htmlFor="register-email"
              className="mb-2 block text-xs uppercase tracking-wider text-soma-ink-secondary"
            >
              {t("register.email")}
            </label>
            <input
              id="register-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authFieldClass}
              autoComplete="email"
            />
          </div>

          <div>
            <label
              htmlFor="register-password"
              className="mb-2 block text-xs uppercase tracking-wider text-soma-ink-secondary"
            >
              {t("register.password")}
            </label>
            <AuthPasswordField
              id="register-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
                setErrorField(null);
              }}
              autoComplete="new-password"
              aria-invalid={errorField === "password" ? true : undefined}
              aria-describedby={
                errorField === "password"
                  ? "register-password-hint register-field-error"
                  : "register-password-hint"
              }
            />
            <p id="register-password-hint" className="mt-1 text-xs text-soma-ink-muted">
              {t("register.passwordHint")}
            </p>
          </div>

          <div>
            <label
              htmlFor="register-confirm-password"
              className="mb-2 block text-xs uppercase tracking-wider text-soma-ink-secondary"
            >
              {t("register.confirmPassword")}
            </label>
            <AuthPasswordField
              id="register-confirm-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError(null);
                setErrorField(null);
              }}
              autoComplete="new-password"
              aria-invalid={errorField === "confirm" ? true : undefined}
              aria-describedby={
                errorField === "confirm" ? "register-field-error" : undefined
              }
            />
          </div>

          <div>
            <label
              htmlFor="register-biological-sex"
              className="mb-2 block text-xs uppercase tracking-wider text-soma-ink-secondary"
            >
              {t("register.biologicalSex")}
            </label>
            <select
              id="register-biological-sex"
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
            <label
              htmlFor="register-birth-year"
              className="mb-2 block text-xs uppercase tracking-wider text-soma-ink-secondary"
            >
              {t("register.birthYear")}
            </label>
            <input
              id="register-birth-year"
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
            <p
              id={errorField ? "register-field-error" : "register-form-error"}
              className="text-sm text-soma-organ-damaged"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            aria-busy={submitting || undefined}
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
