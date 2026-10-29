import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useShellLayout } from "../hooks/useShellLayout.js";
import {
  SHELL_HERO_BLEED_COLLAPSED_CLASS,
  SHELL_HERO_BLEED_EXPANDED_CLASS,
} from "../shell-sidebar.js";
import { DemoNotice } from "./DemoNotice.js";

const accentColor = { color: "rgb(var(--soma-shell-accent))" };
const photoMask = {
  maskImage: "linear-gradient(to bottom, black 0%, black 85%, transparent 100%)",
  WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 85%, transparent 100%)",
};

const DEFAULT_IMAGE = "/images/decoration/nature-2.png";
const DEFAULT_OBJECT_POSITION = "center 42%";
const DEFAULT_OVERLAY =
  "linear-gradient(90deg, rgb(var(--soma-shell-rail) / 0.88) 0%, rgb(var(--soma-shell-rail) / 0.4) 36%, rgb(var(--soma-shell-rail) / 0.06) 68%, transparent 100%)";

interface RecoveryHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  quote: string | null;
  demo?: boolean;
  imageSrc?: string;
  objectPosition?: string;
  overlay?: string;
  /** Optional LCP hint. Other pages omit it. */
  fetchPriority?: "high" | "low" | "auto";
  imageWidth?: number;
  imageHeight?: number;
  imageClassName?: string;
  /** Taller frame for ultra-wide panoramas. */
  panorama?: boolean;
  /** Recovery page: sit the heading against the content top without moving other heroes. */
  compactHeader?: boolean;
  /** Atlas: shorter band so the visor can sit with the system list. Other pages omit it. */
  compactBand?: boolean;
  children?: ReactNode;
}

export function RecoveryHero({
  eyebrow,
  title,
  description,
  quote,
  demo = false,
  imageSrc = DEFAULT_IMAGE,
  objectPosition = DEFAULT_OBJECT_POSITION,
  overlay = DEFAULT_OVERLAY,
  fetchPriority,
  imageWidth = 1920,
  imageHeight = 800,
  imageClassName,
  panorama = false,
  compactHeader = false,
  compactBand = false,
  children,
}: RecoveryHeroProps) {
  const { t } = useTranslation("recovery");
  const { collapsed } = useShellLayout();
  return (
    <section
      className={`relative isolate ${
        collapsed ? SHELL_HERO_BLEED_COLLAPSED_CLASS : SHELL_HERO_BLEED_EXPANDED_CLASS
      }`}
    >
      <div className="relative overflow-hidden">
        <img
          src={imageSrc}
          alt=""
          width={imageWidth}
          height={imageHeight}
          decoding="async"
          draggable={false}
          fetchPriority={fetchPriority}
          sizes="100vw"
          className={`absolute inset-0 h-full w-full object-cover ${imageClassName ?? ""}`}
          style={{
            ...photoMask,
            ...(imageClassName ? {} : { objectPosition }),
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: overlay,
            ...photoMask,
          }}
        />
        <div
          className={
            compactBand
              ? "relative z-10 grid items-center gap-3 px-4 py-4 sm:py-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(13rem,18rem)] lg:min-h-[10.75rem] lg:px-6 lg:py-5"
              : compactHeader
                ? "relative z-10 grid items-start gap-5 px-4 pb-6 pt-7 sm:pb-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,22rem)] lg:px-6 lg:pb-10 lg:pt-7"
                : panorama
                  ? "relative z-10 grid items-start gap-5 px-4 pb-16 pt-7 min-h-[14.5rem] sm:min-h-[18rem] sm:pb-20 lg:grid-cols-[minmax(0,1.5fr)_minmax(14rem,18rem)] lg:min-h-[20rem] lg:px-6 lg:pb-24 lg:pt-8"
                  : "relative z-10 grid items-end gap-5 px-4 pb-10 pt-8 sm:min-h-[16.5rem] sm:pb-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,22rem)] lg:items-center lg:px-6 lg:pb-20 lg:pt-10"
          }
        >
          <header className="max-w-2xl">
            <div className="flex items-start justify-between gap-3">
              <p
                className="text-[11px] font-medium uppercase tracking-[0.22em]"
                style={accentColor}
              >
                {eyebrow}
              </p>
              {demo ? <DemoNotice /> : null}
            </div>
            <h1
              className={
                compactBand
                  ? "mt-2 text-2xl font-semibold leading-tight tracking-tight text-soma-ink sm:text-3xl"
                  : "mt-3 text-3xl font-semibold leading-tight tracking-tight text-soma-ink sm:text-4xl"
              }
            >
              {title}
            </h1>
            <p
              className={
                compactBand
                  ? "mt-2 max-w-xl text-sm leading-relaxed text-soma-ink-secondary"
                  : "mt-3 max-w-xl text-sm leading-relaxed text-soma-ink-secondary"
              }
            >
              {description}
            </p>
          </header>
          {quote ? (
            <aside
              className={
                compactBand
                  ? "justify-self-start max-w-xs rounded-xl border border-soma-line-strong/50 bg-[rgb(3_12_20_/_0.55)] px-3 py-2.5 backdrop-blur-md lg:justify-self-end"
                  : panorama
                    ? "mt-8 mr-1 justify-self-start max-w-xs rounded-xl border border-soma-line-strong/50 bg-[rgb(3_12_20_/_0.55)] px-3 py-2.5 backdrop-blur-md sm:mt-10 lg:mt-12 lg:mr-4 lg:justify-self-end"
                    : "justify-self-start rounded-2xl border border-soma-line-strong/70 bg-[rgb(3_12_20_/_0.58)] px-4 py-4 backdrop-blur-md lg:justify-self-end"
              }
            >
              {panorama || compactBand ? null : (
                <span aria-hidden="true" className="font-serif text-4xl leading-none" style={accentColor}>
                  “
                </span>
              )}
              <p
                className={`text-sm font-medium leading-relaxed text-soma-ink ${
                  panorama || compactBand ? "" : "mt-1"
                }`}
              >
                {panorama || compactBand ? `“${quote}”` : quote}
              </p>
              <span className="sr-only">{t("homeDailyTitle")}</span>
            </aside>
          ) : null}
        </div>
      </div>
      {children ? (
        <div
          className={
            compactHeader
              ? "relative z-20 px-4 pt-4 sm:pt-5 lg:px-6"
              : "relative z-20 px-4 -mt-8 sm:-mt-12 lg:px-6 lg:-mt-20"
          }
        >
          {children}
        </div>
      ) : null}
    </section>
  );
}
