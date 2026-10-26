import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { previewFocus } from "../../recovery-dashboard/focus.js";
import { AchievementMedal } from "../../recovery-dashboard/components/AchievementMedal.js";
import type { AchievementWithUnlockState } from "../types.js";
import { celebrationMedalLayout } from "../celebration/celebration-layout.js";
import type { CelebrationMode } from "../celebration/celebration-plan.js";
import {
  isCelebrateSoundEnabled,
  playCelebrateChime,
  setCelebrateSoundEnabled,
} from "../celebration/celebration-sound.js";

interface AchievementCelebrationModalProps {
  open: boolean;
  mode: CelebrationMode;
  achievements: AchievementWithUnlockState[];
  onClose: () => void;
}

export function AchievementCelebrationModal({
  open,
  mode,
  achievements,
  onClose,
}: AchievementCelebrationModalProps) {
  const { t } = useTranslation(["common", "achievements"]);
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const [soundOn, setSoundOn] = useState(() => isCelebrateSoundEnabled());
  const platinum = achievements.some((row) => row.tier === "platinum");
  const layout = celebrationMedalLayout(achievements.length);
  const solo = layout === "solo" ? achievements[0] : null;

  useEffect(() => {
    if (!open) return;
    previousFocus.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    dialogRef.current?.focus();
    document.body.style.overflow = "hidden";
    if (isCelebrateSoundEnabled()) playCelebrateChime({ platinum });
    return () => {
      document.body.style.overflow = "";
      previousFocus.current?.focus();
    };
  }, [open, platinum]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function toggleSound() {
    const next = !soundOn;
    setCelebrateSoundEnabled(next);
    setSoundOn(next);
    if (next) playCelebrateChime({ platinum });
  }

  const motionProps = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scale: 0.96 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.98 },
      };

  const overlay = open && mode !== "none" && achievements.length > 0;
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {overlay ? (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-x-hidden p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-[#081018]/75"
            aria-label={t("close")}
            onClick={onClose}
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className={`relative z-[61] flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-soma-line bg-soma-raised shadow-2xl outline-none ${
              platinum ? "ring-2 ring-soma-action/80" : ""
            }`}
            {...motionProps}
            transition={{ duration: reduceMotion ? 0.12 : 0.28 }}
          >
            {!reduceMotion ? <CelebrationSparkles platinum={platinum} /> : null}

            <div className="relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-5 pb-6 pt-5">
              <p
                id={titleId}
                className="text-center text-[11px] font-medium uppercase tracking-[0.16em] text-soma-action"
              >
                {layout === "solo"
                  ? t("celebration.soloTitle")
                  : t("celebration.groupTitle", { count: achievements.length })}
              </p>

              {solo ? (
                <div className="mx-auto mt-4 w-40 sm:w-48">
                  <AchievementMedal
                    substanceId={solo.triggerSubstanceId}
                    tier={solo.tier}
                    locked={false}
                    size="detail"
                    showTierLabel
                  />
                </div>
              ) : layout === "featured" ? (
                <ul className="mt-4 flex flex-wrap justify-center gap-4">
                  {achievements.map((row) => {
                    const title = t(`achievements:${row.titleKey}`);
                    return (
                      <li key={row.id} className="w-28">
                        <AchievementMedal
                          substanceId={row.triggerSubstanceId}
                          tier={row.tier}
                          locked={false}
                          size="card"
                          showTierLabel
                        />
                        <p className="mt-1 line-clamp-2 text-center text-xs font-medium text-soma-ink">
                          {title}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <ul className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-5">
                  {achievements.map((row) => {
                    const title = t(`achievements:${row.titleKey}`);
                    return (
                      <li key={row.id} className="flex justify-center">
                        <span title={title} className="flex flex-col items-center">
                          <AchievementMedal
                            substanceId={row.triggerSubstanceId}
                            tier={row.tier}
                            locked={false}
                            size="compact"
                            showTierLabel={false}
                          />
                          <span className="sr-only">{title}</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}

              {solo ? (
                <>
                  <h2 className="mt-3 text-center text-lg font-semibold text-soma-ink">
                    {t(`achievements:${solo.titleKey}`)}
                  </h2>
                  <p className="mt-2 line-clamp-4 text-center text-sm leading-relaxed text-soma-ink-secondary">
                    {t(`achievements:${solo.descriptionKey}`)}
                  </p>
                </>
              ) : layout === "grid" ? (
                <ul className="mt-4 space-y-1 text-sm text-soma-ink">
                  {achievements.map((row) => (
                    <li key={row.id}>{t(`achievements:${row.titleKey}`)}</li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="relative flex shrink-0 flex-col gap-2 border-t border-soma-line/60 px-5 py-3 sm:flex-row sm:items-center">
              <button
                type="button"
                className={`${previewFocus} min-h-11 flex-1 rounded-xl bg-soma-action px-4 py-2.5 text-sm font-semibold text-[#081018] hover:bg-soma-action-hover`}
                onClick={onClose}
              >
                {t("celebration.continue")}
              </button>
              {mode === "group" ? (
                <Link
                  to="/app/achievements"
                  className={`${previewFocus} min-h-11 rounded-xl px-4 py-2.5 text-center text-sm text-soma-action hover:text-soma-action-hover`}
                  onClick={onClose}
                >
                  {t("celebration.viewAll")}
                </Link>
              ) : null}
              <button
                type="button"
                className={`${previewFocus} ml-auto flex h-11 w-11 items-center justify-center rounded-full text-soma-ink-secondary hover:bg-soma-surface hover:text-soma-ink`}
                aria-pressed={soundOn}
                aria-label={
                  soundOn
                    ? t("celebration.soundDisable")
                    : t("celebration.soundEnable")
                }
                onClick={toggleSound}
              >
                {soundOn ? (
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <VolumeX className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

function CelebrationSparkles({ platinum }: { platinum: boolean }) {
  const dots = platinum
    ? ["12%", "28%", "46%", "62%", "78%", "88%"]
    : ["18%", "40%", "70%", "84%"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {dots.map((left, index) => (
        <motion.span
          key={left}
          className={`absolute h-1.5 w-1.5 rounded-full ${
            platinum ? "bg-soma-action" : "bg-white/50"
          }`}
          style={{ left, top: `${12 + index * 10}%` }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: [0, 1, 0], y: -18 }}
          transition={{ duration: 1.4, delay: index * 0.08, repeat: Infinity }}
        />
      ))}
    </div>
  );
}
