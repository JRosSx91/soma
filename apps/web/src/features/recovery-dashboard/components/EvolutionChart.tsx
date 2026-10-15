import { demoAxisLabels, demoSeries, demoTodayLabel, demoTodayPosition } from "../demo-data.js";
import { previewFocus } from "../focus.js";

interface EvolutionChartProps {
  seriesId: string;
  onSeries: (id: string) => void;
}

interface PlotGeometry {
  width: number;
  height: number;
  pad: { l: number; r: number; t: number; b: number };
}

/** Mobile plot: tall enough for the stacked legend without a fixed card height. */
const MOBILE_PLOT: PlotGeometry = {
  width: 640,
  height: 250,
  pad: { l: 40, r: 8, t: 28, b: 28 },
};

/** Wide laptop plot. Same samples, viewBox matched to a 180px frame. */
const DESKTOP_PLOT: PlotGeometry = {
  width: 640,
  height: 132,
  pad: { l: 36, r: 10, t: 26, b: 20 },
};

/** Short desktop plot. Fills the 1120px card without stretching the curves. */
const XL_PLOT: PlotGeometry = {
  width: 640,
  height: 120,
  pad: { l: 36, r: 12, t: 26, b: 18 },
};

function smoothPath(samples: readonly number[], plot: PlotGeometry): string {
  const { width, height, pad } = plot;
  const innerW = width - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;
  const points = samples.map((value, index) => {
    const x = pad.l + (index / (samples.length - 1)) * innerW;
    const y = pad.t + (1 - value) * innerH;
    return { x, y };
  });
  const first = points[0];
  if (!first) return "";
  let path = `M ${first.x.toFixed(1)} ${first.y.toFixed(1)}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index];
    const end = points[index + 1];
    if (!start || !end) continue;
    const mid = (start.x + end.x) / 2;
    path += ` C ${mid.toFixed(1)} ${start.y.toFixed(1)}, ${mid.toFixed(1)} ${end.y.toFixed(1)}, ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
  }
  return path;
}

function gridY(fraction: number, plot: PlotGeometry): number {
  const innerH = plot.height - plot.pad.t - plot.pad.b;
  return plot.pad.t + (1 - fraction) * innerH;
}

function ChartPlot({
  plot,
  seriesId,
  className,
}: {
  plot: PlotGeometry;
  seriesId: string;
  className: string;
}) {
  const { width, height, pad } = plot;
  const innerW = width - pad.l - pad.r;
  const todayX = pad.l + demoTodayPosition * innerW;
  const ticks = [1, 0.75, 0.5, 0.25, 0];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
    >
      {ticks.map((tick) => (
        <g key={tick}>
          <line
            x1={pad.l}
            x2={width - pad.r}
            y1={gridY(tick, plot)}
            y2={gridY(tick, plot)}
            stroke="rgb(var(--soma-line))"
            strokeWidth="1"
          />
          <text
            x={pad.l - 8}
            y={gridY(tick, plot) + 3}
            textAnchor="end"
            fill="rgb(var(--soma-ink-muted))"
            fontSize="11"
          >
            {Math.round(tick * 100)}%
          </text>
        </g>
      ))}
      {demoAxisLabels.map((label, index) => {
        const x = pad.l + (index / (demoAxisLabels.length - 1)) * innerW;
        return (
          <text
            key={label}
            x={x}
            y={height - 6}
            textAnchor="middle"
            fill="rgb(var(--soma-ink-muted))"
            fontSize="11"
          >
            {label}
          </text>
        );
      })}
      <line
        x1={todayX}
        x2={todayX}
        y1={pad.t}
        y2={height - pad.b}
        stroke="rgb(var(--soma-ink-muted))"
        strokeDasharray="3 4"
      />
      <g transform={`translate(${todayX}, 4)`}>
        <rect
          x="-46"
          y="0"
          width="92"
          height="18"
          rx="9"
          fill="rgb(var(--soma-canvas))"
          stroke="rgb(var(--soma-line))"
        />
        <text
          x="0"
          y="13"
          textAnchor="middle"
          fill="rgb(var(--soma-ink))"
          fontSize="10"
        >
          {demoTodayLabel}
        </text>
      </g>
      {demoSeries.map((series) => {
        const dimmed = seriesId !== "general" && seriesId !== series.id;
        return (
          <path
            key={series.id}
            d={smoothPath(series.samples, plot)}
            fill="none"
            strokeWidth={dimmed ? 1.5 : 2.4}
            strokeLinecap="round"
            style={{
              stroke: series.color,
              opacity: dimmed ? 0.2 : 0.95,
            }}
          />
        );
      })}
    </svg>
  );
}

