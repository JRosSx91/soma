import type { ReactNode } from "react";
import { DemoNotice } from "./DemoNotice.js";

interface PageHeadingProps {
  eyebrow: string;
  title: string;
  description: string;
  aside?: ReactNode;
  /** Public preview pages keep the DEMO chip. A signed-in achievements view hides it. */
  demo?: boolean;
}

export function ShellHeadingFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative isolate overflow-hidden rounded-2xl border border-soma-line/35 bg-soma-shell/90 ${className ?? ""}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 motion-reduce:opacity-80"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_92%_-10%,rgb(var(--soma-shell-accent)_/_0.18),transparent_42%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_8%_120%,rgb(var(--soma-physiology)_/_0.1),transparent_46%)]" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(to_top,rgb(var(--soma-shell-rail)_/_0.55),transparent)]" />
        <div className="absolute inset-x-8 bottom-[1.15rem] h-px bg-[linear-gradient(90deg,transparent,rgb(var(--soma-shell-accent)_/_0.35),transparent)]" />
      </div>
      <div className="relative z-10 px-4 py-5 sm:px-5 sm:py-6">{children}</div>
    </div>
  );
}

export function PageHeading({
  eyebrow,
  title,
  description,
  aside,
  demo = true,
}: PageHeadingProps) {
  return (
    <ShellHeadingFrame>
      <header>
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-soma-shell-accent">
            {eyebrow}
          </p>
          <span className="flex shrink-0 items-center gap-2">
            {demo ? <DemoNotice /> : null}
            {aside}
          </span>
        </div>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-soma-ink sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-soma-ink-secondary">
          {description}
        </p>
      </header>
    </ShellHeadingFrame>
  );
}
