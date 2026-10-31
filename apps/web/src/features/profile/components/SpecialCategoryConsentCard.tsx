import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { previewFocus } from "../../recovery-dashboard/focus.js";
import { grantSpecialCategoryConsent } from "../client/profile-api.js";
import { specialCategoryGrantMessageKey } from "../lib/special-category-consent.js";

export function SpecialCategoryConsentCard({
  onGranted,
  onDecline,
  declineBusy = false,
  withdrawn = false,
}: {
  onGranted: () => void | Promise<void>;
  onDecline?: () => void;
  declineBusy?: boolean;
  withdrawn?: boolean;
}) {
  const { t } = useTranslation("account");
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [errorKey, setErrorKey] = useState<"network" | "version" | "failed" | null>(
    null,
  );
  const inFlight = useRef(false);

  const busy = submitting || declineBusy;

  const handleAllow = () => {
    if (!accepted || inFlight.current) return;
    inFlight.current = true;
    setSubmitting(true);
    setErrorKey(null);
    void grantSpecialCategoryConsent()
      .then(async () => {
        await onGranted();
      })
      .catch((error: unknown) => {
        setErrorKey(specialCategoryGrantMessageKey(error));
      })
      .finally(() => {
        inFlight.current = false;
        setSubmitting(false);
      });
  };

  const handleDecline = () => {
    if (busy) return;
    if (onDecline) {
      onDecline();
      return;
    }
    setDismissed(true);
  };

  if (dismissed) {
    return (
      <section className="rounded-2xl border border-soma-line bg-soma-surface/80 p-4 sm:p-5">
        <p className="text-sm text-soma-ink-secondary">
          {t("contextualConsent.dismissed")}
        </p>
        <button
          type="button"
          onClick={() => setDismissed(false)}
          className={`${previewFocus} mt-3 text-sm text-soma-action hover:text-soma-action-hover`}
        >
          {t("contextualConsent.showAgain")}
        </button>
      </section>
    );
  }

  const error =
    errorKey === "network"
      ? t("contextualConsent.network")
      : errorKey === "version"
        ? t("contextualConsent.version")
        : errorKey === "failed"
          ? t("contextualConsent.failed")
          : null;

  return (
    <section className="rounded-2xl border border-soma-line bg-soma-surface/80 p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-soma-ink">
        {t("contextualConsent.title")}
      </h2>
      <p className="mt-1 text-sm text-soma-ink-secondary">
        {t("contextualConsent.lead")}
      </p>
      {withdrawn ? (
        <p className="mt-2 text-sm text-soma-ink-secondary">
          {t("contextualConsent.withdrawnNote")}
        </p>
      ) : null}
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-soma-ink-secondary">
        <li>{t("contextualConsent.what")}</li>
        <li>{t("contextualConsent.why")}</li>
        <li>{t("contextualConsent.voluntary")}</li>
        <li>{t("contextualConsent.withdraw")}</li>
        <li>{t("contextualConsent.education")}</li>
      </ul>
      <p className="mt-3 text-xs text-soma-ink-muted">
        <Link to="/privacy" className={`${previewFocus} text-soma-action hover:underline`}>
          {t("contextualConsent.privacyLink")}
        </Link>
      </p>
      <label className="mt-4 flex items-start gap-2 text-sm text-soma-ink">
        <input
          id="special-category-consent-accept"
          type="checkbox"
          checked={accepted}
          disabled={busy}
          onChange={(event) => setAccepted(event.target.checked)}
          className={`${previewFocus} mt-0.5`}
        />
        <span>{t("contextualConsent.checkbox")}</span>
      </label>
      {error ? (
        <p className="mt-3 text-sm text-soma-organ-damaged" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-3">
        <button
          type="button"
          disabled={!accepted || busy}
          aria-busy={submitting || undefined}
          onClick={handleAllow}
          className={`${previewFocus} rounded-xl bg-soma-action px-4 py-2 text-sm font-medium text-[#081018] disabled:opacity-50`}
        >
          {submitting
            ? t("contextualConsent.granting")
            : t("contextualConsent.allow")}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={handleDecline}
          className={`${previewFocus} rounded-xl border border-soma-line px-4 py-2 text-sm text-soma-ink hover:bg-soma-raised disabled:opacity-50`}
        >
          {declineBusy
            ? t("contextualConsent.declining")
            : t("contextualConsent.later")}
        </button>
      </div>
    </section>
  );
}
