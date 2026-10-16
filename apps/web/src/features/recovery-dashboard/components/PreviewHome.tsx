import { useState } from "react";
import {
  demoChanges,
  demoSubstances,
  demoSystems,
} from "../demo-data.js";
import { previewFocus } from "../focus.js";
import { AbstinencePill } from "./AbstinencePill.js";
import { DemoNotice } from "./DemoNotice.js";
import { EvolutionChart } from "./EvolutionChart.js";
import { HeroFigure } from "./HeroFigure.js";
import { HeroFilaments } from "./HeroFilaments.js";
import { RecentChangeCard } from "./RecentChangeCard.js";
import { SubstanceCard } from "./SubstanceCard.js";
import { SubstanceChip } from "./SubstanceChip.js";
import { SystemTile } from "./SystemTile.js";

const featuredChange = demoChanges[0];

export function PreviewHome() {
  const [substanceId, setSubstanceId] = useState(demoSubstances[0]?.id ?? "");
  const [seriesId, setSeriesId] = useState("general");
  const selected =
    demoSubstances.find((item) => item.id === substanceId) ?? demoSubstances[0];

  if (!selected || !featuredChange) return null;

  return (
    <div className="relative flex flex-col gap-4 lg:gap-2 xl:grid xl:grid-cols-1 xl:grid-rows-[auto_auto_auto_auto] xl:content-start xl:gap-2">
      <HeroFilaments />
      <HeroFigure className="md:h-[22rem] md:w-[18rem] lg:h-[26rem] lg:w-[21.5rem] xl:h-[28rem] xl:w-[23rem]" />
      <header className="relative z-10">
        <div className="md:pr-[19rem] lg:pr-[22.5rem] xl:pr-[24rem]">
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 truncate text-[11px] font-medium uppercase tracking-[0.22em] text-soma-action">
              Recovery intelligence
            </p>
            <span className="flex shrink-0 items-center gap-2">
              <DemoNotice />
              <AbstinencePill
                label={selected.pillDetail}
                className="hidden sm:inline-flex"
              />
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight text-soma-ink sm:text-4xl lg:text-3xl">
            <span className="block">Tu cuerpo cambia.</span>
            <span className="block text-soma-action">Comprende cómo.</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-soma-ink-secondary lg:mt-1 lg:max-w-none lg:text-[13px] lg:leading-snug">
            Un espacio personal para seguir tu recuperación, explorar los
            procesos que ocurren en tu organismo y reconocer cada avance.
          </p>
          <AbstinencePill
            label={selected.pillDetail}
            className="mt-4 w-full justify-between sm:hidden"
          />
          <ul className="mt-4 flex gap-2 lg:hidden">
            {demoSubstances.map((substance) => (
              <li key={substance.id}>
                <SubstanceChip
                  substance={substance}
                  selected={substance.id === selected.id}
                  onSelect={setSubstanceId}
                />
              </li>
            ))}
          </ul>
          <ul className="mt-3 hidden gap-2.5 lg:grid lg:grid-cols-3">
            {demoSubstances.map((substance) => (
              <li key={substance.id}>
                <SubstanceCard
                  substance={substance}
                  selected={substance.id === selected.id}
                  onSelect={setSubstanceId}
                />
              </li>
            ))}
          </ul>
        </div>
      </header>

      <div className="relative z-10 overflow-x-clip">
        <EvolutionChart seriesId={seriesId} onSeries={setSeriesId} />
      </div>

      <section className="hidden lg:block">
        <h2 className="text-base font-semibold text-soma-ink">Cambios recientes</h2>
        <p className="mt-0.5 text-xs text-soma-ink-muted">
          Procesos destacados que están ocurriendo en tu organismo en esta fase.
        </p>
        <ul className="mt-2 grid gap-2.5 lg:grid-cols-3">
          {demoChanges.map((change) => (
            <li key={change.id}>
              <RecentChangeCard change={change} />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-soma-ink lg:text-base">
              Sistemas principales
            </h2>
            <p className="mt-0.5 hidden text-xs text-soma-ink-muted lg:block">
              Explora la evolución estimada por sistemas y órganos.
            </p>
          </div>
          <button
            type="button"
            className={`${previewFocus} shrink-0 text-sm text-soma-action hover:text-soma-action-hover`}
          >
            Ver todos
          </button>
        </div>
        <ul className="mt-4 flex gap-3 overflow-x-auto pb-1 lg:mt-2 lg:grid lg:grid-cols-3 lg:gap-2.5 lg:overflow-visible xl:grid-cols-6">
          {demoSystems.map((system) => (
            <li key={system.id} className="lg:min-w-0">
              <SystemTile system={system} />
            </li>
          ))}
        </ul>
      </section>

      <section className="lg:hidden">
        <h2 className="text-lg font-semibold text-soma-ink">Cambio destacado hoy</h2>
        <div className="mt-3">
          <RecentChangeCard change={featuredChange} featured />
        </div>
      </section>
    </div>
  );
}
