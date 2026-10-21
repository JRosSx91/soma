import { useTranslation } from "react-i18next";
import {
  signalingMarkTone,
  type SignalingMarkTone,
} from "../anatomy/signaling-presentation.js";
import type { EducationalSignalingEntry } from "../anatomy/neurotransmitter-education.js";

const MARK_CLASS: Record<SignalingMarkTone, string> = {
  action: "bg-soma-action",
  physiology: "bg-soma-physiology",
  reward: "bg-soma-reward",
  warning: "bg-soma-warning",
};

/**
 * Qualitative signaling card for the Effects tab.
 * Color identifies the transmitter. It is not a concentration bar.
 */
export function EducationalSignalingCard({ entry }: { entry: EducationalSignalingEntry }) {
  const { t } = useTranslation(["anatomy", "neurotransmitters", "neurotransmitter-phases", "mechanisms"]);
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

  return (
    <li className="rounded-xl border border-soma-line bg-soma-canvas/40 px-3 py-2">
      <div className="flex min-w-0 items-start gap-2.5">
        <span
          role="img"
          aria-label={t("signalingMarkAria", { name })}
          className={`mt-1 h-3 w-3 shrink-0 rounded-full ${MARK_CLASS[tone]}`}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-soma-ink">{name}</p>
          {role ? (
            <p className="mt-0.5 text-[11px] leading-snug text-soma-ink-muted">
              <span className="font-medium text-soma-ink-secondary">{t("signalingRoleLabel")}: </span>
              {role}
            </p>
          ) : null}
          {mechanism ? (
            <p className="mt-0.5 text-[11px] leading-snug text-soma-ink-muted">
              <span className="font-medium text-soma-ink-secondary">{t("signalingMechanismLabel")}: </span>
              {mechanism}
            </p>
          ) : null}
          {explanation ? (
            <p className="mt-1.5 text-xs leading-relaxed text-soma-ink-secondary">{explanation}</p>
          ) : null}
        </div>
      </div>
    </li>
  );
}
