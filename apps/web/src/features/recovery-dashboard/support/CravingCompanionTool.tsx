import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, LifeBuoy } from "lucide-react";
import { Link } from "react-router-dom";
import { Somi } from "../../somi/index.js";
import { useShellBase } from "../context/ShellBaseContext.js";
import { previewFocus } from "../focus.js";
import {
  canGoBack,
  createCravingCompanionSession,
  cravingStepIndex,
  goBack,
  goForward,
  restartSession,
  selectChoice,
  skipCurrentStep,
  type CravingCompanionSession,
} from "./craving-companion-session.js";
import {
  CRAVING_SOMI_BY_STEP,
  formatCravingStepProgress,
  getSupportCravingContent,
  type SupportCravingLocale,
} from "./support-craving-content.js";
import {
  CRAVING_COMPANION_STEPS,
  SUPPORT_CRAVING_ANCHOR_ID,
  writeSupportToolSearchParams,
  type CravingChoiceId,
} from "./support-craving-tool.js";
import { SUPPORT_HELP_PANEL_HASH, SUPPORT_STRATEGIES_PANEL_HASH } from "./support-guide.js";
import { SUPPORT_TERMS_EMERGENCY_HREF } from "./support-links.js";
import {
  supportBreathingLocation,
  writeSupportStrategySearchParams,
} from "./support-strategies.js";
import { UrgeWaveVisual } from "./UrgeWaveVisual.js";

function localeFromLanguage(language: string | undefined): SupportCravingLocale {
  return language?.toLowerCase().startsWith("es") ? "es" : "en";
}

const primaryCtaClass = `${previewFocus} inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-soma-shell-accent/45 bg-soma-shell-accent/20 px-4 text-base font-semibold text-soma-ink motion-safe:transition-colors motion-reduce:transition-none hover:bg-soma-shell-accent/30 sm:w-auto sm:min-w-[14rem]`;
const secondaryNavClass = `${previewFocus} inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium text-soma-ink-secondary hover:text-soma-ink`;

export interface CravingCompanionToolProps {
  /** i18n language hint; defaults to Spanish for isolated tests. */
  language?: string;
  /** Optional controlled session for tests. */
  initialSession?: CravingCompanionSession;
  onExitToHub?: () => void;
}

/**
 * SUP-02C interactive craving accompaniment. State lives only in React memory.
 * Mounted from SupportPage in-memory state when the publication gate is open.
 */
