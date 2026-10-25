import { useTranslation } from "react-i18next";
import { keepsFullPhaseCopyVisible } from "../anatomy/educational-nt-safety.js";
import {
  signalingMarkTone,
  type SignalingMarkTone,
} from "../anatomy/signaling-presentation.js";
import type { EducationalSignalingEntry } from "../anatomy/neurotransmitter-education.js";
import { CatalogDetails } from "./CatalogDetails.js";

const MARK_CLASS: Record<SignalingMarkTone, string> = {
  action: "bg-soma-action",
  physiology: "bg-soma-physiology",
  reward: "bg-soma-reward",
  warning: "bg-soma-warning",
};

interface ExploreNeurotransmitterCardProps {
  entry: EducationalSignalingEntry;
  substanceId: string;
}

/**
 * Compact educational transmitter card for Explorar.
 * Identity mark is not a concentration bar. Phase copy is never rewritten.
 */
export function ExploreNeurotransmitterCard({
  entry,
  substanceId,
}: ExploreNeurotransmitterCardProps) {
  const { t } = useTranslation(["explore", "neurotransmitters", "neurotransmitter-phases", "mechanisms"]);
  const name = t(`neurotransmitters:${entry.neurotransmitter}.name`, {
    defaultValue: entry.neurotransmitter,
  });
  const role = t(`neurotransmitters:${entry.neurotransmitter}.shortDescription`, {
    defaultValue: "",
  });
  const mechanism = entry.mechanismKey
    ? t(`mechanisms:${entry.mechanismKey}`, { defaultValue: "" })
    : "";
  const explanation = t(`neurotransmitter-phases:${entry.phaseKey}`, { defaultValue: "" });
  const tone = signalingMarkTone(entry.neurotransmitter);
  const keepPhaseVisible = keepsFullPhaseCopyVisible(
    substanceId,
    entry.neurotransmitter,
    entry.phase,
  );
  const detailsHasMechanism = Boolean(mechanism);
  const detailsHasPhase = Boolean(explanation) && !keepPhaseVisible;
  const showDetails = detailsHasMechanism || detailsHasPhase;

  return (
    <li className="rounded-xl border border-soma-line bg-soma-canvas/40 px-3 py-2.5">
      <div className="flex min-w-0 items-start gap-2.5">
        <span
          role="img"
          aria-label={t("ntMarkAria", { name })}
          className={`mt-1 h-3 w-3 shrink-0 rounded-full ${MARK_CLASS[tone]}`}
        />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div>
            <p className="text-sm font-medium text-soma-ink">{name}</p>
            {role ? (
              <p className="mt-0.5 text-[11px] leading-snug text-soma-ink-muted">{role}</p>
            ) : null}
          </div>
          {keepPhaseVisible && explanation ? (
            <p className="text-xs leading-relaxed text-soma-ink-secondary">{explanation}</p>
          ) : null}
          {showDetails ? (
            <CatalogDetails
              key={`${entry.neurotransmitter}-${entry.phase}`}
              summary={`${name}. ${
                detailsHasPhase ? t("ntDetailsSummary") : t("ntMechanismDetailsSummary")
              }`}
            >
              {mechanism ? (
                <p className="text-[11px] leading-snug text-soma-ink-muted">
                  <span className="font-medium text-soma-ink-secondary">{t("ntMechanismLabel")}: </span>
                  {mechanism}
                </p>
              ) : null}
              {detailsHasPhase && explanation ? (
                <p className="text-xs leading-relaxed text-soma-ink-secondary">
                  <span className="font-medium text-soma-ink-secondary">{t("ntPhaseCopyLabel")}: </span>
                  {explanation}
                </p>
              ) : null}
            </CatalogDetails>
          ) : null}
        </div>
      </div>
    </li>
  );
}
