import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { runForgotPasswordRequest } from "../features/auth/lib/forgot-password-flow.js";
import {
  AuthShell,
  authFieldClass,
  authLinkClass,
  authPrimaryButtonClass,
  authSubtitleClass,
  authTitleClass,
} from "../features/auth/components/AuthShell.js";

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
    <AuthShell>
      <div>
        <div className="mb-8">
          <h1 className={authTitleClass}>{t("forgotPassword.title")}</h1>
          <p className={authSubtitleClass}>{t("forgotPassword.subtitle")}</p>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <p className="text-sm text-soma-ink-secondary" role="status">
              {t("forgotPassword.confirmation")}
            </p>
            <p className="text-center text-sm text-soma-ink-muted">
              <Link to="/login" className={authLinkClass}>
                {t("forgotPassword.backToLogin")}
              </Link>
            </p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-soma-ink-secondary">
                  {t("forgotPassword.email")}
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
                {submitting
                  ? t("forgotPassword.submitting")
                  : t("forgotPassword.submit")}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-soma-ink-muted">
              <Link to="/login" className={authLinkClass}>
                {t("forgotPassword.backToLogin")}
              </Link>
            </p>
          </>
        )}
      </div>
    </AuthShell>
  );
}
