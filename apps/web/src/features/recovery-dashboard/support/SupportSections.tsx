import {
  ArrowRight,
  BookOpen,
  BookOpenText,
  Brain,
  CalendarHeart,
  ChevronRight,
  Clock,
  Compass,
  Layers,
  LifeBuoy,
  Sprout,
  Target,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useShellBase } from "../context/ShellBaseContext.js";
import { previewFocus } from "../focus.js";
import { BreathingTool } from "./BreathingTool.js";
import { SupportIllustration } from "./SupportIllustration.js";
import {
  SUPPORT_AVAILABLE_TOOL,
  SUPPORT_STRATEGY_TOPICS,
  SUPPORT_TERMS_EMERGENCY_HREF,
  SUPPORT_TOOLS,
  supportExploreHref,
  supportResourceGroups,
  type SupportStrategyTopic,
} from "./support-links.js";
import { supportResourceIllustrations, supportToolIllustrations } from "./support-visuals.js";

const panelClass =
  "min-w-0 rounded-2xl border border-soma-line bg-soma-surface/90 p-4 sm:p-5";
const accentColor = { color: "rgb(var(--soma-shell-accent))" };
const plannedPillClass =
  "inline-flex items-center gap-1.5 rounded-full border border-dashed border-soma-line-strong px-2.5 py-1 text-xs font-medium text-soma-ink-secondary";

const strategyIcons: Record<SupportStrategyTopic, LucideIcon> = {
  emotions: Brain,
  relapse: Layers,
  stress: Target,
  habits: Sprout,
};

const planParts = [
  { id: "resources", icon: BookOpen },
  { id: "strategies", icon: Compass },
  { id: "habits", icon: Sprout },
] as const;

