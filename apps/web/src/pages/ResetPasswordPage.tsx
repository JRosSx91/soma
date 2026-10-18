import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { LanguageSelector } from "../components/LanguageSelector.js";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { runResetPasswordRequest } from "../features/auth/lib/reset-password-flow.js";
import {
  clearHeldPasswordResetToken,
  takePasswordResetToken,
} from "../features/auth/lib/password-reset-validation.js";

export function ResetPasswordPage() {
  const { t } = useTranslation("auth");
  const location = useLocation();

  // Module-scoped capture survives StrictMode remounts after the URL is stripped.
  // Prefer early HTML bootstrap (__SOMA_PASSWORD_RESET_TOKEN__), else strip here.
  const tokenRef = useRef<string | null | undefined>(undefined);
  if (tokenRef.current === undefined) {
    tokenRef.current = takePasswordResetToken(location.search);
  }
  const token = tokenRef.current;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const outcome = await runResetPasswordRequest(token, password, confirm);
      if (outcome.status === "ok") {
        setSuccess(true);
        tokenRef.current = null;
        clearHeldPasswordResetToken();
      } else {
        setError(t(outcome.messageKey));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-soma-bg-base text-soma-fg-primary px-4">
      {/* Backup if this route was reached via SPA navigation (no index.html bootstrap). */}
      <meta name="referrer" content="no-referrer" />
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light tracking-wide">{t("appName")}</h1>
          <p className="text-xs text-soma-fg-muted mt-2">
            {t("resetPassword.subtitle")}
          </p>
        </div>

        {!token && !success ? (
          <div className="space-y-4">
            <p className="text-sm text-soma-organ-damaged" role="alert">
              {t("resetPassword.missingToken")}
            </p>
            <p className="text-center text-sm text-soma-fg-muted">
              <Link
                to="/forgot-password"
                className="text-soma-accent hover:underline"
              >
                {t("resetPassword.requestAnother")}
              </Link>
            </p>
          </div>
        ) : success ? (
          <div className="space-y-4">
            <p className="text-sm text-soma-fg-secondary" role="status">
              <span className="block font-medium text-soma-fg-primary mb-1">
                {t("resetPassword.successTitle")}
              </span>
              {t("resetPassword.successBody")}
            </p>
            <Link
              to="/login"
              className="block w-full text-center bg-soma-accent text-soma-bg-base rounded px-4 py-2 hover:opacity-90 transition-opacity"
            >
              {t("resetPassword.goToLogin")}
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs text-soma-fg-secondary uppercase tracking-wider mb-2">
                  {t("resetPassword.newPassword")}
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
                  {t("resetPassword.passwordHint")}
                </p>
              </div>

              <div>
                <label className="block text-xs text-soma-fg-secondary uppercase tracking-wider mb-2">
                  {t("resetPassword.confirmPassword")}
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full bg-soma-bg-surface border border-soma-border-subtle rounded px-3 py-2 text-soma-fg-primary focus:outline-none focus:border-soma-accent"
                  autoComplete="new-password"
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
                className="w-full bg-soma-accent text-soma-bg-base rounded px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting
                  ? t("resetPassword.submitting")
                  : t("resetPassword.submit")}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-soma-fg-muted">
              <Link
                to="/forgot-password"
                className="text-soma-accent hover:underline"
              >
                {t("resetPassword.requestAnother")}
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
