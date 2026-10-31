import { useTranslation } from "react-i18next";
import { previewFocus } from "../recovery-dashboard/focus.js";
import { useOnboardingTourOptional } from "./useOnboardingTour.js";

/** Account entry to replay the tour. Safe on DEMO (in-memory) and LIVE. */
export function TourRestartControl() {
  const { t } = useTranslation("onboarding-tour");
  const tour = useOnboardingTourOptional();
  if (!tour) return null;

  return (
    <div className="rounded-2xl border border-soma-line bg-soma-surface px-4 py-3">
      <p className="text-sm text-soma-ink-secondary">{t("restartHint")}</p>
      <button
        type="button"
        className={`${previewFocus} mt-2 text-sm text-soma-action hover:underline`}
        onClick={tour.restart}
      >
        {t("restart")}
      </button>
    </div>
  );
}
