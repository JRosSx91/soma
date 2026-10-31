import { useEffect, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "../../../components/LanguageSelector.js";
import {
  MAIN_CONTENT_ID,
  SkipToContent,
} from "../../../components/SkipToContent.js";
import { SomaMark } from "../../recovery-dashboard/components/SomaMark.js";
import { previewFocus } from "../../recovery-dashboard/focus.js";

const HERO_ART = "/images/landing-v2/hero-holographic-anatomy.png";

export const authFieldClass = `${previewFocus} w-full rounded-xl border border-white/10 bg-[#07141f] px-3 py-2.5 text-soma-ink placeholder:text-soma-ink-muted`;

export const authPrimaryButtonClass = `${previewFocus} w-full rounded-xl bg-[#68D8C0] px-4 py-2.5 text-sm font-semibold text-[#081018] transition-colors hover:bg-soma-action-hover disabled:cursor-not-allowed disabled:opacity-50`;

export const authSecondaryButtonClass = `${previewFocus} w-full rounded-xl border border-white/15 bg-transparent px-4 py-2.5 text-sm font-medium text-soma-ink transition-colors hover:border-[#86B7E8]/70 disabled:cursor-not-allowed disabled:opacity-50`;

export const authLinkClass = `${previewFocus} rounded-sm text-[#68D8C0] underline-offset-4 hover:underline`;

export const authTitleClass =
  "text-pretty text-2xl font-light leading-tight tracking-wide text-[#86B7E8] sm:text-3xl";

export const authSubtitleClass =
  "mt-2 text-sm leading-relaxed text-soma-ink-secondary";

function AuthVisualPanel() {
  return (
    <div className="relative hidden min-h-0 overflow-hidden bg-[#081018] lg:block">
      <img
        src={HERO_ART}
        alt=""
        width={1828}
        height={860}
        decoding="async"
        draggable={false}
        className="absolute inset-0 h-full w-full max-w-none origin-center scale-[1.85] object-cover object-[70%_36%]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_right,#081018_0%,rgba(8,16,24,0.88)_32%,rgba(8,16,24,0.35)_48%,transparent_64%,rgba(8,16,24,0.55)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_bottom,#081018_0%,transparent_22%,transparent_78%,#081018_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,transparent_28%,rgba(8,16,24,0.28)_62%,#081018_100%)]"
      />
    </div>
  );
}

function authTitleKey(pathname: string): string {
  if (pathname.startsWith("/register")) return "register.title";
  if (pathname.startsWith("/forgot-password")) return "forgotPassword.title";
  if (pathname.startsWith("/reset-password")) return "resetPassword.title";
  return "login.title";
}

export function AuthShell({ children }: { children: ReactNode }) {
  const { t, i18n } = useTranslation("auth");
  const { pathname } = useLocation();

  useEffect(() => {
    const previous = document.title;
    document.title = `${t("appName")} — ${t(authTitleKey(pathname))}`;
    return () => {
      document.title = previous;
    };
  }, [pathname, t, i18n.language]);

  return (
    <div className="min-h-svh overflow-x-hidden bg-[#081018] text-soma-ink">
      <SkipToContent />
      <div className="grid min-h-svh lg:h-svh lg:grid-cols-2">
        <AuthVisualPanel />
        <div className="flex min-h-svh min-w-0 flex-col lg:h-svh lg:overflow-y-auto">
          <header className="flex shrink-0 items-center justify-between gap-3 px-4 py-4 sm:px-8">
            <Link to="/" className={`${previewFocus} rounded-lg`}>
              <SomaMark />
            </Link>
            <LanguageSelector />
          </header>
          <main
            id={MAIN_CONTENT_ID}
            tabIndex={-1}
            className="flex min-h-0 flex-1 flex-col justify-start px-4 py-6 sm:px-8 sm:py-10 lg:justify-center"
          >
            <div className="mx-auto w-full max-w-sm">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
