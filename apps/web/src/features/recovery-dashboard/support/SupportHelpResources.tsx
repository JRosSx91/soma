import { useState } from "react";
import { ExternalLink, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { previewFocus } from "../focus.js";
import { getSupportExternalContent } from "./support-external-content.js";
import {
  emergencyResourcesForCoverage,
  professionalResourcesForCoverage,
  type SupportExternalResourceMeta,
  type SupportHelpCoverage,
} from "./support-external-resources.js";

function localeFromI18n(language: string | undefined): "es" | "en" {
  return language?.toLowerCase().startsWith("es") ? "es" : "en";
}

function ResourceCard({
  resource,
  locale,
  verifiedLabel,
}: {
  resource: SupportExternalResourceMeta;
  locale: "es" | "en";
  verifiedLabel: string;
}) {
  const copy = getSupportExternalContent(resource.id, locale);
  const external = resource.href.startsWith("http");

  return (
    <li
      data-help-resource={resource.id}
      data-help-kind={resource.kind}
      className="min-w-0 rounded-xl border border-rose-300/25 bg-soma-raised/20 px-3 py-3"
    >
      <p className="text-sm font-semibold leading-snug text-soma-ink">{copy.name}</p>
      <p className="mt-0.5 text-xs text-soma-ink-muted">{copy.organization}</p>
      <p className="mt-2 text-sm leading-relaxed text-soma-ink-secondary">{copy.body}</p>
      {copy.schedule ? (
        <p className="mt-1 text-xs leading-relaxed text-soma-ink-secondary">{copy.schedule}</p>
      ) : null}
      <div className="mt-3 flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap">
        {resource.phone && copy.phoneAction ? (
          <a
            href={`tel:${resource.phone}`}
            data-help-tel={resource.phone}
            className={`${previewFocus} inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-rose-300/40 bg-rose-400/15 px-3 text-sm font-medium text-rose-100 hover:bg-rose-400/25`}
          >
            <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
            {copy.phoneAction}
          </a>
        ) : null}
        <a
          href={resource.href}
          data-help-href={resource.href}
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className={`${previewFocus} inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-lg border border-soma-line bg-soma-surface/70 px-3 text-sm font-medium text-soma-ink hover:bg-soma-raised/70`}
        >
          <span className="min-w-0">{copy.webAction}</span>
          {external ? <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
        </a>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-soma-ink-muted">
        {verifiedLabel}: {resource.lastVerified}
      </p>
    </li>
  );
}

interface SupportHelpResourcesProps {
  /** Test hook only; production always starts with no coverage selected. */
  initialCoverage?: SupportHelpCoverage | null;
}

/** Coverage picker + published external help listings inside the existing help panel. */
export function SupportHelpResources({ initialCoverage = null }: SupportHelpResourcesProps = {}) {
  const { t, i18n } = useTranslation("support");
  const locale = localeFromI18n(i18n.language);
  const [coverage, setCoverage] = useState<SupportHelpCoverage | null>(initialCoverage);

  const emergencies = coverage ? emergencyResourcesForCoverage(coverage) : [];
  const professional = coverage ? professionalResourcesForCoverage(coverage) : [];

  return (
    <div className="mt-4 space-y-4" data-help-resources>
      <div>
        <p id="support-help-coverage-label" className="text-sm font-medium text-soma-ink">
          {t("help.coverage.label")}
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-soma-ink-muted">
          {t("help.coverage.hint")}
        </p>
        <div
          role="group"
          aria-labelledby="support-help-coverage-label"
          className="mt-2 flex flex-wrap gap-2"
        >
          {(
            [
              ["spain", t("help.coverage.spain")],
              ["other", t("help.coverage.other")],
            ] as const
          ).map(([value, label]) => {
            const selected = coverage === value;
            return (
              <button
                key={value}
                type="button"
                data-help-coverage={value}
                aria-pressed={selected}
                onClick={() => setCoverage(value)}
                className={`${previewFocus} min-h-11 rounded-lg border px-3 text-sm font-medium motion-safe:transition-colors motion-reduce:transition-none ${
                  selected
                    ? "border-rose-300/50 bg-rose-400/20 text-rose-50"
                    : "border-soma-line bg-soma-surface/60 text-soma-ink-secondary hover:bg-soma-raised/60"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {coverage === null ? (
        <p className="text-sm leading-relaxed text-soma-ink-secondary" data-help-coverage-empty>
          {t("help.coverage.empty")}
        </p>
      ) : (
        <>
          <p className="text-xs leading-relaxed text-soma-ink-muted" data-help-coverage-shown>
            {t("help.coverage.shown", {
              coverage: t(`help.coverage.${coverage}`),
            })}
          </p>

          <section aria-labelledby="support-help-crisis-title" className="space-y-2">
            <h3 id="support-help-crisis-title" className="text-sm font-semibold text-soma-ink">
              {t("help.zones.crisis")}
            </h3>
            {coverage === "other" ? (
              <p
                data-help-local-emergency
                className="rounded-xl border border-rose-300/30 bg-rose-400/10 px-3 py-2.5 text-sm leading-relaxed text-soma-ink-secondary"
              >
                {t("help.otherEmergency")}
              </p>
            ) : null}
            {emergencies.length > 0 ? (
              <ul className="space-y-2">
                {emergencies.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    locale={locale}
                    verifiedLabel={t("help.verified")}
                  />
                ))}
              </ul>
            ) : null}
          </section>

          <section aria-labelledby="support-help-professional-title" className="space-y-2">
            <h3 id="support-help-professional-title" className="text-sm font-semibold text-soma-ink">
              {t("help.zones.professional")}
            </h3>
            <ul className="space-y-2">
              {professional.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  locale={locale}
                  verifiedLabel={t("help.verified")}
                />
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
