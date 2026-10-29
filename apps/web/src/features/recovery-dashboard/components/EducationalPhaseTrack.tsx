import { useTranslation } from "react-i18next";
import { previewFocus } from "../focus.js";
import {
  exploreNtPhases,
  type ExploreNtPhase,
} from "../explore/explore-neurotransmitters.js";

interface EducationalPhaseTrackProps {
  phase: ExploreNtPhase;
  onPhase: (phase: ExploreNtPhase) => void;
  labelledBy: string;
  describedBy?: string;
  name: string;
}

/**
 * Four-segment educational phase selector.
 * The filled segment marks the chosen catalog phase only. It is not
 * intensity, concentration, recovery percent, or elapsed time.
 */
export function EducationalPhaseTrack({
  phase,
  onPhase,
  labelledBy,
  describedBy,
  name,
}: EducationalPhaseTrackProps) {
  const { t } = useTranslation("explore");

  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className="grid grid-cols-2 gap-1.5"
    >
      {exploreNtPhases.map((item) => {
        const selected = item === phase;
        return (
          <label
            key={item}
            className={`${previewFocus} flex cursor-pointer flex-col gap-1.5 rounded-xl border px-2 py-2 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-soma-focus ${
              selected
                ? "border-soma-action bg-soma-action/10"
                : "border-soma-line bg-soma-canvas/40"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={item}
              checked={selected}
              onChange={() => onPhase(item)}
              className="sr-only"
            />
            <span
              aria-hidden="true"
              className={`h-1.5 w-full rounded-full ${
                selected ? "bg-soma-action" : "bg-soma-line"
              }`}
            />
            <span className="text-left text-[11px] leading-snug text-soma-ink">
              {t(`ntPhases.${item}`)}
            </span>
          </label>
        );
      })}
    </div>
  );
}
