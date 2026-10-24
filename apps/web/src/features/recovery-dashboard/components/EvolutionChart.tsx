import { useTranslation } from "react-i18next";
import type { DemoSeries } from "../demo-data.js";
import { previewFocus } from "../focus.js";
import type { DashboardChartView } from "../hooks/usePreviewDashboard.js";
import { formatTrajectoryPercent } from "../dashboard/recovery-semantics.js";

interface EvolutionChartProps {
  seriesId: string;
  onSeries: (id: string) => void;
  chart: DashboardChartView;
  /** When true, screen-reader copy avoids the demo disclaimer. */
  live?: boolean;
}

interface PlotGeometry {
  width: number;
  height: number;
  pad: { l: number; r: number; t: number; b: number };
}

/**
 * Mobile plot. Padding is visual only; samples stay on the same 0–1 mapping.
 * Height follows the viewBox so the CSS box does not letterbox empty space
 * below the X-axis.
 */
const MOBILE_PLOT: PlotGeometry = {
  width: 640,
  height: 360,
  pad: { l: 36, r: 6, t: 22, b: 22 },
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
  if (samples.length === 0) return "";
  const points = samples.map((value, index) => {
    const x =
      samples.length === 1
        ? pad.l + innerW / 2
        : pad.l + (index / (samples.length - 1)) * innerW;
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

/** Compact legend figure from the view model. Never uses day 365 when Hoy is shown. */
function compactLegendPercent(item: DemoSeries, showToday: boolean): string {
  if (showToday) {
    const match = item.endLabel.match(/(\d+)\s*%/);
    return match ? `${match[1]} %` : "";
  }
  const yearSample = item.samples[item.samples.length - 1];
  if (typeof yearSample === "number") {
    return formatTrajectoryPercent(yearSample);
  }
  const match = item.referenceAtYearLabel?.match(/(\d+)\s*%/);
  return match ? `${match[1]} %` : "";
}

function gridY(fraction: number, plot: PlotGeometry): number {
  const innerH = plot.height - plot.pad.t - plot.pad.b;
  return plot.pad.t + (1 - fraction) * innerH;
}

function ChartPlot({
  plot,
  seriesId,
  chart,
  className,
}: {
  plot: PlotGeometry;
  seriesId: string;
  chart: DashboardChartView;
  className: string;
}) {
  const { width, height, pad } = plot;
  const innerW = width - pad.l - pad.r;
  const todayX = chart.showToday ? pad.l + chart.todayPosition * innerW : null;
  const ticks = [1, 0.75, 0.5, 0.25, 0];
  const axisLabels = chart.axisLabels;

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
      {axisLabels.map((label, index) => {
        const last = axisLabels.length - 1;
        const x =
          axisLabels.length === 1
            ? pad.l + innerW / 2
            : pad.l + (index / last) * innerW;
        const textAnchor =
          index === 0 ? "start" : index === last ? "end" : "middle";
        return (
          <text
            key={label}
            x={x}
            y={height - 6}
            textAnchor={textAnchor}
            fill="rgb(var(--soma-ink-muted))"
            fontSize="11"
          >
            {label}
          </text>
        );
      })}
      {chart.showToday && todayX != null ? (
        <>
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
              {chart.todayLabel}
            </text>
          </g>
        </>
      ) : null}
      {chart.series.map((series) => {
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
 * Evolution chart. Samples come from the dashboard view model
 * (demo snapshot or live curves via estimateCurve / computeRecovery).
 *
 * Accessible table: Hoy is elapsed-day curve progress; axis columns already
 * include the day-365 checkpoint as “365 days”, so that value is not
 * duplicated as a second day-365 column.
 */
export function EvolutionChart({
  seriesId,
  onSeries,
  chart,
  live = false,
}: EvolutionChartProps) {
  const { t } = useTranslation("recovery");
  const series = chart.series as readonly DemoSeries[];

  return (
    <section
      className="rounded-2xl border border-soma-line bg-soma-surface p-3 shadow-[0_12px_32px_rgb(4_10_16/0.28)] sm:p-5 lg:px-3 lg:py-2"
      aria-describedby="recovery-chart-note"
    >
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-start lg:justify-between lg:gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold leading-snug text-soma-ink sm:text-lg lg:text-base">
            {t("chartTitle")}
          </h2>
          <p className="mt-1 text-xs leading-snug text-soma-ink-muted sm:text-sm lg:mt-0.5 lg:text-xs">
            {t("chartSubtitle")}
          </p>
        </div>
        <label className="relative w-full lg:w-auto lg:shrink-0">
          <span className="sr-only">
            {live ? t("chartSeriesLive") : t("chartSeriesDemo")}
          </span>
          <select
            value={seriesId}
            onChange={(event) => onSeries(event.target.value)}
            className={`${previewFocus} w-full appearance-none rounded-lg border border-soma-line bg-soma-canvas py-1.5 pl-3 pr-8 text-xs text-soma-ink lg:w-auto`}
          >
            <option value="general">{t("chartOverview")}</option>
            {series.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
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

      {series.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-soma-line px-3 py-6 text-sm text-soma-ink-muted">
          {t("chartEmpty")}
        </p>
      ) : (
        <div className="mt-3 flex flex-col gap-2 lg:mt-1 lg:flex-row lg:items-center lg:gap-3">
          <div className="min-w-0 flex-1">
            <p
              id="recovery-chart-yaxis"
              className="mb-0.5 text-[11px] font-medium text-soma-ink-muted"
            >
              {t("chartYAxis")}
            </p>
            <ChartPlot
              plot={MOBILE_PLOT}
              seriesId={seriesId}
              chart={chart}
              className="aspect-[640/360] h-auto w-full lg:hidden"
            />
            <ChartPlot
              plot={DESKTOP_PLOT}
              seriesId={seriesId}
              chart={chart}
              className="hidden h-[11.25rem] w-full lg:block xl:hidden"
            />
            <ChartPlot
              plot={XL_PLOT}
              seriesId={seriesId}
              chart={chart}
              className="hidden h-[10.25rem] w-full xl:block"
            />
          </div>

          <div className="lg:w-52 lg:shrink-0">
            <p className="mb-1.5 text-[10px] leading-snug text-soma-ink-muted lg:hidden">
              {chart.showToday
                ? live
                  ? t("legendTodayHintLive")
                  : t("legendTodayHintDemo")
                : t("legendYearHint")}
            </p>
            <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:flex lg:flex-col lg:justify-center lg:gap-1">
              {series.map((item) => {
                const dimmed = seriesId !== "general" && seriesId !== item.id;
                const compact = compactLegendPercent(item, chart.showToday);
                return (
                  <li
                    key={item.id}
                    className={`flex items-center gap-2 text-xs lg:items-start ${dimmed ? "opacity-40" : ""}`}
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full lg:mt-1.5"
                      style={{ backgroundColor: item.color }}
                      aria-hidden="true"
                    />
                    <span className="flex min-w-0 flex-1 items-baseline justify-between gap-3 lg:block">
                      <span className="min-w-0 truncate text-soma-ink-secondary lg:block">
                        {item.label}
                      </span>
                      {compact ? (
                        <span className="shrink-0 text-xs font-medium tabular-nums text-soma-ink lg:hidden">
                          <span className="sr-only">
                            {chart.showToday
                              ? live
                                ? t("legendTodaySrLive")
                                : t("legendTodaySrDemo")
                              : t("legendYearHint")}
                          </span>
                          {compact}
                        </span>
                      ) : null}
                      {chart.showToday ? (
                        <span className="mt-0.5 hidden text-[10px] font-medium leading-snug tabular-nums text-soma-ink lg:block">
                          <span className="sr-only">
                            {live ? t("legendTodaySrLive") : t("legendTodaySrDemo")}
                          </span>
                          {item.endLabel}
                        </span>
                      ) : null}
                      {item.referenceAtYearLabel ? (
                        <span className="mt-0.5 hidden text-[10px] leading-snug text-soma-ink-muted lg:block">
                          {item.referenceAtYearLabel}
                        </span>
                      ) : null}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      <div className="mt-2.5 space-y-1.5">
        <p
          id="recovery-chart-note"
          className="max-w-2xl text-xs leading-snug text-soma-ink-secondary sm:text-sm lg:text-xs"
        >
          {t("chartCurveNote")}
        </p>
        {series.length > 0 ? (
          <p className="text-[11px] leading-snug text-soma-ink-muted">{chart.footnote}</p>
        ) : null}
      </div>

      {series.length > 0 ? (
        <div className="sr-only" style={{ contain: "strict" }}>
          <table>
            <caption>
              {live
                ? chart.showToday
                  ? t("chartCaptionLive")
                  : t("chartCaptionLiveOverlay")
                : t("chartCaptionDemo")}
            </caption>
            <thead>
              <tr>
                <th scope="col">{t("chartTableSeries")}</th>
                {chart.showToday ? (
                  <th scope="col">{t("chartTableToday")}</th>
                ) : null}
                {chart.axisLabels.map((label) => (
                  <th key={label} scope="col">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {series.map((item) => (
                <tr key={item.id}>
                  <th scope="row">{item.label}</th>
                  {chart.showToday ? <td>{item.endLabel}</td> : null}
                  {item.samples.map((sample, index) => (
                    <td key={chart.axisLabels[index] ?? index}>
                      {formatTrajectoryPercent(sample)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
