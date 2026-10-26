import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShellBaseProvider } from "../context/ShellBaseContext.js";
import { ShellLayoutProvider } from "../context/ShellLayoutProvider.js";
import { useShellLayout } from "../hooks/useShellLayout.js";
import { shellSectionForPathname, type ShellBase } from "../shell-base.js";
import {
  SHELL_CONTENT_COLLAPSED_ALIGN_CLASS,
  SHELL_CONTENT_COLLAPSED_PAD_CLASS,
  SHELL_CONTENT_EXPANDED_PAD_CLASS,
  SHELL_SIDEBAR_COLLAPSED_CLASS,
  SHELL_SIDEBAR_EXPANDED_CLASS,
} from "../shell-sidebar.js";
import { AchievementCelebrationHost } from "../../achievements/components/AchievementCelebrationHost.js";
import { PreviewMobileHeader } from "./PreviewMobileHeader.js";
import { PreviewMobileNav } from "./PreviewMobileNav.js";
import { PreviewSidebar } from "./PreviewSidebar.js";

interface PreviewShellProps {
  /** `/app` for the authenticated product; `/preview` for the public DEMO. */
  base: ShellBase;
}

export function PreviewShell({ base }: PreviewShellProps) {
  const { t } = useTranslation("common");
  const { pathname } = useLocation();
  const current = shellSectionForPathname(base, pathname);
  const titleLabel = current ? t(`shell.${current.labelKey}`) : "";

  useEffect(() => {
    const previous = document.title;
    document.title = current ? `Soma — ${titleLabel}` : "Soma";
    return () => {
      document.title = previous;
    };
  }, [current, titleLabel]);

  return (
    <ShellBaseProvider base={base}>
      <ShellLayoutProvider>
        <PreviewShellFrame base={base} />
      </ShellLayoutProvider>
    </ShellBaseProvider>
  );
}

function PreviewShellFrame({ base }: { base: ShellBase }) {
  const { collapsed } = useShellLayout();

  return (
    <div
      className={`relative min-h-screen overflow-x-hidden bg-soma-shell text-soma-ink transition-[padding] duration-200 ease-out motion-reduce:transition-none ${
        collapsed ? SHELL_SIDEBAR_COLLAPSED_CLASS : SHELL_SIDEBAR_EXPANDED_CLASS
      }`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_82%_-8%,rgb(var(--soma-shell-accent)_/_0.12),transparent_42%),radial-gradient(ellipse_at_6%_100%,rgb(var(--soma-physiology)_/_0.1),transparent_44%),linear-gradient(180deg,rgb(var(--soma-shell-canvas))_0%,rgb(var(--soma-shell-rail))_100%)]"
      />
      <PreviewSidebar />
      <PreviewMobileHeader />
      <main
        className={`relative px-4 pb-[calc(5.75rem+env(safe-area-inset-bottom))] pt-2 lg:pb-2 lg:pt-3 motion-reduce:transition-none lg:transition-[padding] lg:duration-200 lg:ease-out ${
          collapsed
            ? SHELL_CONTENT_COLLAPSED_PAD_CLASS
            : SHELL_CONTENT_EXPANDED_PAD_CLASS
        }`}
      >
        <div
          className={`mx-auto flex max-w-6xl flex-col gap-6 lg:max-w-[1120px] lg:gap-2 ${
            collapsed ? SHELL_CONTENT_COLLAPSED_ALIGN_CLASS : ""
          }`}
        >
          <Outlet />
        </div>
      </main>
      <PreviewMobileNav />
      {base === "/app" ? <AchievementCelebrationHost /> : null}
    </div>
  );
}
