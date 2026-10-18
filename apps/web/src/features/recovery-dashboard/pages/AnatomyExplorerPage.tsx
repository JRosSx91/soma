import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { previewFocus } from "../focus.js";
import { AnatomyAtlas2D } from "../anatomy/AnatomyAtlas2D.js";
import { atlasSystems, bodyAtlasView } from "../anatomy/atlas-config.js";
import type { AtlasSystem, AtlasViewId } from "../anatomy/atlas-types.js";
import {
  narrativePhases,
  narrativeSubstances,
  phaseWindowLabel,
  resolveEducationalNarrative,
  selectNarrativeSubstance,
  type NarrativePhase,
} from "../anatomy/narrative-catalog.js";
import {
  recoverySubstances,
  resolveEducationalRecovery,
  selectRecoverySubstance,
} from "../anatomy/recovery-catalog.js";
import { resolveOrganSheet } from "../anatomy/organ-sheet.js";
import { resolveSystemSheet } from "../anatomy/system-sheet.js";
import { useShellBase } from "../context/ShellBaseContext.js";
import { PageHeading } from "../components/PageHeading.js";
import {
  OrganSheetSummary,
  SystemSheetSummary,
} from "../components/OrganSheetSummary.js";
import { SubstanceIllustration } from "../components/SubstanceIllustration.js";

const tabs = ["resumen", "efectos", "recuperacion", "consejos"] as const;
type AnatomyTab = (typeof tabs)[number];

const tabLabel: Record<AnatomyTab, string> = {
  resumen: "Resumen",
  efectos: "Efectos",
  recuperacion: "Recuperación",
  consejos: "Consejos",
};

