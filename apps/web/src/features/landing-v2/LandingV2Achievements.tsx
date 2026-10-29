import { useId, useRef, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "framer-motion";
import { previewFocus } from "../recovery-dashboard/focus.js";
import type { MedalTier } from "../recovery-dashboard/components/MedalMark.js";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

export const LANDING_ACHIEVEMENTS_ID = "landing-achievements";

type CatalogItem = {
  kind: "catalog";
  id: string;
  substanceId: "alcohol" | "nicotine" | "cannabis";
  tier: MedalTier;
};

type SealedItem = {
  kind: "sealed";
  id: "sealed";
  substanceId: "nicotine";
  tier: "platinum";
};

type ShowcaseItem = CatalogItem | SealedItem;

const SHOWCASE: readonly ShowcaseItem[] = [
  {
    kind: "catalog",
    id: "nicotine-bronchi-bronze-1",
    substanceId: "nicotine",
    tier: "bronze",
  },
  {
    kind: "catalog",
    id: "alcohol-sleep-bronze",
    substanceId: "alcohol",
    tier: "bronze",
  },
  {
    kind: "catalog",
    id: "alcohol-liver-gold",
    substanceId: "alcohol",
    tier: "gold",
  },
  {
    kind: "catalog",
    id: "nicotine-lungs-gold",
    substanceId: "nicotine",
    tier: "gold",
  },
  {
    kind: "catalog",
    id: "cannabis-hippocampus-gold",
    substanceId: "cannabis",
    tier: "gold",
  },
  {
    kind: "sealed",
    id: "sealed",
    substanceId: "nicotine",
    tier: "platinum",
  },
];

function medalSrc(item: CatalogItem): string {
  return `/images/achievements/${item.substanceId}-${item.tier}.png`;
}

function SealedMedalDisk() {
  const uid = useId().replace(/:/g, "");
  const fill = `${uid}-fill`;
  const ring = `${uid}-ring`;
  const glow = `${uid}-glow`;

  return (
    <svg viewBox="0 0 80 80" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id={fill} cx="38%" cy="32%" r="72%">
          <stop offset="0%" stopColor="#163048" />
          <stop offset="55%" stopColor="#0B1824" />
          <stop offset="100%" stopColor="#061018" />
        </radialGradient>
        <linearGradient id={ring} x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#F4F6F8" />
          <stop offset="42%" stopColor="#C5CCD4" />
          <stop offset="100%" stopColor="#8B949E" />
        </linearGradient>
        <radialGradient id={glow} cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="rgba(134,183,232,0)" />
          <stop offset="100%" stopColor="rgba(134,183,232,0.28)" />
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="36" fill={`url(#${fill})`} />
      <circle
        cx="40"
        cy="40"
        r="36"
        fill="none"
        stroke={`url(#${ring})`}
        strokeWidth="3.2"
      />
      <circle cx="40" cy="40" r="36" fill={`url(#${glow})`} />
      <circle
        cx="40"
        cy="40"
        r="29"
        fill="none"
        stroke="rgba(134,183,232,0.22)"
        strokeWidth="1"
      />
      <path
        d="M 33 37 V 32.5 a 7 7 0 0 1 14 0 V 37"
        fill="none"
        stroke="#D7DEE6"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <rect
        x="31"
        y="36.5"
        width="18"
        height="14"
        rx="2.4"
        fill="#C9D2DC"
        stroke="#9AA4B0"
        strokeWidth="1"
      />
    </svg>
  );
}

function MedalFigure({
  item,
  dimmed,
}: {
  item: ShowcaseItem;
  dimmed: boolean;
}) {
  return (
    <span
      className={`block h-full w-full ${
        dimmed ? "brightness-[0.86] saturate-[0.82]" : ""
      }`}
    >
      {item.kind === "sealed" ? (
        <SealedMedalDisk />
      ) : (
        <img
          src={medalSrc(item)}
          alt=""
          width={1280}
          height={1240}
          decoding="async"
          draggable={false}
          className="h-full w-full object-contain"
        />
      )}
    </span>
  );
}

export function LandingV2Achievements() {
  const { t } = useTranslation(["landing-v2", "achievements", "substances"], {
    bindI18n: "languageChanged loaded added",
  });
  const reduceMotion = Boolean(useReducedMotion());
  const enter = reduceMotion ? { duration: 0 } : { duration: 0.55, ease };
  const fadeUp = reduceMotion ? false : { opacity: 0, y: 12 };
  const [selectedId, setSelectedId] = useState<string>(SHOWCASE[0].id);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selected =
    SHOWCASE.find((item) => item.id === selectedId) ?? SHOWCASE[0];
  const selectedIndex = SHOWCASE.findIndex((item) => item.id === selected.id);

  function selectAt(index: number) {
    const wrapped = (index + SHOWCASE.length) % SHOWCASE.length;
    setSelectedId(SHOWCASE[wrapped].id);
    buttonRefs.current[wrapped]?.focus();
  }

  function onGalleryKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      selectAt(selectedIndex + 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      selectAt(selectedIndex - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      selectAt(0);
    } else if (event.key === "End") {
      event.preventDefault();
      selectAt(SHOWCASE.length - 1);
    }
  }

  const panelTitle =
    selected.kind === "sealed"
      ? t("landing-v2:achievements.sealedTitle")
      : t(`achievements:${selected.id}.title`);
  const panelBody =
    selected.kind === "sealed"
      ? t("landing-v2:achievements.sealedBody")
      : t(`achievements:${selected.id}.description`);

  return (
    <section
      id={LANDING_ACHIEVEMENTS_ID}
      className="relative isolate overflow-x-hidden bg-[#081018] px-4 py-8 sm:px-6 lg:flex lg:min-h-svh lg:flex-col lg:px-12 lg:py-6 xl:px-16"
      aria-labelledby="landing-v2-achievements-title"
    >
      <img
        src="/images/landing-v2/soma-achievements-bg.png"
        alt=""
        width={1920}
        height={800}
        decoding="async"
        draggable={false}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full max-w-none object-cover object-[center_42%] opacity-80"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[#081018]/58 md:bg-[#081018]/48"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_48%,rgba(8,16,24,0.72),transparent_64%),linear-gradient(90deg,rgba(8,16,24,0.35)_0%,rgba(8,16,24,0.52)_16%,rgba(8,16,24,0.52)_84%,rgba(8,16,24,0.35)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-soma-physiology/30 to-transparent"
      />

      <div className="relative mx-auto flex w-full max-w-[88rem] flex-col gap-4 lg:min-h-0 lg:flex-1 lg:justify-center lg:gap-5">
        <motion.header
          className="max-w-3xl shrink-0"
          initial={fadeUp}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={enter}
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-soma-action">
            {t("landing-v2:achievements.eyebrow")}
          </p>
          <h2
            id="landing-v2-achievements-title"
            className="mt-2 text-3xl font-semibold tracking-tight text-soma-ink sm:text-4xl lg:text-[2.35rem] lg:leading-[1.1] xl:text-[2.75rem]"
          >
            {t("landing-v2:achievements.title")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-soma-ink-secondary sm:text-base">
            {t("landing-v2:achievements.intro")}
          </p>
        </motion.header>

        <div className="grid min-h-0 gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)] lg:items-stretch lg:gap-10">
          <div
            role="radiogroup"
            aria-label={t("landing-v2:achievements.galleryLabel")}
            className="grid grid-cols-2 grid-rows-3 gap-2.5 lg:h-full lg:grid-cols-3 lg:grid-rows-2 lg:gap-4"
            onKeyDown={onGalleryKeyDown}
          >
            {SHOWCASE.map((item, index) => {
              const selectedItem = item.id === selected.id;
              const name =
                item.kind === "sealed"
                  ? t("landing-v2:achievements.sealedTitle")
                  : t(`achievements:${item.id}.title`);
              return (
                <motion.button
                  key={item.id}
                  ref={(node) => {
                    buttonRefs.current[index] = node;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={selectedItem}
                  tabIndex={selectedItem ? 0 : -1}
                  onClick={() => setSelectedId(item.id)}
                  initial={fadeUp}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    ...enter,
                    delay: reduceMotion ? 0 : index * 0.08,
                  }}
                  className={`${previewFocus} box-border grid h-full min-h-[7.25rem] min-w-0 grid-rows-[minmax(0,1fr)_1.35rem] rounded-3xl border px-2 py-2 transition-colors sm:min-h-[9.5rem] sm:px-3 ${
                    selectedItem
                      ? "border-soma-action bg-[#07141f]/95 shadow-[0_0_18px_rgba(104,216,192,0.16)]"
                      : "border-soma-line/70 bg-[#07141f]/94 hover:border-soma-physiology/50"
                  }`}
                >
                  <span className="flex min-h-0 items-center justify-center">
                    <span className="aspect-square h-[4.75rem] w-[4.75rem] sm:h-24 sm:w-24">
                      <MedalFigure item={item} dimmed={!selectedItem} />
                    </span>
                  </span>
                  <span className="flex items-center justify-center text-[10px] font-semibold uppercase tracking-[0.14em] text-soma-physiology">
                    {t(`landing-v2:achievements.tiers.${item.tier}`)}
                    <span className="sr-only">{` ${name}`}</span>
                  </span>
                </motion.button>
              );
            })}
          </div>

          <motion.aside
            className="grid min-w-0 grid-rows-[auto_auto_auto_auto_auto] gap-2 rounded-3xl border border-soma-physiology/25 bg-[#081018]/95 p-4 sm:min-h-[30rem] sm:grid-rows-[auto_9rem_minmax(3.5rem,auto)_minmax(8.5rem,1fr)_auto] sm:p-6 lg:h-full lg:min-h-0"
            aria-live="polite"
            initial={fadeUp}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ ...enter, delay: reduceMotion ? 0 : 0.16 }}
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-soma-physiology">
              {t("landing-v2:achievements.selectedLabel")}
            </p>
            <div className="flex items-center justify-center">
              <div
                className={`aspect-square h-24 w-24 sm:h-36 sm:w-36 ${
                  reduceMotion ? "" : "transition-opacity duration-300"
                }`}
              >
                <MedalFigure item={selected} dimmed={false} />
              </div>
            </div>
            <h3 className="self-center text-lg font-semibold leading-snug tracking-tight text-soma-ink">
              {panelTitle}
            </h3>
            <p className="text-sm leading-relaxed text-soma-ink-secondary">
              {panelBody}
            </p>
            <dl className="grid grid-cols-2 gap-4 pt-1 text-sm">
              <div>
                <dt className="text-[11px] uppercase tracking-[0.16em] text-soma-ink-muted">
                  {t("landing-v2:achievements.substance")}
                </dt>
                <dd className="mt-1 text-soma-ink">
                  {selected.kind === "sealed"
                    ? t("landing-v2:achievements.sealedSubstance")
                    : t(`substances:${selected.substanceId}.name`)}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.16em] text-soma-ink-muted">
                  {t("landing-v2:achievements.tier")}
                </dt>
                <dd className="mt-1 text-soma-ink">
                  {t(`landing-v2:achievements.tiers.${selected.tier}`)}
                </dd>
              </div>
            </dl>
          </motion.aside>
        </div>

        <p className="shrink-0 rounded-2xl border border-soma-line/70 bg-[#07141f]/80 px-4 py-2.5 text-[11px] leading-relaxed text-soma-ink-muted sm:px-5 sm:py-3">
          {t("landing-v2:achievements.note")}
        </p>
      </div>
    </section>
  );
}
