import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useShellBase } from "../context/ShellBaseContext.js";
import { previewFocus } from "../focus.js";
import { getSupportStrategyContent } from "./support-strategy-content.js";
import {
  supportBreathingLocation,
  type SupportEnabledStrategyId,
} from "./support-strategies.js";

interface SupportStrategySheetProps {
  strategyId: SupportEnabledStrategyId;
}

/** Educational strategy sheet view. Copy comes from `support-strategy-content`. */
export function SupportStrategySheet({ strategyId }: SupportStrategySheetProps) {
  const { t, i18n } = useTranslation("support");
  const base = useShellBase();
  const locale = i18n.language?.toLowerCase().startsWith("es") ? "es" : "en";
  const content = getSupportStrategyContent(strategyId, locale);
  const backTo = { pathname: `${base}/support`, search: "" } as const;
  const breathingTo = supportBreathingLocation(base);

  return (
    <article
      data-strategy-sheet={strategyId}
      className="min-w-0 rounded-2xl border border-soma-line bg-soma-surface/90 p-4 sm:p-6"
    >
      <p className="text-xs leading-relaxed text-soma-ink-muted">{t("strategies.sheetNotice")}</p>

      <p className="mt-3">
        <Link
          to={backTo}
          className={`${previewFocus} inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-soma-action hover:text-soma-action-hover`}
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
          {t("strategies.back")}
        </Link>
      </p>

      <header className="mt-4 space-y-3">
        <h2 id="support-strategy-title" className="text-xl font-semibold text-soma-ink sm:text-2xl">
          {content.title}
        </h2>
        {content.intro.map((paragraph, index) => (
          <p key={`intro-${index}`} className="text-sm leading-relaxed text-soma-ink-secondary sm:text-[15px] sm:leading-7">
            {paragraph}
          </p>
        ))}
      </header>

      <section className="mt-8 space-y-3" aria-labelledby="support-strategy-understand">
        <h3 id="support-strategy-understand" className="text-base font-semibold text-soma-ink">
          {content.understandTitle}
        </h3>
        {content.understand.map((paragraph, index) => (
          <p key={`u-${index}`} className="text-sm leading-relaxed text-soma-ink-secondary sm:text-[15px] sm:leading-7">
            {paragraph}
          </p>
        ))}
      </section>

      <section className="mt-8 space-y-3" aria-labelledby="support-strategy-options">
        <h3 id="support-strategy-options" className="text-base font-semibold text-soma-ink">
          {content.optionsTitle}
        </h3>
        <p className="text-sm leading-relaxed text-soma-ink-secondary sm:text-[15px] sm:leading-7">
          {content.optionsLead}
        </p>
        <ol className="list-decimal space-y-4 pl-5 text-sm leading-relaxed text-soma-ink-secondary sm:text-[15px] sm:leading-7">
          {content.options.map((option, index) => (
            <li key={`opt-${index}`} className="min-w-0 pl-1">
              <p className="font-medium text-soma-ink">{option.title}</p>
              <p className="mt-1">{option.body}</p>
              {strategyId === "stress.pause" && index === 3 && content.breathingLinkLabel ? (
                <p className="mt-2">
                  <Link
                    to={breathingTo}
                    className={`${previewFocus} inline-flex min-h-11 items-center rounded-lg text-sm font-medium text-soma-action hover:text-soma-action-hover`}
                  >
                    {content.breathingLinkLabel}
                  </Link>
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <section
        className="mt-8 space-y-3 rounded-xl border border-soma-line bg-soma-raised/25 p-3 sm:p-4"
        aria-labelledby="support-strategy-precautions"
      >
        <h3 id="support-strategy-precautions" className="text-base font-semibold text-soma-ink">
          {content.precautionsTitle}
        </h3>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-soma-ink-secondary">
          {content.precautions.map((item, index) => (
            <li key={`p-${index}`}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-8 space-y-3" aria-labelledby="support-strategy-professional">
        <h3 id="support-strategy-professional" className="text-base font-semibold text-soma-ink">
          {content.professionalTitle}
        </h3>
        {content.professional.map((paragraph, index) => (
          <p key={`pro-${index}`} className="text-sm leading-relaxed text-soma-ink-secondary sm:text-[15px] sm:leading-7">
            {paragraph}
          </p>
        ))}
      </section>

      <section className="mt-8" aria-labelledby="support-strategy-references">
        <h3 id="support-strategy-references" className="text-base font-semibold text-soma-ink">
          {content.referencesTitle}
        </h3>
        <ul className="mt-3 space-y-3">
          {content.references.map((ref) => (
            <li
              key={ref.refId}
              data-strategy-ref={ref.refId}
              className="rounded-xl border border-soma-line bg-soma-canvas/40 px-3 py-2.5 text-sm leading-relaxed"
            >
              <p className="font-medium text-soma-ink">
                {ref.organization}
                <span className="font-normal text-soma-ink-muted"> — {ref.title}</span>
              </p>
              {ref.href ? (
                <p className="mt-1 min-w-0">
                  <a
                    href={ref.href}
                    target={ref.href.startsWith("http") ? "_blank" : undefined}
                    rel={ref.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className={`${previewFocus} break-all text-soma-action hover:text-soma-action-hover`}
                  >
                    {ref.href.startsWith("http") ? ref.href : t("strategies.termsReference")}
                  </a>
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-8">
        <Link
          to={backTo}
          className={`${previewFocus} inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-soma-action hover:text-soma-action-hover`}
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
          {t("strategies.back")}
        </Link>
      </p>
    </article>
  );
}
