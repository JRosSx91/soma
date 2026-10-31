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
import { useInviteEscape } from "./useInviteEscape.js";

function swallowBackground(event: { preventDefault: () => void; stopPropagation: () => void }) {
  event.preventDefault();
  event.stopPropagation();
}

export function OnboardingTourHost() {
  const { t } = useTranslation("onboarding-tour");
  const tour = useOnboardingTour();
  const { pathname } = useLocation();
  const inviting = tour.phase === "invite" || tour.phase === "continue";
  const active = tour.phase === "active";
  const anchorEl = active && tour.activeAnchor && pathname ? queryTourAnchor(tour.activeAnchor) : null;
  const hole = useLiveAnchorBox(anchorEl);
  useInviteEscape(inviting, tour.dismissInvite);

  if (inviting) {
    const continueMode = tour.phase === "continue";
    return (
      <TourTalkCard
        somi="waving"
        labelledBy="onb-invite-title"
        describedBy="onb-invite-body"
        chrome={continueMode ? "continue" : "invite"}
        hole={null}
        compactBottom
      >
        <h2 id="onb-invite-title" className="text-base font-semibold text-soma-ink">
          {t(continueMode ? "continueTitle" : "inviteTitle")}
        </h2>
        <p id="onb-invite-body" className="mt-2 text-sm leading-relaxed text-soma-ink-secondary">
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

  if (!active || !tour.step) return null;

  return (
    <>
      <div
        className="onb-guard"
        data-onb-guard="true"
        aria-hidden="true"
        onPointerDown={swallowBackground}
        onMouseDown={swallowBackground}
        onClick={swallowBackground}
        onTouchStart={swallowBackground}
      >
        <TourSpotlight hole={tour.missingAnchor ? null : hole} />
      </div>
      <TourTalkCard
        somi={tour.step.somi}
        labelledBy="onb-step-title"
        describedBy="onb-step-body"
        chrome="engine"
        hole={tour.missingAnchor ? null : hole}
        compactBottom={false}
        lock={{ active: true, stepId: tour.step.id, onExit: tour.skip }}
      >
        <div data-onb-step={tour.step.id} data-onb-missing-anchor={tour.missingAnchor ? "true" : "false"}>
          <TourProgress current={tour.stepIndex + 1} total={tour.stepCount} />
          <h2 id="onb-step-title" className="text-base font-semibold text-soma-ink">
            {t(tour.step.titleKey)}
          </h2>
          <p id="onb-step-body" className="mt-2 text-sm leading-relaxed text-soma-ink-secondary">
            {t(tour.step.bodyKey)}
          </p>
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
