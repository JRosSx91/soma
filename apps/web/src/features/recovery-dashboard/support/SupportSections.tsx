import { ArrowRight, BookOpenText, ChevronRight, Clock, LifeBuoy, Wind } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useShellBase } from "../context/ShellBaseContext.js";
import { previewFocus } from "../focus.js";
import {
  SUPPORT_TERMS_EMERGENCY_HREF,
  supportExploreHref,
  supportLearnLinks,
} from "./support-links.js";

const panelClass =
  "min-w-0 rounded-2xl border border-soma-line bg-soma-surface/90 p-4 sm:p-5";
const accentColor = { color: "rgb(var(--soma-shell-accent))" };

/** SUP-01B: static content below the hero. No tool is interactive yet. */
export function SupportSections() {
  const { t } = useTranslation(["support", "explore-edu"]);
  const base = useShellBase();
  const learnLinks = supportLearnLinks(base);

  return (
    <>
      <section className="min-w-0" aria-labelledby="support-tools-title">
        <h2 id="support-tools-title" className="text-lg font-semibold text-soma-ink">
          {t("support:tools.title")}
        </h2>
        <p className="mt-1 text-sm text-soma-ink-secondary">{t("support:tools.subtitle")}</p>

        <article
          className={`${panelClass} mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6`}
          aria-labelledby="support-breathing-title"
        >
          <div
            className="relative flex h-24 w-24 shrink-0 items-center justify-center self-center rounded-full sm:h-28 sm:w-28"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgb(var(--soma-shell-accent) / 0.28) 0%, rgb(139 92 246 / 0.22) 55%, transparent 72%)",
            }}
            aria-hidden="true"
          >
            <span className="absolute inset-3 rounded-full border border-soma-shell-accent/35" />
            <span className="absolute inset-6 rounded-full border border-violet-300/30" />
            <Wind className="relative h-9 w-9" style={accentColor} />
          </div>
          <div className="min-w-0 flex-1">
            <h3
              id="support-breathing-title"
              className="text-base font-semibold leading-snug text-soma-ink"
            >
              {t("support:tools.breathing.title")}
            </h3>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-soma-ink-secondary">
              {t("support:tools.breathing.body")}
            </p>
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-soma-ink-muted">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-soma-line-strong px-2.5 py-1 font-medium text-soma-ink-secondary">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {t("support:tools.breathing.status")}
              </span>
              <span>{t("support:tools.breathing.statusHint")}</span>
            </p>
          </div>
        </article>
      </section>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section className={panelClass} aria-labelledby="support-learn-title">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
            <h2 id="support-learn-title" className="text-lg font-semibold text-soma-ink">
              {t("support:learn.title")}
            </h2>
            <Link
              to={supportExploreHref(base)}
              className={`${previewFocus} inline-flex min-h-11 items-center gap-1 rounded-lg text-sm font-medium text-soma-action hover:text-soma-action-hover`}
            >
              {t("support:learn.viewAll")}
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <p className="text-sm leading-relaxed text-soma-ink-secondary">
            {t("support:learn.subtitle")}
          </p>
          <ul className="mt-4 flex min-w-0 flex-col gap-2">
            {learnLinks.map((item) => (
              <li key={item.id} className="min-w-0">
                <Link
                  to={item.href}
                  className={`${previewFocus} flex min-h-11 min-w-0 items-center gap-3 rounded-xl border border-soma-line bg-soma-raised/40 px-3 py-2.5 motion-safe:transition-colors motion-reduce:transition-none hover:border-soma-line-strong hover:bg-soma-raised/70`}
                >
                  <BookOpenText className="h-5 w-5 shrink-0" style={accentColor} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium leading-snug text-soma-ink">
                      {t(item.titleKey)}
                    </span>
                    <span className="mt-0.5 block text-xs text-soma-ink-muted">
                      {t("support:learn.kind")}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-soma-ink-muted" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="min-w-0 rounded-2xl border border-violet-300/30 p-4 sm:p-5"
          style={{
            background:
              "linear-gradient(160deg, rgb(139 92 246 / 0.14) 0%, rgb(var(--soma-surface) / 0.92) 55%)",
          }}
          aria-labelledby="support-help-title"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-400/15">
              <LifeBuoy className="h-5 w-5 text-violet-200" aria-hidden="true" />
            </span>
            <h2 id="support-help-title" className="text-lg font-semibold text-soma-ink">
              {t("support:help.title")}
            </h2>
          </div>
          <div className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-soma-ink-secondary">
            <p className="font-medium text-soma-ink">{t("support:help.educational")}</p>
            <p>{t("support:help.emergency")}</p>
            <p>{t("support:help.professional")}</p>
          </div>
          <Link
            to={SUPPORT_TERMS_EMERGENCY_HREF}
            className={`${previewFocus} mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-violet-200 underline-offset-4 hover:underline`}
          >
            {t("support:help.termsLink")}
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </>
  );
}
