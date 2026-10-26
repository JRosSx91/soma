import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { previewFocus } from "../../recovery-dashboard/focus.js";
import { AchievementMedal } from "../../recovery-dashboard/components/AchievementMedal.js";
import type { AchievementWithUnlockState } from "../types.js";
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
  const solo = mode === "solo" ? achievements[0] : null;

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
        initial: { opacity: 0, scale: 0.92, y: 16 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.96, y: 8 },
      };

  return (
    <AnimatePresence>
      {open && mode !== "none" && achievements.length > 0 ? (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-[#081018]/75"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden="true"
            onClick={onClose}
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className={`fixed inset-x-4 top-1/2 z-[61] mx-auto max-h-[min(88vh,40rem)] w-full max-w-md -translate-y-1/2 overflow-y-auto rounded-2xl border border-soma-line bg-soma-raised p-5 shadow-2xl outline-none ${
              platinum ? "ring-2 ring-soma-action/80" : ""
            }`}
            {...motionProps}
            transition={{ duration: reduceMotion ? 0.12 : 0.28 }}
          >
            {!reduceMotion ? <CelebrationSparkles platinum={platinum} /> : null}

            <div className="relative">
              <p
                id={titleId}
                className="text-center text-[11px] font-medium uppercase tracking-[0.16em] text-soma-action"
              >
                {mode === "group"
                  ? t("celebration.groupTitle", { count: achievements.length })
                  : t("celebration.soloTitle")}
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
              ) : (
                <ul className="mt-4 flex flex-wrap justify-center gap-3">
                  {achievements.map((row) => (
                    <li key={row.id} className="w-16 sm:w-20">
                      <AchievementMedal
                        substanceId={row.triggerSubstanceId}
                        tier={row.tier}
                        locked={false}
                        size="card"
                        showTierLabel={false}
                      />
                    </li>
                  ))}
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
              ) : (
                <ul className="mt-4 max-h-32 space-y-1 overflow-y-auto text-center text-sm text-soma-ink">
                  {achievements.map((row) => (
                    <li key={row.id}>{t(`achievements:${row.titleKey}`)}</li>
                  ))}
                </ul>
              )}

              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
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
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
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
