import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ShellBaseProvider } from "../context/ShellBaseContext.js";
import { shellSections, type ShellBase } from "../shell-base.js";
import { PreviewMobileHeader } from "./PreviewMobileHeader.js";
import { PreviewMobileNav } from "./PreviewMobileNav.js";
import { PreviewSidebar } from "./PreviewSidebar.js";

interface PreviewShellProps {
  /** `/app` for the authenticated product; `/preview` for the public DEMO. */
  base: ShellBase;
}

export function PreviewShell({ base }: PreviewShellProps) {
  const { pathname } = useLocation();
  const sections = shellSections(base);
  const current = sections.find((item) => item.to === pathname) ?? sections[0];

  useEffect(() => {
    const previous = document.title;
    document.title = current ? `Soma — ${current.label}` : "Soma";
    return () => {
      document.title = previous;
    };
  }, [current]);

  return (
    <ShellBaseProvider base={base}>
      <div className="relative min-h-screen bg-[#081018] text-soma-ink lg:pl-60">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(78,132,172,0.18),transparent_46%),radial-gradient(ellipse_at_8%_100%,rgba(26,74,98,0.16),transparent_42%),linear-gradient(180deg,#12283a_0%,#0c1824_52%,#071018_100%)]"
        />
        <PreviewSidebar />
        <PreviewMobileHeader />
        <main className="relative px-4 pb-28 pt-2 lg:px-6 lg:pb-2 lg:pt-3">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:max-w-[1120px] lg:gap-2">
            <Outlet />
          </div>
        </main>
        <PreviewMobileNav />
      </div>
    </ShellBaseProvider>
  );
}
