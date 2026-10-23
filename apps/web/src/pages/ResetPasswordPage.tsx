import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { runResetPasswordRequest } from "../features/auth/lib/reset-password-flow.js";
import {
  clearHeldPasswordResetToken,
  takePasswordResetToken,
} from "../features/auth/lib/password-reset-validation.js";
import { AuthPasswordField } from "../features/auth/components/AuthPasswordField.js";
import {
  AuthShell,
  authLinkClass,
  authPrimaryButtonClass,
  authSubtitleClass,
  authTitleClass,
} from "../features/auth/components/AuthShell.js";

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
    <AuthShell>
      {/* Backup if this route was reached via SPA navigation (no index.html bootstrap). */}
      <meta name="referrer" content="no-referrer" />
      <div>
        <div className="mb-8">
          <h1 className={authTitleClass}>{t("resetPassword.title")}</h1>
          <p className={authSubtitleClass}>{t("resetPassword.subtitle")}</p>
        </div>

        {!token && !success ? (
          <div className="space-y-4">
            <p className="text-sm text-soma-organ-damaged" role="alert">
              {t("resetPassword.missingToken")}
            </p>
            <p className="text-center text-sm text-soma-ink-muted">
              <Link to="/forgot-password" className={authLinkClass}>
                {t("resetPassword.requestAnother")}
              </Link>
            </p>
          </div>
        ) : success ? (
          <div className="space-y-4">
            <p className="text-sm text-soma-ink-secondary" role="status">
              <span className="mb-1 block font-medium text-soma-ink">
                {t("resetPassword.successTitle")}
              </span>
              {t("resetPassword.successBody")}
            </p>
            <Link to="/login" className={`${authPrimaryButtonClass} block text-center`}>
              {t("resetPassword.goToLogin")}
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-soma-ink-secondary">
                  {t("resetPassword.newPassword")}
                </label>
                <AuthPasswordField
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <p className="mt-1 text-xs text-soma-ink-muted">
                  {t("resetPassword.passwordHint")}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-soma-ink-secondary">
                  {t("resetPassword.confirmPassword")}
                </label>
                <AuthPasswordField
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
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
                className={authPrimaryButtonClass}
              >
                {submitting
                  ? t("resetPassword.submitting")
                  : t("resetPassword.submit")}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-soma-ink-muted">
              <Link to="/forgot-password" className={authLinkClass}>
                {t("resetPassword.requestAnother")}
              </Link>
            </p>
          </>
        )}
      </div>
    </AuthShell>
  );
}
