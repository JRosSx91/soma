import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShellBaseProvider } from "../context/ShellBaseContext.js";
import { ShellLayoutProvider } from "../context/ShellLayoutProvider.js";
import { useShellLayout } from "../hooks/useShellLayout.js";
import { shellSections, type ShellBase } from "../shell-base.js";
import {
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
  const sections = shellSections(base);
  const current = sections.find((item) => item.to === pathname) ?? sections[0];
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
      className={`relative min-h-screen overflow-x-hidden bg-[#081018] text-soma-ink transition-[padding] duration-200 ease-out motion-reduce:transition-none ${
        collapsed ? SHELL_SIDEBAR_COLLAPSED_CLASS : SHELL_SIDEBAR_EXPANDED_CLASS
      }`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(78,132,172,0.18),transparent_46%),radial-gradient(ellipse_at_8%_100%,rgba(26,74,98,0.16),transparent_42%),linear-gradient(180deg,#12283a_0%,#0c1824_52%,#071018_100%)]"
      />
      <PreviewSidebar />
      <PreviewMobileHeader />
      <main className="relative px-4 pb-[calc(5.75rem+env(safe-area-inset-bottom))] pt-2 lg:px-6 lg:pb-2 lg:pt-3">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:max-w-[1120px] lg:gap-2">
          <Outlet />
        </div>
      </main>
      <PreviewMobileNav />
      {base === "/app" ? <AchievementCelebrationHost /> : null}
    </div>
  );
}
