import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { LanguageSelector } from "../../../components/LanguageSelector.js";
import {
  MAIN_CONTENT_ID,
  SkipToContent,
} from "../../../components/SkipToContent.js";
import { SomaMark } from "../../recovery-dashboard/components/SomaMark.js";
import { previewFocus } from "../../recovery-dashboard/focus.js";

export const onboardingCardClass =
  "rounded-xl border bg-[#07141f] p-4 motion-safe:transition-[border-color,box-shadow] motion-safe:duration-200";

export const onboardingCardIdleClass = "border-white/10 shadow-none";

export const onboardingCardActiveClass =
  "border-[#68D8C0]/40 shadow-[inset_0_0_0_1px_rgba(104,216,192,0.12)]";

export const onboardingLabelClass =
  "mb-2 block text-xs uppercase tracking-wider text-soma-ink-secondary";

export const onboardingSegmentTrackClass =
  "grid grid-cols-2 rounded-xl border border-white/10 bg-[#081018] p-1";

export const onboardingSegmentButtonClass = `${previewFocus} min-h-11 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50`;

export const onboardingSegmentActiveClass =
  "bg-[#68D8C0]/15 text-[#68D8C0]";

export const onboardingSegmentIdleClass =
  "bg-transparent text-soma-ink-secondary hover:text-soma-ink";

export const onboardingDetailsClass =
  "grid motion-safe:transition-[grid-template-rows] motion-safe:duration-200 motion-safe:ease-out motion-reduce:transition-none";

export const onboardingDetailsOpenClass = "grid-rows-[1fr]";

export const onboardingDetailsClosedClass = "grid-rows-[0fr]";

export function OnboardingShell({
  children,
  brandTo = "/app",
}: {
  children: ReactNode;
  brandTo?: string;
}) {
  return (
    <div className="min-h-svh overflow-x-hidden bg-[#081018] text-soma-ink">
      <SkipToContent />
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link to={brandTo} className={`${previewFocus} rounded-lg`}>
          <SomaMark />
        </Link>
        <LanguageSelector />
      </header>
      <main
        id={MAIN_CONTENT_ID}
        tabIndex={-1}
        className="mx-auto w-full max-w-3xl px-4 pb-12 pt-2 sm:px-6 sm:pb-16"
      >
        {children}
      </main>
    </div>
  );
}