export function CravingCompanionTool({
  language = "es",
  initialSession,
  onExitToHub,
}: CravingCompanionToolProps) {
  const base = useShellBase();
  const locale = localeFromLanguage(language);
  const copy = getSupportCravingContent(locale);
  const titleId = useId();
  const progressLabelId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [session, setSession] = useState<CravingCompanionSession>(
    () => initialSession ?? createCravingCompanionSession(),
  );
  const [refsOpen, setRefsOpen] = useState(false);

  const step = session.step;
  const stepIndex = cravingStepIndex(step);
  const stepNumber = stepIndex + 1;
  const stepCopy = copy.steps[step];
  const somiState = CRAVING_SOMI_BY_STEP[step];
  const progressText = formatCravingStepProgress(
    locale,
    stepNumber,
    CRAVING_COMPANION_STEPS.length,
  );
  const helpTo = { pathname: `${base}/support`, search: "", hash: SUPPORT_HELP_PANEL_HASH } as const;
  const strategiesTo = {
    pathname: `${base}/support`,
    search: "",
    hash: SUPPORT_STRATEGIES_PANEL_HASH,
  } as const;
  const breathingTo = supportBreathingLocation(base);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  const exitToHub = () => {
    onExitToHub?.();
  };

  const restart = () => {
    setSession(restartSession());
  };

  const onSelect = (id: CravingChoiceId) => {
    setSession((current) => selectChoice(current, id));
  };

  return (
    <article
      id={SUPPORT_CRAVING_ANCHOR_ID}
      data-craving-companion=""
      data-craving-step={step}
      className="mx-auto min-w-0 w-full max-w-[45rem] rounded-[1.75rem] bg-soma-surface/75 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pt-4 sm:bg-soma-surface/90 sm:px-7 sm:pb-8 sm:pt-6 sm:shadow-[0_0_0_1px_rgb(var(--soma-line)/0.55)]"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="max-w-[18rem] text-[11px] leading-relaxed text-soma-ink-muted sm:max-w-md">
          {copy.notice}
        </p>
        <button
          type="button"
          data-craving-nav="exit"
          onClick={exitToHub}
          className={`${previewFocus} shrink-0 inline-flex min-h-10 items-center rounded-lg px-2 text-sm font-medium text-soma-action hover:text-soma-action-hover`}
        >
          {copy.exitLabel}
        </button>
      </div>

      <div
        data-craving-emergency
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
        <ol
          className="flex gap-1.5"
          aria-hidden="true"
          data-craving-progress
        >
          {CRAVING_COMPANION_STEPS.map((id, index) => (
            <li
              key={id}
              className={`h-1.5 flex-1 rounded-full motion-safe:transition-colors motion-reduce:transition-none ${
                index <= stepIndex
                  ? "bg-soma-shell-accent/80"
                  : "bg-soma-line-strong/70"
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
        {stepCopy.secondaryNote ? (
          <p className="text-sm leading-relaxed text-soma-ink-muted">{stepCopy.secondaryNote}</p>
        ) : null}
      </div>

      {step === "observe" ? (
        <div className="mt-6 space-y-2">
          <UrgeWaveVisual label={copy.waveLabel} />
          <p className="text-center text-xs leading-relaxed text-soma-ink-muted">{copy.waveCaption}</p>
        </div>
      ) : null}

      {step === "choose" ? (
        <div className="mt-6 space-y-3">
          <p className="text-sm leading-relaxed text-soma-ink-secondary">{copy.choicesLead}</p>
          <ul className="grid min-w-0 gap-2.5" data-craving-choices>
            {copy.choices.map((choice) => {
              const active = session.selectedChoice === choice.id;
              const isBreathing = choice.id === "breathing";
              const isProfessional = choice.id === "professional";
              const opensResource = isBreathing || isProfessional;
              return (
                <li key={choice.id} className="min-w-0">
                  <button
                    type="button"
                    data-craving-choice={choice.id}
                    aria-pressed={active}
                    onClick={() => onSelect(choice.id)}
                    className={`${previewFocus} flex w-full min-h-11 flex-col items-start gap-1 rounded-2xl px-4 py-3.5 text-left motion-safe:transition-colors motion-reduce:transition-none ${
                      active
                        ? "bg-soma-shell-accent/15 shadow-[inset_0_0_0_1px_rgb(var(--soma-shell-accent)/0.55)]"
                        : "bg-soma-raised/35 shadow-[inset_0_0_0_1px_rgb(var(--soma-line)/0.55)] hover:bg-soma-raised/55"
                    }`}
                  >
                    <span className="flex w-full items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-soma-ink">{choice.title}</span>
                      {opensResource ? (
                        <ArrowUpRight
                          className="h-4 w-4 shrink-0 text-soma-action"
                          aria-hidden="true"
                        />
                      ) : null}
                    </span>
                    <span className="text-sm leading-relaxed text-soma-ink-secondary">
                      {choice.body}
                    </span>
                  </button>
                  {active ? (
                    <div className="mt-2 space-y-2 rounded-2xl bg-soma-raised/25 px-4 py-3 text-sm text-soma-ink-secondary">
                      <p>{choice.afterSelect}</p>
                      {isBreathing ? (
                        <Link
                          to={breathingTo}
                          className={`${previewFocus} inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-soma-action hover:text-soma-action-hover`}
                        >
                          {choice.title}
                          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      ) : null}
                      {isProfessional ? (
                        <Link
                          to={helpTo}
                          onClick={exitToHub}
                          className={`${previewFocus} inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-soma-action hover:text-soma-action-hover`}
                        >
                          {copy.helpLinkLabel}
                          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {step === "close" ? (
        <ul className="mt-6 grid min-w-0 gap-2.5 sm:grid-cols-2" data-craving-close-actions>
          <li className="sm:col-span-2">
            <button
              type="button"
              data-craving-action="repeat"
              onClick={restart}
              className={primaryCtaClass}
            >
              {copy.closeActions.repeat}
            </button>
          </li>
          <li>
            <Link
              to={strategiesTo}
              onClick={exitToHub}
              data-craving-action="strategies"
              className={`${previewFocus} flex min-h-12 w-full items-center justify-center rounded-2xl bg-soma-raised/40 px-3 text-sm font-medium text-soma-ink hover:bg-soma-raised/65`}
            >
              {copy.closeActions.strategies}
            </Link>
          </li>
          <li>
            <button
              type="button"
              data-craving-action="hub"
              onClick={exitToHub}
              className={`${previewFocus} flex min-h-12 w-full items-center justify-center rounded-2xl bg-soma-raised/40 px-3 text-sm font-medium text-soma-ink hover:bg-soma-raised/65`}
            >
              {copy.closeActions.hub}
            </button>
          </li>
          <li className="sm:col-span-2">
            <Link
              to={helpTo}
              onClick={exitToHub}
              data-craving-action="help"
              className={`${previewFocus} flex min-h-12 w-full items-center justify-center rounded-2xl bg-rose-400/10 px-3 text-sm font-medium text-rose-100 hover:bg-rose-400/20`}
            >
              {copy.closeActions.help}
            </Link>
          </li>
        </ul>
      ) : null}

      {step !== "close" ? (
        <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          {step === "welcome" && stepCopy.primaryCta ? (
            <button
              type="button"
              data-craving-nav="start"
              onClick={() => setSession((current) => goForward(current))}
              className={primaryCtaClass}
            >
              {stepCopy.primaryCta}
            </button>
          ) : null}

          {(step === "ground" || step === "observe" || step === "choose") && (
            <button
              type="button"
              data-craving-nav="continue"
              onClick={() => setSession((current) => goForward(current))}
              className={primaryCtaClass}
            >
              {step === "choose"
                ? session.selectedChoice
                  ? copy.continueLabel
                  : copy.continueWithoutChoiceLabel
                : stepCopy.primaryCta}
            </button>
          )}

          <div className="flex flex-wrap items-center gap-1 sm:ml-auto">
            {canGoBack(session) ? (
              <button
                type="button"
                data-craving-nav="back"
                onClick={() => setSession((current) => goBack(current))}
                className={secondaryNavClass}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {copy.backLabel}
              </button>
            ) : null}
            {(step === "ground" || step === "observe") && stepCopy.skipCta ? (
              <button
                type="button"
                data-craving-nav="skip"
                onClick={() => setSession((current) => skipCurrentStep(current))}
                className={secondaryNavClass}
              >
                {stepCopy.skipCta}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <details
        className="mt-6 rounded-2xl bg-soma-raised/20 px-3 py-2"
        data-craving-references
        open={refsOpen}
        onToggle={(event) => {
          setRefsOpen((event.target as HTMLDetailsElement).open);
        }}
      >
        <summary
          className={`${previewFocus} cursor-pointer list-none py-1 text-sm font-medium text-soma-ink-muted marker:content-none`}
        >
          {copy.referencesTitle}
        </summary>
        <p className="mt-2 text-xs leading-relaxed text-soma-ink-muted">{copy.referencesIntro}</p>
        <ul className="mt-3 space-y-3">
          {copy.references.map((ref) => (
            <li key={ref.refId} className="text-sm leading-relaxed text-soma-ink-secondary">
              <p className="font-medium text-soma-ink">
                {ref.refId} · {ref.organization}
              </p>
              <a
                href={ref.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${previewFocus} text-soma-action hover:text-soma-action-hover`}
              >
                {ref.title}
              </a>
              <p className="mt-0.5 text-xs text-soma-ink-muted">{ref.scopeNote}</p>
            </li>
          ))}
        </ul>
      </details>
    </article>
  );
}

/** Helper for tests / callers clearing legacy tool query when leaving. */
export function clearCravingToolSearchParams(current: URLSearchParams): URLSearchParams {
  const withoutTool = writeSupportToolSearchParams(current);
  return writeSupportStrategySearchParams(withoutTool, null);
}
