import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { previewFocus } from "../recovery-dashboard/focus.js";
import { PhotoPlateImg } from "../recovery-dashboard/components/PhotoPlateImg.js";
import {
  EXPEDITION_MAP_HEIGHT,
  EXPEDITION_MAP_SRC,
  EXPEDITION_MAP_WEBP_SRC,
  EXPEDITION_MAP_WIDTH,
} from "../recovery-dashboard/expedition/expedition-map-layout.js";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const EXPEDITION_BG = "/images/decoration/nature-10.png";

const ROUTES = [
  {
    id: "knowledge",
    icon: "knowledge-neuroscience",
    border: "border-soma-action/30",
    accent: "text-soma-action",
  },
  {
    id: "perseverance",
    icon: "perseverance-alcohol",
    border: "border-amber-200/25",
    accent: "text-amber-200",
  },
] as const;

function routeIconSrc(stem: string, px: 96 | 192): string {
  return `/images/expedition/icons/${stem}-${px}.webp`;
}

export function LandingV2Expedition() {
  const { t } = useTranslation("landing-v2");
  const reduceMotion = Boolean(useReducedMotion());
  const enter = reduceMotion ? { duration: 0 } : { duration: 0.55, ease };
  const fadeUp = reduceMotion ? false : { opacity: 0, y: 12 };

  return (
    <section
      id="landing-expedition"
      className="relative isolate overflow-x-hidden bg-[#081018] px-4 py-12 sm:px-6 lg:flex lg:min-h-svh lg:flex-col lg:justify-center lg:px-12 lg:py-10 xl:px-16"
      aria-labelledby="landing-v2-expedition-title"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <PhotoPlateImg
          src={EXPEDITION_BG}
          loading="lazy"
          className="absolute inset-0 h-full w-full max-w-none object-cover object-[center_60%] opacity-80"
        />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[#081018]/50 md:bg-[#081018]/35"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(8,16,24,0.7)_0%,rgba(8,16,24,0.45)_40%,rgba(8,16,24,0.15)_100%),linear-gradient(180deg,rgba(8,16,24,0.5)_0%,rgba(8,16,24,0.05)_30%,rgba(8,16,24,0.1)_70%,rgba(8,16,24,0.65)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_78%_40%,rgba(104,216,192,0.1),transparent_46%),radial-gradient(ellipse_at_12%_70%,rgba(251,191,36,0.06),transparent_40%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-soma-physiology/25 to-transparent"
      />

      <div className="relative mx-auto grid w-full max-w-[88rem] gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-12">
        <motion.div
          className="landing-v2-copy-veil min-w-0"
          initial={fadeUp}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={enter}
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-soma-action">
            {t("expedition.eyebrow")}
          </p>
          <h2
            id="landing-v2-expedition-title"
            className="mt-2 text-3xl font-semibold tracking-tight text-soma-ink sm:text-4xl lg:text-[2.35rem] lg:leading-[1.1]"
          >
            {t("expedition.title")}
          </h2>
          <p className="mt-3 inline-flex rounded-full border border-soma-action/40 bg-soma-action/10 px-3 py-1 text-xs font-medium text-soma-action">
            {t("expedition.badge")}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-soma-ink-secondary sm:text-base">
            {t("expedition.intro")}
          </p>

          <h3 className="mt-6 text-[11px] font-medium uppercase tracking-[0.18em] text-soma-ink-muted">
            {t("expedition.routesLabel")}
          </h3>
          <ul className="mt-3 grid gap-3">
            {ROUTES.map((route) => (
              <li
                key={route.id}
                className={`flex items-start gap-3 rounded-2xl border ${route.border} bg-[rgb(8_16_24_/_0.92)] p-4`}
              >
                <img
                  src={routeIconSrc(route.icon, 96)}
                  srcSet={`${routeIconSrc(route.icon, 96)} 96w, ${routeIconSrc(route.icon, 192)} 192w`}
                  sizes="48px"
                  alt=""
                  width={96}
                  height={96}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="h-12 w-12 shrink-0 rounded-full border border-soma-line object-cover"
                />
                <div className="min-w-0">
                  <p className={`text-base font-semibold ${route.accent}`}>
                    {t(`expedition.routes.${route.id}.title`)}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-soma-ink-secondary">
                    {t(`expedition.routes.${route.id}.body`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <Link
            to="/preview/expedition"
            className={`${previewFocus} mt-6 inline-flex min-h-11 items-center justify-center gap-1 rounded-xl bg-soma-action px-6 py-3 text-sm font-semibold text-[#081018] transition-colors hover:bg-soma-action-hover`}
          >
            {t("expedition.demo")}
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </motion.div>

        <motion.figure
          className="min-w-0"
          initial={fadeUp}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ ...enter, delay: reduceMotion ? 0 : 0.1 }}
        >
          <div className="overflow-hidden rounded-3xl border border-soma-line/70 bg-[#0b1620] shadow-[0_0_28px_rgba(104,216,192,0.08)]">
            <picture>
              <source srcSet={EXPEDITION_MAP_WEBP_SRC} type="image/webp" />
              <img
                src={EXPEDITION_MAP_SRC}
                alt={t("expedition.mapAlt")}
                width={EXPEDITION_MAP_WIDTH}
                height={EXPEDITION_MAP_HEIGHT}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="block h-auto w-full"
              />
            </picture>
          </div>
          <figcaption className="mt-3 text-xs leading-relaxed text-soma-ink-muted">
            {t("expedition.mapCaption")}
          </figcaption>
          <p className="mt-2 text-xs leading-relaxed text-soma-ink-muted">
            {t("expedition.note")}
          </p>
        </motion.figure>
      </div>
    </section>
  );
}