export function AnatomyExplorerPage() {
  const base = useShellBase();
  const [systemId, setSystemId] = useState<string | null>(null);
  const [organId, setOrganId] = useState<string | null>(null);
  const [view, setView] = useState<AtlasViewId>("anterior");
  const [tab, setTab] = useState<AnatomyTab>("resumen");
  const [substanceId, setSubstanceId] = useState<string | null>(null);
  const [phase, setPhase] = useState<NarrativePhase>("during_use");

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
        ? `${organ.name}. La ilustración individual todavía no está disponible.`
        : `${system.name} todavía no tiene ilustración.`;

  return (
    <div className="flex flex-col gap-3 pb-2">
      <PageHeading
        eyebrow="Explorador anatómico"
        title="Tu cuerpo, sistema por sistema."
        description="Elige un sistema para recorrer el cuerpo y sus órganos."
        demo={base === "/preview"}
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

      <div className="grid min-w-0 items-start gap-3 lg:grid-cols-[10.75rem_minmax(0,1fr)_21.5rem] xl:grid-cols-[11.5rem_minmax(0,1fr)_23rem]">
        <ul
          aria-label="Sistemas"
          className="flex max-w-full min-w-0 gap-2 overflow-x-auto overscroll-x-contain pb-1 touch-pan-x [-webkit-overflow-scrolling:touch] lg:max-h-[min(48rem,calc(100svh-13.5rem))] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:overscroll-contain lg:pr-1 lg:touch-auto"
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
                  className={`${previewFocus} flex min-h-11 w-full items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-xs leading-tight lg:min-h-0 lg:py-1.5 ${
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
          substanceId={substanceId}
          phase={phase}
          onTab={setTab}
          onSubstance={setSubstanceId}
          onPhase={setPhase}
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
  substanceId,
  phase,
  onTab,
  onSubstance,
  onPhase,
  onSystem,
  onOrgan,
}: {
  system: AtlasSystem | null;
  organId: string | null;
  tab: AnatomyTab;
  substanceId: string | null;
  phase: NarrativePhase;
  onTab: (tab: AnatomyTab) => void;
  onSubstance: (id: string) => void;
  onPhase: (phase: NarrativePhase) => void;
  onSystem: (id: string) => void;
  onOrgan: (id: string) => void;
}) {
  const organ = system?.organs.find((item) => item.id === organId) ?? null;
  const illustrated = atlasSystems.filter((item) => item.plates.anterior);
  const scrollRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = 0;
    const header = headerRef.current;
    if (header && header.getBoundingClientRect().top < 0) {
      header.scrollIntoView({ block: "nearest" });
    }
  }, [system?.id, organId, tab]);

  return (
    <aside className="flex min-w-0 flex-col overflow-x-hidden rounded-2xl border border-soma-line bg-soma-surface lg:max-h-[min(48rem,calc(100svh-13.5rem))] lg:overflow-hidden">
      <header ref={headerRef} className="shrink-0 px-4 pb-3 pt-4">
        <h2 className="text-lg font-semibold leading-snug text-soma-ink">
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
      </header>

      <div
        ref={scrollRef}
        className="min-w-0 lg:min-h-0 lg:flex-1 lg:overflow-x-hidden lg:overflow-y-auto lg:overscroll-contain"
      >
      <div className="px-4 pb-4">
      <div
        id="anatomy-tab-panel"
        role={system ? "tabpanel" : undefined}
        aria-labelledby={system ? `anatomy-tab-${tab}` : undefined}
        className="text-sm leading-relaxed text-soma-ink-secondary"
      >
        <PanelBody
          system={system}
          organ={organ}
          tab={tab}
          substanceId={substanceId}
          phase={phase}
          onSubstance={onSubstance}
          onPhase={onPhase}
          onEffects={() => onTab("efectos")}
          onRecovery={() => onTab("recuperacion")}
        />
      </div>

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
      </div>
      </div>
    </aside>
  );
}

function PanelBody({
  system,
  organ,
  tab,
  substanceId,
  phase,
  onSubstance,
  onPhase,
  onEffects,
  onRecovery,
}: {
  system: AtlasSystem | null;
  organ: AtlasSystem["organs"][number] | null;
  tab: AnatomyTab;
  substanceId: string | null;
  phase: NarrativePhase;
  onSubstance: (id: string) => void;
  onPhase: (phase: NarrativePhase) => void;
  onEffects: () => void;
  onRecovery: () => void;
}) {
  if (!system) {
    return (
      <p>
        Una vista anterior del organismo. Abre un sistema para ver sus órganos y la ilustración
        disponible.
      </p>
    );
  }
  if (tab === "efectos") {
    return (
      <EffectsPanel
        system={system}
        organ={organ}
        substanceId={substanceId}
        phase={phase}
        onSubstance={onSubstance}
        onPhase={onPhase}
      />
    );
  }
  if (tab === "recuperacion") {
    return (
      <RecoveryPanel system={system} organ={organ} substanceId={substanceId} onSubstance={onSubstance} />
    );
  }
  if (tab === "consejos") {
    return (
      <p className="rounded-xl border border-dashed border-soma-line px-3 py-4 text-soma-ink-muted">
        Todavía no hay consejos para esta ficha.
      </p>
    );
  }
  return (
    <SummaryCopy system={system} organ={organ} onEffects={onEffects} onRecovery={onRecovery} />
  );
}

function SummaryCopy({
  system,
  organ,
  onEffects,
  onRecovery,
}: {
  system: AtlasSystem;
  organ: AtlasSystem["organs"][number] | null;
  onEffects: () => void;
  onRecovery: () => void;
}) {
  const intro = summaryIntro(system, organ);

  if (!organ) {
    const sheet = resolveSystemSheet(system);
    return <SystemSheetSummary intro={intro} sheet={sheet} />;
  }

  const sheet = resolveOrganSheet(system, organ);
  return (
    <OrganSheetSummary
      sheet={sheet}
      intro={intro}
      onEffects={onEffects}
      onRecovery={onRecovery}
    />
  );
}

function summaryIntro(
  system: AtlasSystem,
  organ: AtlasSystem["organs"][number] | null,
): string {
  if (organ?.id === "lungs") {
    return "Ilustración de los pulmones y de la vía aérea central. Bronquios y mucosa nasal se abren en sus propias fichas.";
  }
  if (organ && !organ.plate) {
    return `${organ.name}. Esta ficha todavía no tiene una ilustración propia.`;
  }
  if (organ) {
    return organ.name;
  }
  if (system.id === "respiratory") {
    return "Reúne los pulmones, los bronquios y la mucosa nasal. La ilustración muestra el conjunto sobre el cuerpo, en vista anterior.";
  }
  if (system.organs.length === 0) {
    return `${system.name}. Visión de conjunto del sistema; no hay órganos canónicos asociados en el catálogo.`;
  }
  const names = system.organs.map((item) => item.name).join(", ");
  return `${system.name}. Incluye ${names}.`;
}

function choiceClass(selected: boolean): string {
  return `${previewFocus} flex min-w-0 cursor-pointer rounded-xl border has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-soma-focus ${
    selected
      ? "border-soma-action/80 bg-soma-raised/40 text-soma-ink"
      : "border-soma-line bg-soma-canvas/40 text-soma-ink-secondary"
  }`;
}

function EffectsPanel({
  system,
  organ,
  substanceId,
  phase,
  onSubstance,
  onPhase,
}: {
  system: AtlasSystem;
  organ: AtlasSystem["organs"][number] | null;
  substanceId: string | null;
  phase: NarrativePhase;
  onSubstance: (id: string) => void;
  onPhase: (phase: NarrativePhase) => void;
}) {
  const { t } = useTranslation(["organ-narrative", "phases", "substances"]);
  const substances = organ ? narrativeSubstances(organ.id) : [];
  const selectedSubstance = organ ? selectNarrativeSubstance(substanceId, organ.id) : null;
  const narrative =
    organ && selectedSubstance
      ? resolveEducationalNarrative(organ.id, selectedSubstance, phase)
      : null;
  const narrativeText = narrative
    ? t(`organ-narrative:${narrative.narrativeKey}`, { lng: "es", defaultValue: "" })
    : "";

  if (!organ) {
    return (
      <p>
        {system.organs.length === 0
          ? "Este sistema todavía no tiene órganos que se puedan abrir."
          : "Abre un órgano para consultar los efectos descritos para cada sustancia."}
      </p>
    );
  }

  if (substances.length === 0 || !selectedSubstance || !narrative) {
    return <p>No hay narrativas de efectos para este órgano.</p>;
  }

  return (
    <div className="space-y-3">
      <fieldset className="min-w-0 border-0 p-0">
        <legend className="sr-only">Sustancia</legend>
        <div className="flex gap-1.5">
          {substances.map((id) => {
            const selected = id === selectedSubstance;
            return (
              <label
                key={id}
                className={`${choiceClass(selected)} flex-1 flex-col items-center gap-1 px-1 py-1.5`}
              >
                <input
                  type="radio"
                  name={`anatomy-substance-${organ.id}`}
                  value={id}
                  checked={selected}
                  onChange={() => onSubstance(id)}
                  className="sr-only"
                />
                <span className="flex h-8 w-8 items-center justify-center">
                  <SubstanceIllustration name={id} className="h-8 w-8" iconClassName="h-4 w-4" />
                </span>
                <span className="max-w-full truncate text-[11px] leading-tight">
                  {t(`substances:${id}.name`, { lng: "es", defaultValue: id })}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="min-w-0 border-0 p-0">
        <legend className="sr-only">Fase</legend>
        <div className="grid grid-cols-2 gap-1.5">
          {narrativePhases.map((item) => {
            const selected = item === phase;
            const windowLabel = phaseWindowLabel(item);
            return (
              <label key={item} className={`${choiceClass(selected)} flex-col px-2 py-1.5 text-left`}>
                <input
                  type="radio"
                  name={`anatomy-phase-${organ.id}`}
                  value={item}
                  checked={selected}
                  onChange={() => onPhase(item)}
                  className="sr-only"
                />
                <span className="block text-[11px] leading-tight">
                  {t(`phases:${item}`, { lng: "es" })}
                </span>
                {windowLabel ? (
                  <span className="mt-0.5 block text-[10px] leading-tight text-soma-ink-muted">
                    {windowLabel}
                  </span>
                ) : null}
              </label>
            );
          })}
        </div>
      </fieldset>

      <p className="text-xs leading-relaxed text-soma-ink-muted">
        Información educativa general. No sustituye una evaluación médica individual.
      </p>

      <p className="text-sm leading-relaxed text-soma-ink-secondary">
        {narrativeText || "Este texto no está disponible en el idioma actual."}
      </p>

      <p className="text-[11px] leading-relaxed text-soma-ink-muted">
        Fuente: {narrative.referenceSource}. Registro del catálogo: {narrative.confidenceLabel}.
      </p>
    </div>
  );
}

function RecoveryPanel({
  system,
  organ,
  substanceId,
  onSubstance,
}: {
  system: AtlasSystem;
  organ: AtlasSystem["organs"][number] | null;
  substanceId: string | null;
  onSubstance: (id: string) => void;
}) {
  const { t } = useTranslation(["substances"]);
  const substances = organ ? recoverySubstances(organ.id) : [];
  const selectedSubstance = organ ? selectRecoverySubstance(substanceId, organ.id) : null;
  const curve =
    organ && selectedSubstance
      ? resolveEducationalRecovery(organ.id, selectedSubstance)
      : null;

  if (!organ) {
    return (
      <p>
        {system.organs.length === 0
          ? "Este sistema todavía no tiene órganos que se puedan abrir."
          : "Abre un órgano para consultar el modelo orientativo de recuperación del catálogo."}
      </p>
    );
  }

  if (substances.length === 0 || !selectedSubstance || !curve) {
    return (
      <p className="rounded-xl border border-dashed border-soma-line px-3 py-4 text-soma-ink-muted">
        No hay un modelo de recuperación catalogado para este órgano.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <fieldset className="min-w-0 border-0 p-0">
        <legend className="sr-only">Sustancia</legend>
        <div className="flex flex-wrap gap-1.5">
          {substances.map((id) => {
            const selected = id === selectedSubstance;
            return (
              <label
                key={id}
                className={`${choiceClass(selected)} flex-1 flex-col items-center gap-1 px-1 py-1.5`}
              >
                <input
                  type="radio"
                  name={`anatomy-recovery-substance-${organ.id}`}
                  value={id}
                  checked={selected}
                  onChange={() => onSubstance(id)}
                  className="sr-only"
                />
                <span className="flex h-8 w-8 items-center justify-center">
                  <SubstanceIllustration name={id} className="h-8 w-8" iconClassName="h-4 w-4" />
                </span>
                <span className="max-w-full truncate text-[11px] leading-tight">
                  {t(`substances:${id}.name`, { lng: "es", defaultValue: id })}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <p className="text-xs leading-relaxed text-soma-ink-muted">
        Modelo orientativo del catálogo Soma. No es una estimación personal ni un plazo médico: la
        evolución real depende de factores individuales.
      </p>

      <dl className="space-y-2 text-sm text-soma-ink-secondary">
        <div>
          <dt className="text-xs font-semibold text-soma-ink">Forma de la curva</dt>
          <dd>{curve.shapeLabel}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-soma-ink">
            Días orientativos hacia el 95&nbsp;% del techo
          </dt>
          <dd>{curve.daysTo95Recovery} días</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-soma-ink">Techo de recuperación del catálogo</dt>
          <dd>{curve.ceilingPercentLabel}</dd>
        </div>
      </dl>

      <p className="text-[11px] leading-relaxed text-soma-ink-muted">
        Fuente: {curve.referenceSource}. Registro del catálogo: {curve.confidenceLabel}.
      </p>
    </div>
  );
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
