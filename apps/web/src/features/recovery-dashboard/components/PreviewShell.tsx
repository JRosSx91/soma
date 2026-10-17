import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { previewSections } from "../demo-data.js";
import { PreviewMobileHeader } from "./PreviewMobileHeader.js";
import { PreviewMobileNav } from "./PreviewMobileNav.js";
import { PreviewSidebar } from "./PreviewSidebar.js";

export function PreviewShell() {
  const { pathname } = useLocation();
  const current =
    previewSections.find((item) => item.to === pathname) ?? previewSections[0];

  useEffect(() => {
    const previous = document.title;
    document.title = current ? `Soma — ${current.label}` : "Soma — vista previa";
    return () => {
      document.title = previous;
    };
  }, [current]);

  return (
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
  );
}
