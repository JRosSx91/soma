import { useState } from "react";
import type { FormEvent } from "react";
import { LanguageSelector } from "../components/LanguageSelector.js";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { runForgotPasswordRequest } from "../features/auth/lib/forgot-password-flow.js";

export function ForgotPasswordPage() {
  const { t } = useTranslation("auth");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const outcome = await runForgotPasswordRequest(email);
      if (outcome.status === "ok") {
        setSubmitted(true);
      } else {
        setError(t(outcome.messageKey));
      }
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
          <h1 className="text-3xl font-light tracking-wide">{t("appName")}</h1>
          <p className="text-xs text-soma-fg-muted mt-2">
            {t("forgotPassword.subtitle")}
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <p className="text-sm text-soma-fg-secondary" role="status">
              {t("forgotPassword.confirmation")}
            </p>
            <p className="text-center text-sm text-soma-fg-muted">
              <Link to="/login" className="text-soma-accent hover:underline">
                {t("forgotPassword.backToLogin")}
              </Link>
            </p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs text-soma-fg-secondary uppercase tracking-wider mb-2">
                  {t("forgotPassword.email")}
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
                  ? t("forgotPassword.submitting")
                  : t("forgotPassword.submit")}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-soma-fg-muted">
              <Link to="/login" className="text-soma-accent hover:underline">
                {t("forgotPassword.backToLogin")}
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
