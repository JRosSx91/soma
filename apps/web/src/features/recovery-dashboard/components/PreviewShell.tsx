import { useEffect, useState } from "react";
import type { PreviewSectionId } from "../demo-data.js";
import { previewSections } from "../demo-data.js";
import { DemoNotice } from "./DemoNotice.js";
import { PreviewHome } from "./PreviewHome.js";
import { PreviewMobileHeader } from "./PreviewMobileHeader.js";
import { PreviewMobileNav } from "./PreviewMobileNav.js";
import { PreviewSidebar } from "./PreviewSidebar.js";

export function PreviewShell() {
  const [section, setSection] = useState<PreviewSectionId>("inicio");
  const current = previewSections.find((item) => item.id === section);

  useEffect(() => {
    const previous = document.title;
    document.title = "Soma — vista previa";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#081018] text-soma-ink lg:pl-60">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(78,132,172,0.18),transparent_46%),radial-gradient(ellipse_at_8%_100%,rgba(26,74,98,0.16),transparent_42%),linear-gradient(180deg,#12283a_0%,#0c1824_52%,#071018_100%)]"
      />
      <PreviewSidebar section={section} onSection={setSection} />
      <PreviewMobileHeader />
      <main className="relative px-4 pb-28 pt-2 lg:px-6 lg:pb-2 lg:pt-3">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:max-w-[1120px] lg:gap-2">
          {section === "inicio" ? (
            <PreviewHome />
          ) : (
            <section className="rounded-2xl border border-soma-line bg-soma-surface p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl font-semibold text-soma-ink">
                  {current?.label}
                </h1>
                <DemoNotice />
              </div>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-soma-ink-secondary">
                Esta sección está reservada en la navegación de Soma 2.0. El
                dashboard de esta fase vive en Inicio y no carga el explorador
                anatómico.
              </p>
            </section>
          )}
        </div>
      </main>
      <PreviewMobileNav section={section} onSection={setSection} />
    </div>
  );
}
