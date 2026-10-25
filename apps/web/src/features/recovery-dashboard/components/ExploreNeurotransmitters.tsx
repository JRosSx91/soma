import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { resolveEducationalNeurotransmittersForSubstance } from "../anatomy/neurotransmitter-education.js";
import { type ExploreNtPhase } from "../explore/explore-neurotransmitters.js";
import { EducationalPhaseTrack } from "./EducationalPhaseTrack.js";
import { ExploreNeurotransmitterCard } from "./ExploreNeurotransmitterCard.js";

interface ExploreNeurotransmittersProps {
  substanceId: string;
}

export function ExploreNeurotransmitters({ substanceId }: ExploreNeurotransmittersProps) {
  const { t } = useTranslation("explore");
  const titleId = useId();
  const legendId = useId();
  const noticeId = useId();
  const groupName = useId();
  const [phase, setPhase] = useState<ExploreNtPhase>("during_use");
  const entries = resolveEducationalNeurotransmittersForSubstance(substanceId, phase);

  return (
    <section className="space-y-2.5" aria-labelledby={titleId}>
      <h3 id={titleId} className="font-medium text-soma-ink">
        {t("ntTitle")}
      </h3>
      <p id={legendId} className="text-[11px] font-medium text-soma-ink-secondary">
        {t("ntPhaseLegend")}
      </p>
      <EducationalPhaseTrack
        phase={phase}
        onPhase={setPhase}
        labelledBy={legendId}
        describedBy={noticeId}
        name={groupName}
      />
      <p id={noticeId} className="text-[11px] leading-relaxed text-soma-ink-muted">
        {t("ntPhaseNotice")}
      </p>

      {entries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-soma-line px-3 py-2 text-soma-ink-muted">
          {t("ntEmpty")}
        </p>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry) => (
            <ExploreNeurotransmitterCard
              key={entry.neurotransmitter}
              entry={entry}
              substanceId={substanceId}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