/** Content below the hero, laid out after `apoyo-2.0`. Card art is SUP-ASSET-01; only breathing is interactive. */
export function SupportSections() {
  const { t } = useTranslation(["support", "explore-edu"]);
  const base = useShellBase();
  const resourceGroups = supportResourceGroups(base);

  return (
    <>
      <section className="min-w-0" aria-labelledby="support-tools-title">
        <h2 id="support-tools-title" className="text-lg font-semibold text-soma-ink">
          {t("support:tools.title")}
        </h2>
        <p className="mt-1 text-sm text-soma-ink-secondary">{t("support:tools.subtitle")}</p>

        <ul className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {SUPPORT_TOOLS.map((tool) => {
            if (tool === SUPPORT_AVAILABLE_TOOL) return <BreathingTool key={tool} />;
            return (
              <li
                key={tool}
                data-tool={tool}
                className="flex min-w-0 items-start gap-3 overflow-hidden rounded-2xl border border-soma-line bg-soma-surface/90 p-3 sm:flex-col sm:items-stretch sm:p-0"
              >
                <div className="relative aspect-[3/2] w-28 shrink-0 overflow-hidden rounded-xl sm:aspect-[8/5] sm:w-full sm:rounded-none sm:border-b sm:border-soma-line">
                  <SupportIllustration name={supportToolIllustrations[tool]} loading="eager" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col sm:px-4 sm:pb-4">
                  <h3 className="text-base font-semibold leading-snug text-soma-ink">
                    {t(`support:tools.${tool}.title`)}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-soma-ink-secondary">
                    {t(`support:tools.${tool}.body`)}
                  </p>
                  <p className="mt-auto pt-3 text-xs text-soma-ink-muted">
                    <span className={plannedPillClass}>{t("support:tools.status.planned")}</span>
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section className={panelClass} aria-labelledby="support-learn-title">
          <div className="flex flex-wrap items-start justify-between gap-x-4">
            <h2 id="support-learn-title" className="pt-2.5 text-lg font-semibold text-soma-ink">
              {t("support:learn.title")}
            </h2>
            <Link
              to={supportExploreHref(base)}
              className={`${previewFocus} inline-flex min-h-11 items-center gap-1 rounded-lg text-sm font-medium text-soma-action hover:text-soma-action-hover`}
            >
              {t("support:learn.viewAll")}
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <p className="text-sm leading-relaxed text-soma-ink-secondary">
            {t("support:learn.subtitle")}
          </p>
          <ul className="mt-4 grid min-w-0 gap-3 sm:grid-cols-3">
            {resourceGroups.map((group) => {
              const empty = group.links.length === 0;
              return (
                <li
                  key={group.id}
                  data-resource-group={group.id}
                  className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-soma-line bg-soma-raised/30"
                >
                  <div className="flex items-start gap-3 p-3 sm:flex-col sm:items-stretch sm:gap-0 sm:p-0">
                    <div className="relative aspect-[3/2] w-24 shrink-0 overflow-hidden rounded-lg sm:aspect-[8/5] sm:w-full sm:rounded-none">
                      <SupportIllustration name={supportResourceIllustrations[group.id]} />
                    </div>
                    <div className="min-w-0 sm:px-3 sm:pt-3">
                      <h3 className="text-sm font-semibold leading-snug text-soma-ink">
                        {t(`support:learn.groups.${group.id}.title`)}
                      </h3>
                      <p className="mt-0.5 text-xs leading-relaxed text-soma-ink-muted">
                        {t(`support:learn.groups.${group.id}.caption`)}
                      </p>
                    </div>
                  </div>
                  {empty ? (
                    <p className="px-3 pb-3 sm:pt-2">
                      <span className={plannedPillClass}>{t("support:learn.unavailable")}</span>
                    </p>
                  ) : (
                    <ul className="flex min-w-0 flex-col gap-1 px-2 pb-2 sm:pt-1">
                      {group.links.map((item) => (
                        <li key={item.id} className="min-w-0">
                          <Link
                            to={item.href}
                            className={`${previewFocus} flex min-h-11 min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 text-sm leading-snug text-soma-ink motion-safe:transition-colors motion-reduce:transition-none hover:bg-soma-raised/70 sm:max-xl:gap-1.5 xl:text-[13px]`}
                          >
                            <BookOpenText className="h-4 w-4 shrink-0 sm:hidden" style={accentColor} aria-hidden="true" />
                            <span className="min-w-0 flex-1">{t(item.titleKey)}</span>
                            <ChevronRight className="h-4 w-4 shrink-0 text-soma-ink-muted" aria-hidden="true" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <section className={`${panelClass} flex flex-col`} aria-labelledby="support-strategies-title">
          <h2 id="support-strategies-title" className="text-lg font-semibold text-soma-ink">
            {t("support:strategies.title")}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-soma-ink-secondary">
            {t("support:strategies.subtitle")}
          </p>
          <ul className="mt-4 grid min-w-0 flex-1 auto-rows-fr gap-2 xl:max-h-80">
            {SUPPORT_STRATEGY_TOPICS.map((topic) => {
              const Icon = strategyIcons[topic];
              return (
                <li
                  key={topic}
                  data-strategy={topic}
                  className="flex min-h-12 min-w-0 items-center gap-3 rounded-xl border border-soma-line bg-soma-raised/30 px-3 py-2"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-soma-shell-accent/10">
                    <Icon className="h-4 w-4" style={accentColor} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-soma-ink">
                    {t(`support:strategies.topics.${topic}`)}
                  </span>
                  <span className="shrink-0 text-xs text-soma-ink-muted">
                    {t("support:strategies.status")}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <section
          className="min-w-0 rounded-2xl border border-rose-300/30 p-4 sm:p-5"
          style={{
            background:
              "linear-gradient(160deg, rgb(244 63 94 / 0.13) 0%, rgb(var(--soma-surface) / 0.92) 60%)",
          }}
          aria-labelledby="support-help-title"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-400/15">
              <LifeBuoy className="h-5 w-5 text-rose-200" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 id="support-help-title" className="text-lg font-semibold leading-snug text-soma-ink">
                {t("support:help.title")}
              </h2>
              <p className="mt-0.5 text-sm text-soma-ink-secondary">{t("support:help.subtitle")}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-soma-ink-secondary">
            <p className="font-medium text-soma-ink">{t("support:help.educational")}</p>
            <p>{t("support:help.emergency")}</p>
            <p>{t("support:help.professional")}</p>
          </div>
          <Link
            to={SUPPORT_TERMS_EMERGENCY_HREF}
            className={`${previewFocus} mt-4 flex min-h-11 items-center justify-between gap-3 rounded-xl border border-rose-300/40 bg-rose-400/10 px-4 py-2.5 text-sm font-medium text-rose-100 motion-safe:transition-colors motion-reduce:transition-none hover:bg-rose-400/20`}
          >
            <span className="min-w-0">{t("support:help.termsLink")}</span>
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </Link>
        </section>

        <section className={panelClass} aria-labelledby="support-plan-title">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-soma-shell-accent/10">
              <CalendarHeart className="h-5 w-5" style={accentColor} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 id="support-plan-title" className="text-lg font-semibold leading-snug text-soma-ink">
                {t("support:plan.title")}
              </h2>
              <p className="mt-0.5 text-sm leading-relaxed text-soma-ink-secondary">
                {t("support:plan.body")}
              </p>
            </div>
          </div>
          <ul className="mt-5 grid grid-cols-3 gap-2">
            {planParts.map(({ id, icon: Icon }) => (
              <li key={id} className="flex min-w-0 flex-col items-center gap-2 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-dashed border-soma-line-strong">
                  <Icon className="h-5 w-5 text-soma-ink-muted" aria-hidden="true" />
                </span>
                <span className="text-xs leading-snug text-soma-ink-secondary">
                  {t(`support:plan.parts.${id}`)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-soma-ink-muted">
            <span className={plannedPillClass}>
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {t("support:plan.status")}
            </span>
            <span>{t("support:plan.statusHint")}</span>
          </p>
        </section>
      </div>
    </>
  );
}
