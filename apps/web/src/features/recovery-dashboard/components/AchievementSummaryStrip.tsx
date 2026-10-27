import { BarChart3, Medal, Trophy } from "lucide-react";

interface SummaryCard {
  id: string;
  label: string;
  value: string;
  hint?: string;
  percent?: number;
  icon: "catalog" | "unlocked" | "progress";
}

const icons = {
  catalog: Trophy,
  unlocked: Medal,
  progress: BarChart3,
} as const;

export function AchievementSummaryStrip({ cards }: { cards: readonly SummaryCard[] }) {
  return (
    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {cards.map((card) => {
        const Icon = icons[card.icon];
        return (
          <div
            key={card.id}
            className="flex min-w-0 items-center gap-3 rounded-2xl border border-soma-line bg-soma-surface px-4 py-3"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-soma-raised text-soma-action">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-soma-ink-muted">
                {card.label}
              </dt>
              <dd className="mt-0.5 flex items-baseline gap-2">
                <span className="text-2xl font-semibold tabular-nums text-soma-ink">{card.value}</span>
                {card.percent != null ? (
                  <span className="text-xs tabular-nums text-soma-ink-muted">{card.percent}%</span>
                ) : null}
              </dd>
              {card.hint ? (
                <p className="mt-0.5 text-[11px] leading-snug text-soma-ink-secondary">{card.hint}</p>
              ) : null}
              {card.percent != null ? (
                <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-soma-line">
                  <span
                    className="block h-full rounded-full bg-soma-action"
                    style={{ width: `${card.percent}%` }}
                  />
                </span>
              ) : null}
            </div>
          </div>
        );
      })}
    </dl>
  );
}
