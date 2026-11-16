import { useEffect, useId, useRef, useState } from "react";
import { ArrowUpRight, LifeBuoy } from "lucide-react";
import { Link } from "react-router-dom";
import { Somi } from "../../somi/index.js";
import { useShellBase } from "../context/ShellBaseContext.js";
import { previewFocus } from "../focus.js";
import {
  AFTER_USE_SOMI_BY_STEP,
  formatAfterUseStepProgress,
  getSupportAfterUseContent,
  type SupportAfterUseLocale,
} from "./support-after-use-content.js";
import {
  AFTER_USE_COMPANION_STEPS,
  SUPPORT_AFTER_USE_ANCHOR_ID,
  type AfterUseCompanionStep,
} from "./support-after-use-tool.js";
import { SUPPORT_HELP_PANEL_HASH } from "./support-guide.js";
import { SUPPORT_TERMS_EMERGENCY_HREF } from "./support-links.js";
import { SUPPORT_BREATHING_ANCHOR_ID } from "./support-strategies.js";

function localeFromLanguage(language: string | undefined): SupportAfterUseLocale {
  return language?.toLowerCase().startsWith("es") ? "es" : "en";
}

export function AfterUseCompanionTool({
  language,
  onExitToHub,
}: {
  language: string | undefined;
  onExitToHub: () => void;
}) {
  const base = useShellBase();
  const locale = localeFromLanguage(language);
  const copy = getSupportAfterUseContent(locale);
  const [step, setStep] = useState<AfterUseCompanionStep>("welcome");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const titleId = useId();
  const progressLabelId = useId();
  const stepIndex = AFTER_USE_COMPANION_STEPS.indexOf(step);
  const stepCopy = copy.steps[step];
  const somiState = AFTER_USE_SOMI_BY_STEP[step];
  const helpTo = `${base}/support#${SUPPORT_HELP_PANEL_HASH}`;
  const breathingTo = `${base}/support#${SUPPORT_BREATHING_ANCHOR_ID}`;
  const progressText = formatAfterUseStepProgress(
    copy.stepProgress,
    stepIndex + 1,
    AFTER_USE_COMPANION_STEPS.length,
  );

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  const exitToHub = () => {
    onExitToHub();
  };

  return (
    <article
      id={SUPPORT_AFTER_USE_ANCHOR_ID}
      data-after-use-companion=""
      data-after-use-step={step}
      className="mx-auto min-w-0 w-full max-w-[45rem] rounded-[1.75rem] bg-soma-surface/75 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pt-4 sm:bg-soma-surface/90 sm:px-7 sm:pb-8 sm:pt-6 sm:shadow-[0_0_0_1px_rgb(var(--soma-line)/0.55)]"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="max-w-[18rem] text-[11px] leading-relaxed text-soma-ink-muted sm:max-w-md">
          {copy.notice}
        </p>
        <button
          type="button"
          data-after-use-nav="exit"
          onClick={exitToHub}
          className={`${previewFocus} inline-flex min-h-10 shrink-0 items-center rounded-lg px-2 text-sm font-medium text-soma-action hover:text-soma-action-hover`}
        >
          {copy.exitLabel}
        </button>
      </div>

      <div
        data-after-use-emergency
        className="mt-3 flex items-start gap-2 rounded-2xl bg-rose-400/10 px-3 py-2 text-sm leading-snug text-rose-50"
        role="status"
      >
        <LifeBuoy className="mt-0.5 h-4 w-4 shrink-0 text-rose-200" aria-hidden="true" />
        <div className="min-w-0 space-y-1.5">
          <p>{copy.emergencyBanner}</p>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <Link
              to={helpTo}
              onClick={exitToHub}
              className={`${previewFocus} font-medium text-soma-action hover:text-soma-action-hover`}
            >
              {copy.helpLinkLabel}
            </Link>
            <span className="text-rose-200/50" aria-hidden="true">
              ·
            </span>
            <Link
              to={SUPPORT_TERMS_EMERGENCY_HREF}
              className={`${previewFocus} font-medium text-soma-action hover:text-soma-action-hover`}
            >
              {copy.termsLinkLabel}
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-2" aria-labelledby={progressLabelId}>
        <p id={progressLabelId} className="text-xs font-medium tracking-wide text-soma-ink-muted">
          {progressText}
        </p>
        <ol className="flex gap-1.5" aria-hidden="true" data-after-use-progress>
          {AFTER_USE_COMPANION_STEPS.map((id, index) => (
            <li
              key={id}
              className={`h-1.5 flex-1 rounded-full motion-safe:transition-colors motion-reduce:transition-none ${
                index <= stepIndex ? "bg-soma-shell-accent/80" : "bg-soma-line-strong/70"
              }`}
            />
          ))}
        </ol>
      </div>

      <div className="mt-5 flex flex-col items-center text-center">
        <Somi state={somiState} size="medium" className="shrink-0" />
        <h2
          ref={headingRef}
          id={titleId}
          tabIndex={-1}
          className="mt-3 max-w-xl text-balance text-2xl font-semibold tracking-tight text-soma-ink sm:mt-4 sm:text-[1.75rem]"
        >
          {stepCopy.title}
        </h2>
      </div>

      <div className="mt-3 space-y-3 text-left sm:mt-4">
        {stepCopy.body.map((paragraph, index) => (
          <p
            key={`${step}-body-${index}`}
            className="text-[15px] leading-7 text-soma-ink-secondary sm:text-base sm:leading-7"
          >
            {paragraph}
          </p>
        ))}
      </div>

      {step !== "close" ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            data-after-use-nav="continue"
            onClick={() => {
              const next = AFTER_USE_COMPANION_STEPS[stepIndex + 1];
              if (next) setStep(next);
            }}
            className={`${previewFocus} inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-soma-action/50 bg-soma-action/10 px-4 text-sm font-semibold text-soma-action hover:bg-soma-action/15 sm:flex-1`}
          >
            {stepCopy.primaryCta ?? copy.continueLabel}
          </button>
        </div>
      ) : (
        <div className="mt-6 grid min-w-0 gap-2.5">
          <button
            type="button"
            data-after-use-nav="hub"
            onClick={exitToHub}
            className={`${previewFocus} inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-soma-action/50 bg-soma-action/10 px-4 text-sm font-semibold text-soma-action hover:bg-soma-action/15`}
          >
            {copy.closeActions.hub}
          </button>
          <Link
            to={breathingTo}
            onClick={exitToHub}
            data-after-use-nav="breathing"
            className={`${previewFocus} inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-2xl border border-soma-line-strong bg-soma-raised/40 px-4 text-sm font-medium text-soma-ink hover:bg-soma-raised/60`}
          >
            {copy.closeActions.breathing}
            <ArrowUpRight className="h-4 w-4 text-soma-action" aria-hidden="true" />
          </Link>
          <Link
            to={helpTo}
            onClick={exitToHub}
            data-after-use-nav="help"
            className={`${previewFocus} inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-2xl border border-rose-300/25 bg-rose-400/10 px-4 text-sm font-medium text-rose-50 hover:bg-rose-400/15`}
          >
            {copy.closeActions.help}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      )}

      <details className="mt-8 text-left">
        <summary
          className={`${previewFocus} cursor-pointer list-none text-sm text-soma-ink-muted marker:content-none [&::-webkit-details-marker]:hidden`}
        >
          {copy.referencesTitle}
        </summary>
        <div className="mt-2 space-y-2 rounded-xl border border-soma-line/60 bg-soma-canvas/30 px-3 py-3">
          <p className="text-xs leading-relaxed text-soma-ink-muted">{copy.referencesIntro}</p>
          <ul className="space-y-2">
            {copy.references.map((ref) => (
              <li key={ref.refId} className="text-xs leading-relaxed text-soma-ink-secondary">
                <a
                  href={ref.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${previewFocus} font-medium text-soma-action hover:text-soma-action-hover`}
                >
                  {ref.organization} — {ref.title}
                </a>
                <span className="mt-0.5 block text-soma-ink-muted">{ref.scopeNote}</span>
              </li>
            ))}
          </ul>
        </div>
      </details>
    </article>
  );
}
