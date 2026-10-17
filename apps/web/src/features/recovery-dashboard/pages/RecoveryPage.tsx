import { useMemo, useState } from "react";
import {
  demoChanges,
  demoSubstances,
  demoSystems,
} from "../demo-data.js";
import {
  changeSubstance,
  chartSeriesForSystem,
  demoMoments,
  recoveryTabs,
  type RecoveryTab,
} from "../pages-data.js";
import { previewFocus } from "../focus.js";
import { DetailSheet } from "../components/DetailSheet.js";
import { EvolutionChart } from "../components/EvolutionChart.js";
import { PageHeading } from "../components/PageHeading.js";
import { RecentChangeCard } from "../components/RecentChangeCard.js";
import { SegmentedControl } from "../components/SegmentedControl.js";
import { SubstanceCard } from "../components/SubstanceCard.js";
import { SystemTile } from "../components/SystemTile.js";

export function RecoveryPage() {
  const [tab, setTab] = useState<RecoveryTab>("general");
  const [substanceId, setSubstanceId] = useState(demoSubstances[0]?.id ?? "");
  const [systemId, setSystemId] = useState(demoSystems[0]?.id ?? "");
  const [seriesId, setSeriesId] = useState("general");
  const [openId, setOpenId] = useState<string | null>(null);

  const substance = demoSubstances.find((item) => item.id === substanceId) ?? demoSubstances[0];
  const system = demoSystems.find((item) => item.id === systemId) ?? demoSystems[0];
  const openChange = demoChanges.find((item) => item.id === openId);

  const visibleChanges = useMemo(() => {
    if (tab === "substance" && substance) {
      return demoChanges.filter((item) => changeSubstance[item.id] === substance.id);
    }
    if (tab === "system" && system) {
      return demoChanges.filter((item) => item.icon === system.icon);
    }
    return demoChanges;
  }, [substance, system, tab]);

  if (!substance || !system) return null;

  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeading
        eyebrow="Mi recuperación"
        title="Tu progreso en detalle."
        description="Misma colección ficticia que en Inicio: tres sustancias, seis sistemas y tres hitos. Las pestañas solo cambian cómo se agrupan."
        aside={
          <label className="relative">
            <span className="sr-only">Sustancia de demostración</span>
            <select
              value={substance.id}
              onChange={(event) => setSubstanceId(event.target.value)}
              className={`${previewFocus} appearance-none rounded-xl border border-soma-line bg-soma-surface py-2 pl-3 pr-8 text-sm text-soma-ink`}
            >
              {demoSubstances.map((item) => (
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
          {demoSubstances.map((item) => (
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
        <ul className="flex gap-3 overflow-x-auto pb-1 lg:grid lg:grid-cols-3 lg:overflow-visible xl:grid-cols-6">
          {demoSystems.map((item) => (
            <li key={item.id} className="lg:min-w-0">
              <SystemTile
                system={item}
                selected={item.id === system.id}
                onSelect={(id) => {
                  setSystemId(id);
                  const series = chartSeriesForSystem[id];
                  if (series) setSeriesId(series);
                }}
              />
            </li>
          ))}
        </ul>
      ) : null}

      {tab === "general" || (tab === "system" && chartSeriesForSystem[system.id]) ? (
        <EvolutionChart seriesId={seriesId} onSeries={setSeriesId} />
      ) : null}

      {tab === "system" && !chartSeriesForSystem[system.id] ? (
        <p className="rounded-2xl border border-soma-line bg-soma-surface px-4 py-3 text-sm text-soma-ink-secondary">
          {system.name} tiene cifra en Inicio ({system.endLabel}) y no tiene serie propia en la gráfica de demostración.
        </p>
      ) : null}

      {tab === "substance" ? (
        <p className="rounded-2xl border border-soma-line bg-soma-surface px-4 py-3 text-sm text-soma-ink-secondary">
          {substance.name}: {substance.phase}. La gráfica de Inicio no se parte por sustancia, así que esta pestaña no inventa otra curva.
        </p>
      ) : null}

      <section>
        <h2 className="text-base font-semibold text-soma-ink">
          {tab === "timeline" ? "Cronología" : "Hitos recientes"}
        </h2>
        <p className="mt-0.5 text-xs text-soma-ink-muted">
          Los tres textos de Cambios recientes, en el orden del dashboard.
        </p>
        {visibleChanges.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-soma-line px-4 py-6 text-sm text-soma-ink-muted">
            Ningún hito de demostración está asociado a esta selección.
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
                      {demoMoments[change.id]}
                    </span>
                    <span className="text-sm font-semibold text-soma-ink">{change.title}</span>
                    <span className="text-xs text-soma-ink-secondary">{change.system}</span>
                  </button>
                ) : (
                  <RecentChangeCard change={change} onOpen={() => setOpenId(change.id)} />
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
            Estimación de demostración {openChange.endLabel}
            {demoMoments[openChange.id] ? ` · ${demoMoments[openChange.id]}` : ""}
          </p>
        </DetailSheet>
      ) : null}
    </div>
  );
}
