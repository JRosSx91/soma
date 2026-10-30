import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { queryTourAnchor } from "./tour-steps.js";
import { useOnboardingTour } from "./useOnboardingTour.js";
import {
  TourActions,
  TourProgress,
  TourSpotlight,
  TourTalkCard,
} from "./TourChrome.js";
import { tourGhostBtn, tourPrimaryBtn } from "./tour-buttons.js";
import { useLiveAnchorBox } from "./useLiveAnchorBox.js";

export function OnboardingTourHost() {
  const { t } = useTranslation("onboarding-tour");
  const tour = useOnboardingTour();
  const { pathname } = useLocation();
  const anchorEl =
    tour.phase === "active" && tour.activeAnchor && pathname
      ? queryTourAnchor(tour.activeAnchor)
      : null;
  const hole = useLiveAnchorBox(anchorEl);

  if (tour.phase === "invite" || tour.phase === "continue") {
    const continueMode = tour.phase === "continue";
    return (
      <TourTalkCard
        somi="waving"
        labelledBy="onb-invite-title"
        chrome={continueMode ? "continue" : "invite"}
        hole={null}
        compactBottom
      >
        <h2 id="onb-invite-title" className="text-base font-semibold text-soma-ink">
          {t(continueMode ? "continueTitle" : "inviteTitle")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-soma-ink-secondary">
          {t(continueMode ? "continueBody" : "inviteBody")}
        </p>
        <TourActions
          primaryLabel={t(continueMode ? "continueAction" : "start")}
          onPrimary={continueMode ? tour.continueFromSaved : tour.start}
          secondaryLabel={t("later")}
          onSecondary={tour.dismissInvite}
        />
      </TourTalkCard>
    );
  }

  if (tour.phase !== "active" || !tour.step) return null;

  return (
    <>
      <TourSpotlight hole={tour.missingAnchor ? null : hole} />
      <TourTalkCard
        somi={tour.step.somi}
        labelledBy="onb-step-title"
        chrome="engine"
        hole={tour.missingAnchor ? null : hole}
        compactBottom={false}
      >
        <div data-onb-step={tour.step.id} data-onb-missing-anchor={tour.missingAnchor ? "true" : "false"}>
          <TourProgress current={tour.stepIndex + 1} total={tour.stepCount} />
          <h2 id="onb-step-title" className="text-base font-semibold text-soma-ink">
            {t(tour.step.titleKey)}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-soma-ink-secondary">{t(tour.step.bodyKey)}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {tour.stepIndex > 0 ? (
              <button type="button" className={tourGhostBtn} onClick={tour.back}>
                {t("back")}
              </button>
            ) : null}
            {tour.last ? (
              <button type="button" className={tourPrimaryBtn} onClick={tour.finish}>
                {t("finish")}
              </button>
            ) : (
              <button type="button" className={tourPrimaryBtn} onClick={tour.next}>
                {t("next")}
              </button>
            )}
            <button type="button" className={tourGhostBtn} onClick={tour.skip}>
              {t("exit")}
            </button>
          </div>
        </div>
      </TourTalkCard>
    </>
  );
}
