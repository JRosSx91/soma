import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useReducedMotion } from "framer-motion";
import { LanguageSelector } from "../components/LanguageSelector.js";
import { MAIN_CONTENT_ID, SkipToContent } from "../components/SkipToContent.js";
import { LandingPulseWave } from "../features/landing-v2/LandingPulseWave.js";
import { SomaMark } from "../features/recovery-dashboard/components/SomaMark.js";
import { previewFocus } from "../features/recovery-dashboard/focus.js";

export function NotFoundPage() {
  const { t } = useTranslation("landing-v2");
  const reduceMotion = Boolean(useReducedMotion());

  useEffect(() => {
    const previous = document.title;
    document.title = t("notFound.metaTitle");
    return () => {
      document.title = previous;
    };
  }, [t]);

  return (
    <div className="relative min-h-svh overflow-x-hidden bg-[#081018] text-soma-ink [--landing-v2-header:3.75rem]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_8%_50%,rgba(104,216,192,0.16),transparent_34%),radial-gradient(ellipse_at_92%_48%,rgba(134,183,232,0.14),transparent_36%),radial-gradient(ellipse_at_50%_18%,rgba(134,183,232,0.06),transparent_42%)]"
      />

      <SkipToContent />
      <header className="relative z-20 h-[var(--landing-v2-header,3.5rem)] border-b border-soma-line/60 bg-[#081018]/90 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className={`${previewFocus} rounded-lg`}>
            <SomaMark />
          </Link>
          <LanguageSelector />
        </div>
      </header>

      <main
        id={MAIN_CONTENT_ID}
        tabIndex={-1}
        className="relative mx-auto flex min-h-[calc(100svh-var(--landing-v2-header,3.5rem))] w-full max-w-[88rem] flex-col px-4 sm:px-6 lg:px-12"
      >
        <div className="relative flex flex-1 flex-col justify-center gap-6 py-8 sm:gap-8 sm:py-10">
          <div className="relative z-10 mx-auto flex w-full max-w-xl shrink-0 flex-col items-center text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-soma-action">
              {t("notFound.eyebrow")}
            </p>
            <p className="mt-4 font-light tabular-nums tracking-tight text-[#86B7E8] text-6xl sm:text-7xl">
              {t("notFound.code")}
            </p>
            <h1 className="mt-4 text-pretty text-3xl font-semibold tracking-tight text-soma-ink sm:text-4xl">
              {t("notFound.title")}
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-soma-ink-secondary sm:text-lg">
              {t("notFound.body")}
            </p>
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none relative left-1/2 w-screen max-w-[100vw] shrink-0 -translate-x-1/2 overflow-x-clip overflow-y-visible"
          >
            <LandingPulseWave variant="flatline" reduceMotion={reduceMotion} />
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-xl shrink-0 flex-col items-center">
            <div className="flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
              <Link
                to="/"
                className={`${previewFocus} inline-flex items-center justify-center rounded-xl bg-soma-action px-6 py-3 text-sm font-semibold text-[#081018] transition-colors hover:bg-soma-action-hover`}
              >
                {t("notFound.ctaPrimary")}
              </Link>
              <Link
                to="/preview"
                className={`${previewFocus} inline-flex items-center justify-center rounded-xl border border-soma-line-strong bg-[#081018]/40 px-6 py-3 text-sm font-medium text-soma-ink-secondary transition-colors hover:border-soma-physiology hover:text-soma-ink`}
              >
                {t("notFound.ctaSecondary")}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
