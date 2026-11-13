import { useTranslation } from "react-i18next";

export const LANDING_FAQ_ID = "landing-v2-faq";

export const LANDING_FAQ_ITEM_IDS = [
  "what",
  "curves",
  "care",
  "demo",
  "beta",
] as const;

export type LandingFaqItemId = (typeof LANDING_FAQ_ITEM_IDS)[number];

/**
 * Public FAQ on the landing (SEO-02B1-B). Static Q&A; answers always visible; no telemetry.
 */
export function LandingV2Faq() {
  const { t } = useTranslation("landing-v2", {
    bindI18n: "languageChanged loaded added",
  });

  return (
    <section
      id={LANDING_FAQ_ID}
      className="relative isolate overflow-x-hidden scroll-mt-[var(--landing-v2-header)] bg-[#081018] px-4 py-16 sm:px-6 lg:px-12 lg:py-20 xl:px-16"
      aria-labelledby="landing-v2-faq-title"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-soma-physiology/25 to-transparent"
      />

      <div className="relative mx-auto w-full max-w-[88rem]">
        <header className="max-w-3xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-soma-action">
            {t("faq.eyebrow")}
          </p>
          <h2
            id="landing-v2-faq-title"
            className="mt-2 text-3xl font-semibold tracking-tight text-soma-ink sm:text-4xl lg:text-[2.35rem] lg:leading-[1.1] xl:text-[2.75rem]"
          >
            {t("faq.title")}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-soma-ink-secondary sm:text-base">
            {t("faq.intro")}
          </p>
        </header>

        <div className="mt-10 grid max-w-3xl gap-8">
          {LANDING_FAQ_ITEM_IDS.map((id) => (
            <div key={id}>
              <h3 className="text-lg font-semibold tracking-tight text-soma-ink sm:text-xl">
                {t(`faq.items.${id}.question`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-soma-ink-secondary sm:text-base">
                {t(`faq.items.${id}.answer`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
