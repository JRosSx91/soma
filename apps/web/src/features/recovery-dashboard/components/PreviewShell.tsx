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
      className={`relative min-h-screen overflow-x-hidden text-soma-ink transition-[padding] duration-200 ease-out motion-reduce:transition-none ${
        collapsed ? SHELL_SIDEBAR_COLLAPSED_CLASS : SHELL_SIDEBAR_EXPANDED_CLASS
      }`}
      style={{
        backgroundColor: "rgb(var(--soma-shell-rail))",
        backgroundImage:
          "radial-gradient(ellipse at 72% 0%, rgb(var(--soma-physiology) / 0.42), transparent 58%), radial-gradient(ellipse at 8% 100%, rgb(var(--soma-physiology) / 0.16), transparent 46%), linear-gradient(180deg, rgb(var(--soma-shell-canvas)) 0%, rgb(var(--soma-shell-rail)) 100%)",
      }}
    >
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
          className={`mx-auto flex w-full min-w-0 flex-col gap-6 lg:gap-2 ${
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
