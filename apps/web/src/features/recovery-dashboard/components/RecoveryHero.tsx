import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { DemoNotice } from "./DemoNotice.js";

const accentColor = { color: "rgb(var(--soma-shell-accent))" };
const photoMask = {
  maskImage: "linear-gradient(to bottom, black 0%, black 85%, transparent 100%)",
  WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 85%, transparent 100%)",
};

interface RecoveryHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  quote: string | null;
  demo?: boolean;
  children?: ReactNode;
}

export function RecoveryHero({
  eyebrow,
  title,
  description,
  quote,
  demo = false,
  children,
}: RecoveryHeroProps) {
  const { t } = useTranslation("recovery");
  return (
    <section className="relative isolate -mx-4 lg:-mx-6">
      <div className="relative overflow-hidden">
        <img
          src="/images/decoration/nature-2.png"
          alt=""
          width={1920}
          height={800}
          decoding="async"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover object-[center_42%]"
          style={photoMask}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgb(var(--soma-shell-rail) / 0.88) 0%, rgb(var(--soma-shell-rail) / 0.4) 36%, rgb(var(--soma-shell-rail) / 0.06) 68%, transparent 100%)",
            ...photoMask,
          }}
        />
        <div className="relative z-10 grid items-end gap-5 px-4 pb-10 pt-8 sm:min-h-[16.5rem] sm:pb-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,22rem)] lg:items-center lg:px-6 lg:pb-20 lg:pt-10">
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
            <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-soma-ink sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-soma-ink-secondary">
              {description}
            </p>
          </header>
          {quote ? (
            <aside className="justify-self-start rounded-2xl border border-soma-line-strong/70 bg-[rgb(3_12_20_/_0.58)] px-4 py-4 backdrop-blur-md lg:justify-self-end">
              <span aria-hidden="true" className="font-serif text-4xl leading-none" style={accentColor}>
                “
              </span>
              <p className="mt-1 text-sm font-medium leading-relaxed text-soma-ink">{quote}</p>
              <span className="sr-only">{t("homeDailyTitle")}</span>
            </aside>
          ) : null}
        </div>
      </div>
      {children ? (
        <div className="relative z-20 px-4 -mt-8 sm:-mt-12 lg:px-6 lg:-mt-20">{children}</div>
      ) : null}
    </section>
  );
}
