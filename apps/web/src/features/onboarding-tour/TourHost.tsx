import { useTranslation } from "react-i18next";
import { previewFocus } from "../recovery-dashboard/focus.js";
import { useOnboardingTour } from "./useOnboardingTour.js";

/**
 * ONB-01A engine chrome. Visual treatment (Somi, spotlight) is ONB-01B.
 */
export function OnboardingTourHost() {
  const { t } = useTranslation("onboarding-tour");
  const tour = useOnboardingTour();

  if (tour.phase === "invite" || tour.phase === "continue") {
    const continueMode = tour.phase === "continue";
    return (
      <div
        data-onb-chrome={continueMode ? "continue" : "invite"}
        role="dialog"
        aria-modal="false"
        aria-labelledby="onb-invite-title"
        className="pointer-events-auto fixed inset-x-4 bottom-20 z-[60] rounded-xl border border-soma-line bg-soma-raised p-4 shadow-lg lg:inset-x-auto lg:bottom-6 lg:right-6 lg:w-[22rem]"
      >
        <h2 id="onb-invite-title" className="text-sm font-semibold text-soma-ink">
          {t(continueMode ? "continueTitle" : "inviteTitle")}
        </h2>
        <p className="mt-2 text-sm text-soma-ink-secondary">
          {t(continueMode ? "continueBody" : "inviteBody")}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className={`${previewFocus} rounded-lg bg-soma-action px-3 py-2 text-sm text-[#081018]`}
            onClick={continueMode ? tour.continueFromSaved : tour.start}
          >
            {t(continueMode ? "continueAction" : "start")}
          </button>
          <button type="button" className={`${previewFocus} rounded-lg px-3 py-2 text-sm text-soma-ink-secondary`} onClick={tour.dismissInvite}>
            {t("later")}
          </button>
        </div>
      </div>
    );
  }

  if (tour.phase !== "active" || !tour.step) return null;

  return (
    <div
      data-onb-chrome="engine"
      data-onb-step={tour.step.id}
      data-onb-missing-anchor={tour.missingAnchor ? "true" : "false"}
      role="dialog"
      aria-modal="true"
      aria-labelledby="onb-step-title"
      className="pointer-events-auto fixed inset-x-4 bottom-20 z-[60] rounded-xl border border-soma-line bg-soma-raised p-4 shadow-lg lg:inset-x-auto lg:bottom-6 lg:right-6 lg:w-[22rem]"
    >
      <p className="text-[11px] uppercase tracking-[0.14em] text-soma-ink-muted">
        {t("stepStatus", { current: tour.stepIndex + 1, total: tour.stepCount })}
      </p>
      <h2 id="onb-step-title" className="mt-1 text-sm font-semibold text-soma-ink">
        {t(tour.step.titleKey)}
      </h2>
      <p className="mt-2 text-sm text-soma-ink-secondary">{t(tour.step.bodyKey)}</p>
      <p className="mt-2 text-[11px] text-soma-ink-muted">{t("engineNote")}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className={`${previewFocus} rounded-lg px-3 py-2 text-sm text-soma-ink-secondary`}
          onClick={tour.back}
          disabled={tour.stepIndex === 0}
        >
          {t("back")}
        </button>
        {tour.last ? (
          <button type="button" className={`${previewFocus} rounded-lg bg-soma-action px-3 py-2 text-sm text-[#081018]`} onClick={tour.finish}>
            {t("finish")}
          </button>
        ) : (
          <button type="button" className={`${previewFocus} rounded-lg bg-soma-action px-3 py-2 text-sm text-[#081018]`} onClick={tour.next}>
            {t("next")}
          </button>
        )}
        <button type="button" className={`${previewFocus} rounded-lg px-3 py-2 text-sm text-soma-ink-secondary`} onClick={tour.skip}>
          {t("skip")}
        </button>
      </div>
    </div>
  );
}
