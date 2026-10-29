import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/index.js";
import { previewFocus } from "../../recovery-dashboard/focus.js";
import { deleteOwnAccount } from "../client/profile-api.js";
import {
  canConfirmDeleteAccount,
  submitDeleteAccount,
} from "../lib/delete-account.js";

export function DeleteAccountSection() {
  const { t } = useTranslation("account");
  const { clearSessionAfterAccountDeletion } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [password, setPassword] = useState("");
  const [errorKind, setErrorKind] = useState<"wrongPassword" | "failed" | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const inFlight = useRef(false);

  const closeDialog = () => {
    if (inFlight.current) return;
    setDialogOpen(false);
    setAcknowledged(false);
    setPassword("");
    setErrorKind(null);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (
      !canConfirmDeleteAccount({
        acknowledged,
        password,
        submitting: submitting || inFlight.current,
      })
    ) {
      return;
    }
    setSubmitting(true);
    void submitDeleteAccount({
      acknowledged,
      password,
      inFlight,
      deleteFn: deleteOwnAccount,
      onSuccess: () => {
        setPassword("");
        // Clear session first. ProtectedRoute then sends anonymous
        // `account_deleted` visitors to `/` after that state is committed.
        clearSessionAfterAccountDeletion();
      },
      onWrongPassword: () => {
        setPassword("");
        setErrorKind("wrongPassword");
      },
      onKeepSessionFailure: () => {
        setErrorKind("failed");
      },
    }).finally(() => {
      setSubmitting(false);
    });
  };

  const canSubmit = canConfirmDeleteAccount({
    acknowledged,
    password,
    submitting,
  });

  return (
    <section className="rounded-2xl border border-soma-organ-damaged/40 bg-soma-surface/80 p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-soma-ink">{t("delete.title")}</h2>
      <p className="mt-1 text-sm text-soma-ink-secondary">{t("delete.lead")}</p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-soma-ink-secondary">
        <li>{t("delete.bulletPermanent")}</li>
        <li>{t("delete.bulletData")}</li>
        <li>{t("delete.bulletSessions")}</li>
        <li>{t("delete.bulletIrreversible")}</li>
        <li>{t("delete.bulletInvite")}</li>
      </ul>
      <button
        type="button"
        onClick={() => {
          setErrorKind(null);
          setDialogOpen(true);
        }}
        className={`${previewFocus} mt-4 rounded-xl border border-soma-organ-damaged/50 px-4 py-2 text-sm text-soma-ink hover:bg-soma-raised`}
      >
        {t("delete.openDialog")}
      </button>

      {dialogOpen ? (
        <DeleteAccountDialog
          acknowledged={acknowledged}
          password={password}
          errorKind={errorKind}
          submitting={submitting}
          canSubmit={canSubmit}
          onAcknowledgeChange={setAcknowledged}
          onPasswordChange={setPassword}
          onClose={closeDialog}
          onSubmit={handleSubmit}
        />
      ) : null}
    </section>
  );
}

export function DeleteAccountDialog({
  acknowledged,
  password,
  errorKind,
  submitting,
  canSubmit,
  onAcknowledgeChange,
  onPasswordChange,
  onClose,
  onSubmit,
}: {
  acknowledged: boolean;
  password: string;
  errorKind: "wrongPassword" | "failed" | null;
  submitting: boolean;
  canSubmit: boolean;
  onAcknowledgeChange: (value: boolean) => void;
  onPasswordChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
}) {
  const { t } = useTranslation("account");
  const error =
    errorKind === "wrongPassword"
      ? t("delete.wrongPassword")
      : errorKind === "failed"
        ? t("delete.failed")
        : null;
  const passwordInvalid = errorKind === "wrongPassword";

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-[#081018]/70 p-4 sm:items-center"
      onClick={submitting ? undefined : onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-account-title"
        className="w-full max-w-md rounded-2xl border border-soma-line bg-soma-surface p-5 shadow-[0_16px_40px_rgb(4_10_16/0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          id="delete-account-title"
          className="text-lg font-semibold text-soma-ink"
        >
          {t("delete.dialogTitle")}
        </h2>
        <p className="mt-2 text-sm text-soma-ink-secondary">
          {t("delete.dialogBody")}
        </p>
        <form onSubmit={onSubmit} className="mt-4 space-y-4" autoComplete="off">
          <label className="flex items-start gap-2 text-sm text-soma-ink">
            <input
              type="checkbox"
              checked={acknowledged}
              disabled={submitting}
              onChange={(event) => onAcknowledgeChange(event.target.checked)}
              className={`${previewFocus} mt-0.5`}
            />
            <span>{t("delete.acknowledge")}</span>
          </label>
          <div>
            <label
              htmlFor="delete-account-password"
              className="block text-[11px] font-medium uppercase tracking-[0.08em] text-soma-ink-muted"
            >
              {t("delete.password")}
            </label>
            <input
              id="delete-account-password"
              type="password"
              value={password}
              disabled={submitting}
              onChange={(event) => onPasswordChange(event.target.value)}
              autoComplete="current-password"
              aria-invalid={passwordInvalid ? true : undefined}
              aria-describedby={
                passwordInvalid ? "delete-account-error" : undefined
              }
              className={`${previewFocus} mt-1 w-full rounded-xl border border-soma-line bg-soma-raised px-3 py-2 text-sm text-soma-ink`}
            />
          </div>
          {error ? (
            <p
              id="delete-account-error"
              className="text-sm text-soma-organ-damaged"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <button
              type="submit"
              disabled={!canSubmit}
              aria-busy={submitting || undefined}
              className={`${previewFocus} rounded-xl bg-soma-organ-damaged px-4 py-2 text-sm font-medium text-[#081018] disabled:opacity-50`}
            >
              {submitting ? t("delete.submitting") : t("delete.confirm")}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className={`${previewFocus} rounded-xl border border-soma-line px-4 py-2 text-sm text-soma-ink hover:bg-soma-raised disabled:opacity-50`}
            >
              {t("delete.cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
