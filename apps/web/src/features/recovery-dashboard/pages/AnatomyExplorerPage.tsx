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
    ? "No hay una lámina de cuerpo completo. Elige un sistema del catálogo."
    : view === "posterior" && !posteriorAvailable
      ? `No hay lámina posterior de ${system.name}.`
      : organ && !organ.plate
        ? `No hay lámina de ${organ.name}. La selección sigue en la tarjeta.`
        : `No hay lámina registrada para ${system.name}.`;

  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeading
        eyebrow="Explorador anatómico"
        title="Tu cuerpo, sistema por sistema."
        description="Vista anterior del cuerpo como referencia visual. Cada sistema conserva su lámina cuando existe. No hay porcentajes de recuperación en esta vista."
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

      <div className="grid items-start gap-4 lg:grid-cols-[12.5rem_minmax(0,1fr)_17rem]">
        <ul
          aria-label="Sistemas del catálogo"
          className="flex gap-2 overflow-x-auto pb-1 lg:max-h-[min(44rem,calc(100svh-16rem))] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:overscroll-contain lg:pr-1"
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
                  className={`${previewFocus} flex w-full items-center gap-2 rounded-2xl border px-3 py-2 text-left text-sm ${
                    selected
                      ? "border-soma-action/80 bg-soma-raised/50 text-soma-ink"
                      : "border-soma-line bg-soma-surface text-soma-ink-secondary hover:border-soma-line-strong"
                  }`}
                >
                  {thumb ? (
                    <img src={thumb} alt="" className="h-8 w-8 shrink-0 object-contain" />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-dashed border-soma-line text-[10px] text-soma-ink-muted"
                    >
                      —
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block whitespace-nowrap lg:whitespace-normal">{item.name}</span>
                    {item.organs.length === 0 ? (
                      <span className="block text-[10px] text-soma-ink-muted">Sin órganos en el catálogo</span>
                    ) : null}
                  </span>
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
  onOrgan,
}: {
  system: AtlasSystem | null;
  organId: string | null;
  tab: AnatomyTab;
  onTab: (tab: AnatomyTab) => void;
  onOrgan: (id: string) => void;
}) {
  const organ = system?.organs.find((item) => item.id === organId) ?? null;

  return (
    <aside className="rounded-2xl border border-soma-line bg-soma-surface p-4">
      <h2 className="text-lg font-semibold text-soma-ink">
        {organ?.name ?? system?.name ?? "Cuerpo humano"}
      </h2>
      <div role="tablist" aria-label="Ficha del sistema" className="mt-4 flex flex-wrap gap-1.5">
        {tabs.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={tab === item}
            onClick={() => onTab(item)}
            className={`${previewFocus} rounded-full px-2.5 py-1 text-xs ${
              tab === item ? "bg-soma-action text-[#081018]" : "bg-soma-canvas text-soma-ink-secondary"
            }`}
          >
            {tabLabel[item]}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-soma-ink-secondary">{panelCopy(system, organ, tab)}</p>

      <h3 className="mt-4 text-sm font-semibold text-soma-ink">Órganos del catálogo</h3>
      {!system || system.organs.length === 0 ? (
        <p className="mt-2 text-xs text-soma-ink-muted">
          {system ? "Este sistema no tiene órganos en el catálogo." : "Elige un sistema para ver sus órganos."}
        </p>
      ) : (
        <ul className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {system.organs.map((item) => {
            const selected = item.id === organId;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onOrgan(item.id)}
                  className={`${previewFocus} flex w-24 flex-col items-center gap-1 rounded-xl border px-1 py-2 text-center ${
                    selected ? "border-soma-action/80" : "border-soma-line"
                  }`}
                >
                  {item.plate ? (
                    <img src={item.plate.src} alt="" className="h-10 w-10 object-contain" />
                  ) : (
                    <span className="grid h-10 w-10 place-items-center rounded-lg border border-dashed border-soma-line text-[9px] leading-tight text-soma-ink-muted">
                      Sin lámina
                    </span>
                  )}
                  <span className="text-[10px] leading-tight text-soma-ink-secondary">{item.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <h3 className="mt-4 text-sm font-semibold text-soma-ink">Siguiente nivel</h3>
      <p className="mt-2 text-xs leading-relaxed text-soma-ink-muted">
        Proceso fisiológico y neurotransmisor quedan preparados en la ruta, y todavía no tienen contenido en esta vista.
      </p>
    </aside>
  );
}

function panelCopy(
  system: AtlasSystem | null,
  organ: AtlasSystem["organs"][number] | null,
  tab: AnatomyTab,
): string {
  if (!system) {
    return "Vista anterior del cuerpo completo. Es una referencia visual y no tiene regiones de órganos. Elige un sistema para ver sus órganos y, cuando exista, su lámina.";
  }
  if (tab === "efectos") {
    return "Los efectos por sustancia no están conectados a esta ficha.";
  }
  if (tab === "recuperacion") {
    return "Esta ficha no muestra una estimación de recuperación ni los porcentajes de los diseños de referencia.";
  }
  if (tab === "consejos") {
    return "Esta pestaña no ofrece recomendaciones de salud.";
  }
  if (system.organs.length === 0) {
    return `${system.name} figura en el catálogo de sistemas y no tiene órganos asociados.`;
  }
  if (organ) {
    const region =
      organ.regions.anterior || organ.regions.posterior
        ? "Tiene una región registrada."
        : "Su región interactiva todavía no está registrada.";
    if (!organ.plate) {
      return `${organ.name}. No tiene una lámina propia. La selección usa la tarjeta, no una región dibujada. ${region}`;
    }
    return `${organ.plate.depicts} ${region}`;
  }
  const names = system.organs.map((item) => item.name).join(", ");
  return `${system.name}. Órganos del catálogo: ${names}. Ninguna región está registrada sobre la lámina.`;
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
