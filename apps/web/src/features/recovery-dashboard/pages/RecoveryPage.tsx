import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  changeSubstance,
  chartSeriesForSystem,
  demoMoments,
  recoveryTabs,
  type RecoveryTab,
} from "../pages-data.js";
import { previewFocus } from "../focus.js";
import { usePreviewDashboard } from "../hooks/usePreviewDashboard.js";
import { DetailSheet } from "../components/DetailSheet.js";
import { EvolutionChart } from "../components/EvolutionChart.js";
import { PageHeading } from "../components/PageHeading.js";
import { RecentChangeCard } from "../components/RecentChangeCard.js";
import { SegmentedControl } from "../components/SegmentedControl.js";
import { SubstanceCard } from "../components/SubstanceCard.js";
import { SystemTile } from "../components/SystemTile.js";

export function RecoveryPage() {
  const [tab, setTab] = useState<RecoveryTab>("general");
  const [substanceId, setSubstanceId] = useState<string | null>(null);
  const [systemId, setSystemId] = useState<string | null>(null);
  const [seriesId, setSeriesId] = useState("general");
  const [openId, setOpenId] = useState<string | null>(null);

  const dashboard = usePreviewDashboard(tab === "substance" ? substanceId : null);
  const live = dashboard.mode === "live";

  useEffect(() => {
    if (dashboard.loading || dashboard.error) return;
    if (dashboard.substances.length === 0) {
      setSubstanceId(null);
      return;
    }
    if (!substanceId || !dashboard.substances.some((item) => item.id === substanceId)) {
      setSubstanceId(dashboard.substances[0]?.id ?? null);
    }
  }, [dashboard.error, dashboard.loading, dashboard.substances, substanceId]);

  useEffect(() => {
    if (dashboard.loading || dashboard.error) return;
    if (dashboard.systems.length === 0) {
      setSystemId(null);
      return;
    }
    if (!systemId || !dashboard.systems.some((item) => item.id === systemId)) {
      setSystemId(dashboard.systems[0]?.id ?? null);
    }
  }, [dashboard.error, dashboard.loading, dashboard.systems, systemId]);

  useEffect(() => {
    if (seriesId === "general") return;
    if (!dashboard.chart.series.some((item) => item.id === seriesId)) {
      setSeriesId("general");
    }
  }, [dashboard.chart.series, seriesId]);

  const substance =
    dashboard.substances.find((item) => item.id === substanceId) ??
    dashboard.substances[0] ??
    null;
  const system =
    dashboard.systems.find((item) => item.id === systemId) ??
    dashboard.systems[0] ??
    null;
  const openChange = dashboard.changes.find((item) => item.id === openId);

  const visibleChanges = useMemo(() => {
    if (live) {
      if (tab === "system" && system) {
        return dashboard.changes.filter(
          (item) => item.icon === system.icon || item.system === system.name,
        );
      }
      return dashboard.changes;
    }

    if (tab === "substance" && substance) {
      return dashboard.changes.filter((item) => changeSubstance[item.id] === substance.id);
    }
    if (tab === "system" && system) {
      return dashboard.changes.filter((item) => item.icon === system.icon);
    }
    return dashboard.changes;
  }, [dashboard.changes, live, substance, system, tab]);

  if (dashboard.loading) {
    return (
      <div className="rounded-2xl border border-soma-line bg-soma-surface px-4 py-10 text-sm text-soma-ink-secondary">
        Cargando tu recuperación…
      </div>
    );
  }

  if (dashboard.error) {
    return (
      <div className="rounded-2xl border border-soma-line bg-soma-surface px-4 py-6 text-sm text-soma-ink-secondary">
        <p>No se han podido cargar tus datos.</p>
        <button
          type="button"
          onClick={dashboard.reload}
          className={`${previewFocus} mt-3 text-soma-action hover:text-soma-action-hover`}
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (live && dashboard.emptyUsages) {
    return (
      <div className="flex flex-col gap-4 pb-6">
        <PageHeading
          eyebrow="Mi recuperación"
          title="Tu progreso en detalle."
          description="Cuando registres sustancias en tu perfil, verás aquí las estimaciones del catálogo Soma."
          demo={false}
        />
        <p className="rounded-2xl border border-dashed border-soma-line px-4 py-6 text-sm text-soma-ink-muted">
          Todavía no hay sustancias en tu perfil.
        </p>
        <Link
          to="/onboarding"
          className={`${previewFocus} text-sm text-soma-action hover:text-soma-action-hover`}
        >
          Ir al onboarding
        </Link>
      </div>
    );
  }

  if (!substance) return null;

  const showChart =
    tab === "general" ||
    (tab === "system" &&
      system &&
      (live
        ? dashboard.chart.series.some((item) => item.id === system.id)
        : Boolean(chartSeriesForSystem[system.id]))) ||
    (tab === "substance" && live && dashboard.chart.series.length > 0);

  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeading
        eyebrow="Mi recuperación"
        title="Tu progreso en detalle."
        description={
          live
            ? "Estimaciones orientativas a partir de tu perfil y de las curvas del catálogo Soma. No son mediciones clínicas."
            : "Misma colección ficticia que en Inicio: tres sustancias, seis sistemas y tres hitos. Las pestañas solo cambian cómo se agrupan."
        }
        demo={dashboard.showDemoBadge}
        aside={
          <label className="relative">
            <span className="sr-only">
              {live ? "Sustancia" : "Sustancia de demostración"}
            </span>
            <select
              value={substance.id}
              onChange={(event) => setSubstanceId(event.target.value)}
              className={`${previewFocus} appearance-none rounded-xl border border-soma-line bg-soma-surface py-2 pl-3 pr-8 text-sm text-soma-ink`}
            >
              {dashboard.substances.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.pillDetail}
                </option>
              ))}
            </select>
          </label>
        }
      />

      <SegmentedControl
        label="Vista de la recuperación"
        value={tab}
        options={recoveryTabs}
        onChange={setTab}
      />

      {tab !== "timeline" ? (
        <ul className="grid gap-2.5 sm:grid-cols-3">
          {dashboard.substances.map((item) => (
            <li key={item.id}>
              <SubstanceCard
                substance={item}
                selected={item.id === substance.id}
                onSelect={setSubstanceId}
              />
            </li>
          ))}
        </ul>
      ) : null}

      {tab === "system" ? (
        dashboard.systems.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-soma-line px-4 py-6 text-sm text-soma-ink-muted">
            No hay sistemas con estimación para tu perfil.
          </p>
        ) : (
          <ul className="flex gap-3 overflow-x-auto pb-1 lg:grid lg:grid-cols-3 lg:overflow-visible xl:grid-cols-6">
            {dashboard.systems.map((item) => (
              <li key={item.id} className="lg:min-w-0">
                <SystemTile
                  system={item}
                  selected={item.id === system?.id}
                  live={live}
                  onSelect={(id) => {
                    setSystemId(id);
                    if (live) {
                      setSeriesId(id);
                    } else {
                      const series = chartSeriesForSystem[id];
                      if (series) setSeriesId(series);
                    }
                  }}
                />
              </li>
            ))}
          </ul>
        )
      ) : null}

      {showChart ? (
        <EvolutionChart
          seriesId={seriesId}
          onSeries={setSeriesId}
          chart={dashboard.chart}
          live={live}
        />
      ) : null}

      {tab === "system" && system && !live && !chartSeriesForSystem[system.id] ? (
        <p className="rounded-2xl border border-soma-line bg-soma-surface px-4 py-3 text-sm text-soma-ink-secondary">
          {system.name} tiene cifra en Inicio ({system.endLabel}) y no tiene serie propia en la
          gráfica de demostración.
        </p>
      ) : null}

      {tab === "substance" && !live ? (
        <p className="rounded-2xl border border-soma-line bg-soma-surface px-4 py-3 text-sm text-soma-ink-secondary">
          {substance.name}: {substance.phase}. La gráfica de Inicio no se parte por sustancia, así
          que esta pestaña no inventa otra curva.
        </p>
      ) : null}

      {tab === "substance" && live ? (
        <p className="rounded-2xl border border-soma-line bg-soma-surface px-4 py-3 text-sm text-soma-ink-secondary">
          {substance.name}: {substance.phase}. La gráfica superior usa solo las curvas del catálogo
          asociadas a esta sustancia.
        </p>
      ) : null}

      <section>
        <h2 className="text-base font-semibold text-soma-ink">
          {tab === "timeline" ? "Cronología" : live ? "Órganos estimados" : "Hitos recientes"}
        </h2>
        <p className="mt-0.5 text-xs text-soma-ink-muted">
          {live
            ? "Avance estimado por órgano a partir de tu perfil y del catálogo Soma."
            : "Los tres textos de Cambios recientes, en el orden del dashboard."}
        </p>
        {visibleChanges.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-soma-line px-4 py-6 text-sm text-soma-ink-muted">
            {live
              ? "No hay órganos con estimación para esta selección."
              : "Ningún hito de demostración está asociado a esta selección."}
          </p>
        ) : (
          <ul className={`mt-3 grid gap-2.5 ${tab === "timeline" ? "" : "lg:grid-cols-3"}`}>
            {visibleChanges.map((change) => (
              <li key={change.id}>
                {tab === "timeline" ? (
                  <button
                    type="button"
                    onClick={() => setOpenId(change.id)}
                    className={`${previewFocus} flex w-full flex-col gap-1 rounded-2xl border border-soma-line bg-soma-surface px-4 py-3 text-left`}
                  >
                    <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-soma-action">
                      {live ? change.status : (demoMoments[change.id] ?? change.status)}
                    </span>
                    <span className="text-sm font-semibold text-soma-ink">{change.title}</span>
                    <span className="text-xs text-soma-ink-secondary">{change.system}</span>
                  </button>
                ) : (
                  <RecentChangeCard
                    change={change}
                    live={live}
                    onOpen={() => setOpenId(change.id)}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {openChange ? (
        <DetailSheet title={openChange.title} onClose={() => setOpenId(null)}>
          <p>{openChange.system}</p>
          <p className="mt-2">{openChange.body}</p>
          <p className="mt-2 text-soma-ink">
            {live ? "Estimación orientativa" : "Estimación de demostración"} {openChange.endLabel}
            {!live && demoMoments[openChange.id] ? ` · ${demoMoments[openChange.id]}` : ""}
          </p>
        </DetailSheet>
      ) : null}
    </div>
  );
}
