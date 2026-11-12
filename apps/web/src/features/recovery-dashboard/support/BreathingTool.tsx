import { useLayoutEffect, useRef, type RefObject } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { previewFocus } from "../focus.js";
import type { BreathingSnapshot } from "./breathing-session.js";
import { SupportHalo } from "./SupportHalo.js";
import {
  breathingCircleStyle,
  breathingKeyframes,
  supportBackdrop,
  supportGlowIcon,
  supportToolVisuals,
} from "./support-visuals.js";
import { useBreathingSession } from "./useBreathingSession.js";

const visual = supportToolVisuals.breathing;

export function BreathingTool() {
  const { session, snapshot } = useBreathingSession();
  const primaryRef = useRef<HTMLButtonElement>(null);
  const circleRef = useRef<HTMLSpanElement>(null);

  // A new CSS animation only starts once the compositor commits, which can
  // lag by hundreds of ms. Anchor it to the clock instead; the session clock
  // is `performance.now()`, which shares its origin with `document.timeline`.
  const { runStartedAt } = snapshot;
  useLayoutEffect(() => {
    if (runStartedAt === null) return;
    const animation = circleRef.current?.getAnimations?.()[0];
    if (animation) animation.startTime = runStartedAt;
  }, [runStartedAt]);

  const onPrimary = () => {
    if (snapshot.status === "idle") session.start();
    else if (snapshot.status === "running") session.pause();
    else session.resume();
  };
  // Restart removes its own button; keep keyboard focus on the exercise.
  const onRestart = () => {
    session.reset();
    primaryRef.current?.focus();
  };

  return (
    <BreathingToolView
      snapshot={snapshot}
      onPrimary={onPrimary}
      onRestart={onRestart}
      primaryRef={primaryRef}
      circleRef={circleRef}
    />
  );
}

interface BreathingToolViewProps {
  snapshot: BreathingSnapshot;
  onPrimary?: () => void;
  onRestart?: () => void;
  primaryRef?: RefObject<HTMLButtonElement | null>;
  circleRef?: RefObject<HTMLSpanElement | null>;
}

export function BreathingToolView({
  snapshot,
  onPrimary,
  onRestart,
  primaryRef,
  circleRef,
}: BreathingToolViewProps) {
  const { t } = useTranslation("support");
  const { status, phase } = snapshot;
  const Icon = visual.icon;
  const phaseLabel = t(`tools.breathing.${phase}`);
  const liveText =
    status === "running" ? phaseLabel : status === "paused" ? t("tools.breathing.paused") : "";
  const primaryLabel =
    status === "idle"
      ? t("tools.breathing.start")
      : status === "running"
        ? t("tools.breathing.pause")
        : t("tools.breathing.resume");
  const PrimaryIcon = status === "running" ? Pause : Play;
  const exhaling = status !== "idle" && phase === "exhale";

  return (
    <li
      data-tool="breathing"
      data-breathing-status={status}
      className="flex min-w-0 flex-col gap-3 overflow-hidden rounded-2xl border border-soma-shell-accent/40 bg-soma-surface/90"
    >
      <div
        className="relative flex h-40 w-full shrink-0 items-center justify-center border-b border-soma-line sm:h-36"
        style={supportBackdrop(visual)}
      >
        <style>{breathingKeyframes}</style>
        <SupportHalo rgb={visual.rgb} always />
        <span
          ref={circleRef}
          data-breathing-circle
          className={`absolute left-1/2 top-1/2 -ml-14 -mt-14 h-28 w-28 rounded-full border-2 motion-reduce:!animate-none motion-reduce:![transform:none] ${
            exhaling ? "border-violet-300/70" : "border-cyan-300/70"
          }`}
          style={{
            ...breathingCircleStyle(snapshot),
            background: `radial-gradient(circle, rgb(${visual.rgb} / 0.22) 0%, rgb(${visual.haloRgb} / 0.16) 60%, transparent 100%)`,
            boxShadow: `0 0 24px rgb(${visual.rgb} / 0.25)`,
          }}
          aria-hidden="true"
        />
        <span
          className="relative flex flex-col items-center gap-0.5 text-center"
          style={{ textShadow: "0 1px 6px rgb(0 0 0 / 0.6)" }}
          aria-hidden="true"
        >
          {status === "idle" ? (
            <Icon className="h-12 w-12" strokeWidth={1.35} style={supportGlowIcon(visual)} />
          ) : (
            <>
              {status === "paused" ? (
                <span className="text-[11px] font-semibold uppercase tracking-wide text-soma-ink-secondary">
                  {t("tools.breathing.paused")}
                </span>
              ) : null}
              <span className="text-lg font-semibold leading-tight text-soma-ink">{phaseLabel}</span>
              <span className="text-sm tabular-nums text-soma-ink-secondary">
                {t("tools.breathing.secondsLeft", { count: snapshot.remainingSeconds })}
              </span>
            </>
          )}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col px-4 pb-4">
        <h3 className="text-base font-semibold leading-snug text-soma-ink">
          {t("tools.breathing.title")}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-soma-ink-secondary">{t("tools.breathing.body")}</p>
        <p className="mt-1 text-sm font-medium leading-relaxed text-soma-ink">{t("tools.breathing.rhythm")}</p>
        <p className="mt-2 text-xs leading-relaxed text-soma-ink-muted">{t("tools.breathing.notice")}</p>
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {liveText}
        </p>
        <div
          role="group"
          aria-label={t("tools.breathing.controls")}
          className="mt-auto flex flex-wrap gap-2 pt-3"
        >
          <button
            ref={primaryRef}
            type="button"
            onClick={onPrimary}
            className={`${previewFocus} inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl border border-soma-shell-accent/50 bg-soma-shell-accent/15 px-3 py-2 text-sm font-semibold text-soma-ink motion-safe:transition-colors motion-reduce:transition-none hover:bg-soma-shell-accent/25`}
          >
            <PrimaryIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {primaryLabel}
          </button>
          {status !== "idle" ? (
            <button
              type="button"
              onClick={onRestart}
              className={`${previewFocus} inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl border border-soma-line-strong px-3 py-2 text-sm font-medium text-soma-ink-secondary motion-safe:transition-colors motion-reduce:transition-none hover:bg-soma-raised/70 hover:text-soma-ink`}
            >
              <RotateCcw className="h-4 w-4 shrink-0" aria-hidden="true" />
              {t("tools.breathing.restart")}
            </button>
          ) : null}
        </div>
      </div>
    </li>
  );
}