/**
 * Demonstration chart. Samples come from demo-data, not from computeRecovery.
 */
export function EvolutionChart({ seriesId, onSeries }: EvolutionChartProps) {
  return (
    <section className="rounded-2xl border border-soma-line bg-soma-surface p-4 shadow-[0_12px_32px_rgb(4_10_16/0.28)] sm:p-5 lg:px-3 lg:py-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-soma-ink sm:text-lg lg:text-base">
            Evolución estimada
          </h2>
          <p className="mt-1 text-xs text-soma-ink-muted sm:text-sm lg:mt-0.5 lg:text-xs">
            Progreso general de los principales sistemas afectados
          </p>
        </div>
        <label className="relative shrink-0">
          <span className="sr-only">Serie de la gráfica de demostración</span>
          <select
            value={seriesId}
            onChange={(event) => onSeries(event.target.value)}
            className={`${previewFocus} appearance-none rounded-lg border border-soma-line bg-soma-canvas py-1.5 pl-3 pr-8 text-xs text-soma-ink`}
          >
            <option value="general">Vista general</option>
            {demoSeries.map((series) => (
              <option key={series.id} value={series.id}>
                {series.label}
              </option>
            ))}
          </select>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-soma-ink-muted"
          >
            ▾
          </span>
        </label>
      </div>

      <div className="mt-4 flex flex-col gap-4 lg:mt-1 lg:flex-row lg:items-center lg:gap-3">
        <div className="min-w-0 flex-1">
          <ChartPlot
            plot={MOBILE_PLOT}
            seriesId={seriesId}
            className="h-52 w-full sm:h-60 lg:hidden"
          />
          <ChartPlot
            plot={DESKTOP_PLOT}
            seriesId={seriesId}
            className="hidden h-[11.25rem] w-full lg:block xl:hidden"
          />
          <ChartPlot
            plot={XL_PLOT}
            seriesId={seriesId}
            className="hidden h-[10.25rem] w-full xl:block"
          />
          <p className="mt-2 text-[11px] text-soma-ink-muted lg:mt-0.5">
            Valores de demostración. El eje repite la composición del mockup y no es una escala clínica.
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:w-52 lg:shrink-0 lg:flex-col lg:justify-center lg:gap-1">
          {demoSeries.map((series) => {
            const dimmed = seriesId !== "general" && seriesId !== series.id;
            return (
              <li
                key={series.id}
                className={`flex items-center gap-2 text-xs ${dimmed ? "opacity-40" : ""}`}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: series.color }}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1 text-soma-ink-secondary">
                  {series.label}
                </span>
                <span className="font-medium tabular-nums text-soma-ink">
                  {series.endLabel}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="sr-only" style={{ contain: "strict" }}>
      <table>
        <caption>
          Estimaciones de demostración, no mediciones. Cada fila es una serie visual del mockup.
        </caption>
        <thead>
          <tr>
            <th scope="col">Serie</th>
            {demoAxisLabels.map((label) => (
              <th key={label} scope="col">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {demoSeries.map((series) => (
            <tr key={series.id}>
              <th scope="row">{series.label}</th>
              {series.samples.map((sample, index) => (
                <td key={demoAxisLabels[index]}>{Math.round(sample * 100)}%</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </section>
  );
}
