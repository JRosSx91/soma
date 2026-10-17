import { useState } from "react";
import { previewFocus } from "../focus.js";
import { AnatomyAtlas2D } from "../anatomy/AnatomyAtlas2D.js";
import { atlasSystems, bodyAtlasView } from "../anatomy/atlas-config.js";
import type { AtlasSystem, AtlasViewId } from "../anatomy/atlas-types.js";
import { PageHeading } from "../components/PageHeading.js";

const tabs = ["resumen", "efectos", "recuperacion", "consejos"] as const;
type AnatomyTab = (typeof tabs)[number];

const tabLabel: Record<AnatomyTab, string> = {
  resumen: "Resumen",
  efectos: "Efectos",
  recuperacion: "Recuperación",
  consejos: "Consejos",
};

export function AnatomyExplorerPage() {
  const [systemId, setSystemId] = useState<string | null>(null);
  const [organId, setOrganId] = useState<string | null>(null);
  const [view, setView] = useState<AtlasViewId>("anterior");
  const [tab, setTab] = useState<AnatomyTab>("resumen");

  const system = atlasSystems.find((item) => item.id === systemId) ?? null;
  const organ = system?.organs.find((item) => item.id === organId) ?? null;
  const posteriorAvailable = system
    ? Boolean(system.plates.posterior)
    : Boolean(bodyAtlasView.plates.posterior);
  const plate =
    view === "posterior"
      ? (system?.plates.posterior ?? bodyAtlasView.plates.posterior)
      : organ
        ? organ.plate
        : system
          ? system.plates.anterior
          : bodyAtlasView.plates.anterior;
  const fullBodyPlate =
    view === "anterior" && !organ && plate?.aspectRatio === "1024 / 1536";
  const regions =
    system?.organs.flatMap((item) => {
      const path = item.regions[view];
      return path ? [{ organId: item.id, path }] : [];
    }) ?? [];

  const unavailableMessage = !system
    ? "Elige un sistema para continuar."
    : view === "posterior" && !posteriorAvailable
      ? `La vista posterior de ${system.name} todavía no está disponible.`
      : organ && !organ.plate
        ? `${organ.name} todavía no tiene una ilustración propia.`
        : `${system.name} todavía no tiene ilustración.`;

  return (
    <div className="flex flex-col gap-3 pb-2">
      <PageHeading
        eyebrow="Explorador anatómico"
        title="Tu cuerpo, sistema por sistema."
        description="Elige un sistema para recorrer el cuerpo y sus órganos."
      />

      <nav aria-label="Nivel del atlas" className="flex flex-wrap items-center gap-1.5 text-sm">
        <Crumb
          current={system === null}
          onClick={() => {
            setSystemId(null);
            setOrganId(null);
            setView("anterior");
            setTab("resumen");
          }}
        >
          Cuerpo humano
        </Crumb>
        {system ? (
          <>
            <span aria-hidden="true" className="text-soma-ink-muted">
              /
            </span>
            <Crumb
              current={organ === null}
              onClick={() => {
                setOrganId(null);
                setTab("resumen");
              }}
            >
              {system.name}
            </Crumb>
          </>
        ) : null}
        {organ ? (
          <>
            <span aria-hidden="true" className="text-soma-ink-muted">
              /
            </span>
            <span className="text-soma-ink">{organ.name}</span>
          </>
        ) : null}
      </nav>

      <div className="grid items-start gap-3 lg:grid-cols-[10.75rem_minmax(0,1fr)_21.5rem] xl:grid-cols-[11.5rem_minmax(0,1fr)_23rem]">
        <ul
          aria-label="Sistemas"
          className="flex gap-2 overflow-x-auto pb-1 lg:max-h-[min(48rem,calc(100svh-13.5rem))] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:overscroll-contain lg:pr-1"
        >
          {atlasSystems.map((item) => {
            const selected = item.id === system?.id;
            const thumb = item.plates.anterior?.src;
            return (
              <li key={item.id} className="shrink-0 lg:shrink">
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setSystemId(item.id);
                    setOrganId(null);
                    setView("anterior");
                    setTab("resumen");
                  }}
                  className={`${previewFocus} flex w-full items-center gap-2 rounded-xl border px-2.5 py-1.5 text-left text-xs leading-tight ${
                    selected
                      ? "border-soma-action/80 bg-soma-raised/50 text-soma-ink"
                      : "border-soma-line bg-soma-surface text-soma-ink-secondary hover:border-soma-line-strong"
                  }`}
                >
                  {thumb ? (
                    <img src={thumb} alt="" className="h-7 w-7 shrink-0 object-contain" />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="h-7 w-7 shrink-0 rounded-lg border border-dashed border-soma-line bg-soma-canvas"
                    />
                  )}
                  <span className="min-w-0 whitespace-nowrap lg:whitespace-normal">{item.name}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <AnatomyAtlas2D
          label={organ?.name ?? system?.name ?? "Cuerpo humano"}
          plate={view === "posterior" && !posteriorAvailable ? null : plate}
          unavailableMessage={unavailableMessage}
          regions={regions}
          selectedOrganId={organId}
          view={view}
          posteriorAvailable={posteriorAvailable}
          fillView={fullBodyPlate}
          onViewChange={setView}
          onSelectOrgan={setOrganId}
        />

        <SystemPanel
          system={system}
          organId={organId}
          tab={tab}
          onTab={setTab}
          onSystem={(id) => {
            setSystemId(id);
            setOrganId(null);
            setView("anterior");
            setTab("resumen");
          }}
          onOrgan={(id) => setOrganId(id === organId ? null : id)}
        />
      </div>
    </div>
  );
}

function SystemPanel({
  system,
  organId,
  tab,
  onTab,
  onSystem,
  onOrgan,
}: {
  system: AtlasSystem | null;
  organId: string | null;
  tab: AnatomyTab;
  onTab: (tab: AnatomyTab) => void;
  onSystem: (id: string) => void;
  onOrgan: (id: string) => void;
}) {
  const organ = system?.organs.find((item) => item.id === organId) ?? null;
  const illustrated = atlasSystems.filter((item) => item.plates.anterior);

  return (
    <aside className="rounded-2xl border border-soma-line bg-soma-surface p-4 lg:max-h-[min(48rem,calc(100svh-13.5rem))] lg:overflow-y-auto">
      <h2 className="text-lg font-semibold text-soma-ink">
        {organ?.name ?? system?.name ?? "Cuerpo humano"}
      </h2>

      {system ? (
        <div role="tablist" aria-label="Ficha del sistema" className="mt-4 flex flex-wrap gap-1.5">
          {tabs.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              id={`anatomy-tab-${item}`}
              aria-selected={tab === item}
              aria-controls="anatomy-tab-panel"
              onClick={() => onTab(item)}
              className={`${previewFocus} rounded-full px-2.5 py-1 text-xs ${
                tab === item ? "bg-soma-action text-[#081018]" : "bg-soma-canvas text-soma-ink-secondary"
              }`}
            >
              {tabLabel[item]}
            </button>
          ))}
        </div>
      ) : null}

      <p
        id="anatomy-tab-panel"
        role={system ? "tabpanel" : undefined}
        aria-labelledby={system ? `anatomy-tab-${tab}` : undefined}
        className="mt-3 text-sm leading-relaxed text-soma-ink-secondary"
      >
        {panelCopy(system, organ, tab)}
      </p>

      {!system ? (
        <>
          <h3 className="mt-5 text-sm font-semibold text-soma-ink">Sistemas con ilustración</h3>
          <ul className="mt-2 grid grid-cols-2 gap-2">
            {illustrated.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSystem(item.id)}
                  className={`${previewFocus} flex w-full flex-col items-center gap-2 rounded-2xl border border-soma-line bg-soma-canvas/50 px-2 py-3 text-center text-xs text-soma-ink-secondary hover:border-soma-line-strong hover:text-soma-ink`}
                >
                  <span className="flex h-14 w-full items-center justify-center">
                    <img src={item.plates.anterior?.src} alt="" className="h-14 w-full object-contain" />
                  </span>
                  <span className="leading-tight">{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : system.organs.length === 0 ? (
        <p className="mt-4 text-xs leading-relaxed text-soma-ink-muted">
          Este sistema todavía no tiene órganos que se puedan abrir.
        </p>
      ) : (
        <>
          <h3 className="mt-5 text-sm font-semibold text-soma-ink">Órganos principales</h3>
          <ul className="mt-2 grid grid-cols-3 gap-2">
            {system.organs.map((item) => {
              const selected = item.id === organId;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onOrgan(item.id)}
                    className={`${previewFocus} flex w-full flex-col items-center gap-2 rounded-2xl border px-1.5 py-2 text-center ${
                      selected ? "border-soma-action/80 bg-soma-raised/40" : "border-soma-line bg-soma-canvas/40"
                    }`}
                  >
                    <span className="flex h-16 w-full items-center justify-center rounded-xl bg-[#101820]">
                      {item.plate ? (
                        <img src={item.plate.src} alt="" className="h-14 w-full object-contain" />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="grid h-10 w-10 place-items-center rounded-full bg-soma-surface text-sm text-soma-ink-muted"
                        >
                          {item.name.slice(0, 1)}
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] leading-tight text-soma-ink-secondary">{item.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </aside>
  );
}

function panelCopy(
  system: AtlasSystem | null,
  organ: AtlasSystem["organs"][number] | null,
  tab: AnatomyTab,
): string {
  if (!system) {
    return "Una vista anterior del organismo. Abre un sistema para ver sus órganos y la ilustración disponible.";
  }
  if (tab === "efectos") {
    return "Los efectos ligados a cada sustancia todavía no aparecen en esta ficha.";
  }
  if (tab === "recuperacion") {
    return "Tu recuperación no se muestra en esta vista.";
  }
  if (tab === "consejos") {
    return "Todavía no hay consejos para esta ficha.";
  }
  if (organ) {
    if (organ.id === "lungs") {
      return "Ilustración de los pulmones y de la vía aérea central. Bronquios y mucosa nasal se abren en sus propias fichas.";
    }
    if (!organ.plate) {
      return `${organ.name}. Esta ficha todavía no tiene una ilustración propia.`;
    }
    return organ.name;
  }
  if (system.id === "respiratory") {
    return "Reúne los pulmones, los bronquios y la mucosa nasal. La ilustración muestra el conjunto sobre el cuerpo, en vista anterior.";
  }
  if (system.organs.length === 0) {
    return `${system.name} todavía no tiene órganos asociados.`;
  }
  const names = system.organs.map((item) => item.name).join(", ");
  return `${system.name}. Incluye ${names}.`;
}

function Crumb({
  current,
  onClick,
  children,
}: {
  current: boolean;
  onClick: () => void;
  children: string;
}) {
  if (current) {
    return <span className="text-soma-ink">{children}</span>;
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${previewFocus} rounded text-soma-action hover:text-soma-action-hover`}
    >
      {children}
    </button>
  );
}
