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

export function PageHeading({
  eyebrow,
  title,
  description,
  aside,
  demo = true,
}: PageHeadingProps) {
  return (
    <header>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-soma-action">
          {eyebrow}
        </p>
        <span className="flex shrink-0 items-center gap-2">
          {demo ? <DemoNotice /> : null}
          {aside}
        </span>
      </div>
      <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight text-soma-ink sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-soma-ink-secondary">
        {description}
      </p>
    </header>
  );
}
