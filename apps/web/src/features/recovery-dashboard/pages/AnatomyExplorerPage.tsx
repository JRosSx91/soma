import { useEffect, useRef, useState, type ReactNode } from "react";
import type { TFunction } from "i18next";
import { ChevronRight } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { previewFocus } from "../focus.js";
import { localizedCatalogLabel } from "../explore/explore-search.js";
import {
  exploreSystemCardSources,
  firstEducationalSentence,
} from "../explore/explore-systems.js";
import {
  exploreNeurotransmitterArt,
  exploreProcessArt,
} from "../explore/explore-art.js";
import { exploreEduHref } from "../explore/explore-edu-query.js";
import { AnatomyAtlas2D } from "../anatomy/AnatomyAtlas2D.js";
import {
  anatomyExplorerHrefForOrgan,
  anatomySearchParams,
  resolveAnatomyExplorerSelection,
} from "../anatomy/anatomy-explorer-query.js";
import { relatedContentForSystem } from "../anatomy/atlas-related-content.js";
import { atlasSystems, bodyAtlasView } from "../anatomy/atlas-config.js";
import type { AtlasSystem } from "../anatomy/atlas-types.js";
import {
  narrativePhases,
  resolveEducationalNarrative,
  type NarrativePhase,
} from "../anatomy/narrative-catalog.js";
import {
  educationalEffectsSubstances,
  resolveEducationalSignaling,
  selectEducationalEffectsSubstance,
} from "../anatomy/neurotransmitter-education.js";
import {
  recoverySubstances,
  resolveEducationalRecovery,
  selectRecoverySubstance,
} from "../anatomy/recovery-catalog.js";
import { anatomyOrganEducationCopy } from "../anatomy/present-anatomy-education.js";
import { resolveOrganSheet } from "../anatomy/organ-sheet.js";
import { resolveSystemSheet } from "../anatomy/system-sheet.js";
import { missionCopyPath, missionIllustrationSrc } from "../../missions/missions-view.js";
import { useShellBase } from "../context/ShellBaseContext.js";
import {
  pickDailyMessage,
  readDailyMessages,
} from "../dashboard/home-daily-message.js";
import { CatalogEvidenceNote } from "../components/CatalogEvidenceNote.js";
import {
  OrganSheetSummary,
  SystemSheetSummary,
} from "../components/OrganSheetSummary.js";
import { RecoveryHero } from "../components/RecoveryHero.js";
import { SubstanceIllustration } from "../components/SubstanceIllustration.js";
import { EducationalSignalingCard } from "../components/EducationalSignalingCard.js";
import { AdvicePanel } from "../components/AdvicePanel.js";

const ATLAS_HERO_IMAGE = "/images/decoration/nature-8.png";
const ATLAS_HERO_OVERLAY =
  "linear-gradient(90deg, rgb(var(--soma-shell-rail) / 0.72) 0%, rgb(var(--soma-shell-rail) / 0.28) 40%, transparent 72%)";

const tabs = ["resumen", "efectos", "recuperacion", "consejos"] as const;
type AnatomyTab = (typeof tabs)[number];
const relatedTabs = ["articles", "substances", "missions"] as const;
type RelatedTab = (typeof relatedTabs)[number];

export function AnatomyExplorerPage() {
  const { t } = useTranslation(["anatomy", "organs", "explore", "explore-edu", "missions", "substances"]);
  const base = useShellBase();
  const [searchParams, setSearchParams] = useSearchParams();
  const { systemId, organId } = resolveAnatomyExplorerSelection(
    searchParams.get("system"),
    searchParams.get("organ"),
  );
  const [tab, setTab] = useState<AnatomyTab>("resumen");
  const [substanceId, setSubstanceId] = useState<string | null>(null);
  const [phase, setPhase] = useState<NarrativePhase>("during_use");
  const quote = pickDailyMessage(readDailyMessages(t("quotes", { returnObjects: true })));

  function setSystemId(id: string | null) {
    const next = resolveAnatomyExplorerSelection(id, null);
    setSearchParams(anatomySearchParams(next), { replace: true });
  }

  function setOrganId(id: string | null) {
    const next = resolveAnatomyExplorerSelection(systemId, id);
    setSearchParams(anatomySearchParams(next), { replace: true });
  }

  const system = atlasSystems.find((item) => item.id === systemId) ?? null;
  const organ = system?.organs.find((item) => item.id === organId) ?? null;
  const plate = organ
    ? organ.plate
    : system
      ? system.plates.anterior
      : bodyAtlasView.plates.anterior;
  const fullBodyPlate = !organ && plate?.aspectRatio === "1024 / 1536";
  const regions =
    system?.organs.flatMap((item) => {
      const path = item.regions.anterior;
      return path ? [{ organId: item.id, path }] : [];
    }) ?? [];

  const systemLabel = system ? atlasSystemName(t, system.id, system.name) : t("humanBody");
  const organLabel = organ ? atlasOrganName(t, organ.id, organ.name) : null;
  const unavailableMessage = !system
    ? t("chooseSystem")
    : organ && !organ.plate
      ? t("organNoPlate", { name: organLabel })
      : t("systemNoPlate", { name: systemLabel });
  const related = system ? relatedContentForSystem(system) : null;
  const hasRelated = Boolean(
    related &&
      (related.articles.length > 0 || related.substances.length > 0 || related.missions.length > 0),
  );

  function scrollToOrgans() {
    document.getElementById("atlas-organs")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="flex min-w-0 flex-col gap-4 pb-6">
      <RecoveryHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={`${t("description")} ${t("generalDisclaimer")}`}
        quote={quote}
        demo={base === "/preview"}
        imageSrc={ATLAS_HERO_IMAGE}
        objectPosition="center 48%"
        overlay={ATLAS_HERO_OVERLAY}
        compactBand
      />

      <nav aria-label={t("crumbAria")} className="flex min-w-0 flex-wrap items-center gap-1.5 text-sm">
        <Crumb
          current={system === null}
          onClick={() => {
            setSystemId(null);
            setTab("resumen");
          }}
        >
          {t("humanBody")}
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
              {systemLabel}
            </Crumb>
          </>
        ) : null}
        {organ ? (
          <>
            <span aria-hidden="true" className="text-soma-ink-muted">
              /
            </span>
            <span className="text-soma-ink">{organLabel}</span>
          </>
        ) : null}
      </nav>

      <div className="grid min-w-0 items-start gap-3 lg:grid-cols-[12.25rem_minmax(0,1fr)_20.5rem] xl:grid-cols-[13rem_minmax(0,1fr)_22rem]">
        <ul
          aria-label={t("systemsAria")}
          className="flex max-w-full min-w-0 gap-2 overflow-x-auto overscroll-x-contain pb-1 touch-pan-x [-webkit-overflow-scrolling:touch] lg:max-h-[min(48rem,calc(100svh-11rem))] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:overscroll-contain lg:pr-1 lg:touch-auto"
        >
          {atlasSystems.map((item) => {
            const selected = item.id === system?.id;
            const thumb = systemIconSrc(item);
            return (
              <li key={item.id} className="w-[8.75rem] shrink-0 lg:w-full lg:shrink">
                <button
                  type="button"
                  aria-pressed={selected}
                  aria-current={selected ? "true" : undefined}
                  onClick={() => {
                    setSystemId(item.id);
                    setTab("resumen");
                  }}
                  className={`${previewFocus} flex min-h-11 w-full items-center gap-2 rounded-xl border px-2 py-1.5 text-left text-xs leading-tight lg:min-h-11 ${
                    selected
                      ? "border-soma-action bg-soma-raised/60 text-soma-ink shadow-[inset_0_0_0_1px_rgb(var(--soma-action)/0.35)]"
                      : "border-soma-line bg-soma-surface text-soma-ink-secondary hover:border-soma-line-strong"
                  }`}
                >
                  {thumb ? (
                    <img src={thumb} alt="" className="h-8 w-8 shrink-0 object-contain" />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="h-8 w-8 shrink-0 rounded-lg border border-dashed border-soma-line bg-soma-canvas"
                    />
                  )}
                  <span className="min-w-0 truncate lg:whitespace-normal lg:break-words">
                    {atlasSystemName(t, item.id, item.name)}
                  </span>
                  <ChevronRight
                    aria-hidden="true"
                    className="ml-auto hidden h-3.5 w-3.5 shrink-0 text-soma-ink-muted lg:block"
                  />
                </button>
              </li>
            );
          })}
        </ul>

        <div className="min-w-0">
          {regions.length === 0 ? (
            <p className="sr-only">{t("figureNotInteractive")}</p>
          ) : null}
          <AnatomyAtlas2D
            label={organLabel ?? systemLabel}
            plate={plate}
            unavailableMessage={unavailableMessage}
            regions={regions}
            selectedOrganId={organId}
            fillView={fullBodyPlate}
            onSelectOrgan={setOrganId}
          />
        </div>

        <SystemPanel
          system={system}
          organId={organId}
          tab={tab}
          substanceId={substanceId}
          phase={phase}
          related={related}
          onTab={setTab}
          onSubstance={setSubstanceId}
          onPhase={setPhase}
          onExploreOrgans={scrollToOrgans}
        />
      </div>

      {system ? (
        <div
          id="atlas-lower"
          className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(16.5rem,3fr)]"
        >
          <OrganRail
            system={system}
            organId={organId}
            onOrgan={(id) => {
              setOrganId(id === organId ? null : id);
              setTab("resumen");
            }}
          />
          {hasRelated && related ? (
            <RelatedContentBlock related={related} />
          ) : (
            <div className="hidden min-w-0 lg:block" aria-hidden="true" />
          )}
        </div>
      ) : null}
    </div>
  );
}

function SystemPanel({
  system,
  organId,
  tab,
  substanceId,
  phase,
  related,
  onTab,
  onSubstance,
  onPhase,
  onExploreOrgans,
}: {
  system: AtlasSystem | null;
  organId: string | null;
  tab: AnatomyTab;
  substanceId: string | null;
  phase: NarrativePhase;
  related: ReturnType<typeof relatedContentForSystem> | null;
  onTab: (tab: AnatomyTab) => void;
  onSubstance: (id: string) => void;
  onPhase: (phase: NarrativePhase) => void;
  onExploreOrgans: () => void;
}) {
  const { t } = useTranslation(["anatomy", "organs", "explore"]);
  const organ = system?.organs.find((item) => item.id === organId) ?? null;
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

  const showDetailTabs = Boolean(system && organ);

  return (
    <aside className="flex min-w-0 flex-col overflow-x-hidden rounded-2xl border border-soma-line bg-soma-surface lg:max-h-[min(48rem,calc(100svh-11rem))] lg:overflow-hidden">
      <header ref={headerRef} className="shrink-0 px-4 pb-3 pt-4">
        {system ? (
          <SystemContextHeader
            system={system}
            related={related}
            onExploreOrgans={onExploreOrgans}
          />
        ) : (
          <h2 className="text-lg font-semibold leading-snug text-soma-ink">{t("humanBody")}</h2>
        )}

        {showDetailTabs && organ ? (
          <>
            <h3 className="mt-4 text-base font-semibold text-soma-ink">
              {atlasOrganName(t, organ.id, organ.name)}
            </h3>
            <div role="tablist" aria-label={t("tablistAria")} className="mt-3 flex flex-wrap gap-1.5">
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
                  {t(`tabs.${item}`)}
                </button>
              ))}
            </div>
          </>
        ) : null}
      </header>

      <div
        ref={scrollRef}
        className="min-w-0 lg:min-h-0 lg:flex-1 lg:overflow-x-hidden lg:overflow-y-auto lg:overscroll-contain"
      >
        <div className="px-4 pb-4">
          <div
            id="anatomy-tab-panel"
            role={showDetailTabs ? "tabpanel" : undefined}
            aria-labelledby={showDetailTabs ? `anatomy-tab-${tab}` : undefined}
            className="text-sm leading-relaxed text-soma-ink-secondary"
          >
            <PanelBody
              system={system}
              organ={organ}
              tab={showDetailTabs ? tab : "resumen"}
              substanceId={substanceId}
              phase={phase}
              onSubstance={onSubstance}
              onPhase={onPhase}
              onEffects={() => onTab("efectos")}
              onRecovery={() => onTab("recuperacion")}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}

function SystemContextHeader({
  system,
  related,
  onExploreOrgans,
}: {
  system: AtlasSystem;
  related: ReturnType<typeof relatedContentForSystem> | null;
  onExploreOrgans: () => void;
}) {
  const { t } = useTranslation(["anatomy", "explore"]);
  const sheet = resolveSystemSheet(system);
  const thumb = systemIconSrc(system);
  const name = atlasSystemName(t, system.id, system.name);

  return (
    <div className="min-w-0 space-y-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-soma-action">
        {t("selectedSystem")}
      </p>
      {thumb ? (
        <img src={thumb} alt="" className="mx-auto h-28 w-full max-w-[11rem] object-contain" />
      ) : null}
      <h2 className="min-w-0 text-lg font-semibold leading-snug text-soma-ink">{name}</h2>
      <p className="text-sm leading-relaxed text-soma-ink-secondary">{t(`systemIntro.${system.id}`)}</p>
      <div className="flex min-w-0 flex-wrap gap-1.5">
        {sheet.organCount > 0 ? (
          <span className="rounded-full border border-soma-line bg-soma-canvas px-2.5 py-0.5 text-[11px] text-soma-ink-secondary">
            {t("organCount", { count: sheet.organCount })}
          </span>
        ) : null}
        {related && related.articles.length > 0 ? (
          <span className="rounded-full border border-soma-line bg-soma-canvas px-2.5 py-0.5 text-[11px] text-soma-ink-secondary">
            {t("relatedArticleCount", { count: related.articles.length })}
          </span>
        ) : null}
        {related && related.substances.length > 0 ? (
          <span className="rounded-full border border-soma-line bg-soma-canvas px-2.5 py-0.5 text-[11px] text-soma-ink-secondary">
            {t("relatedSubstanceCount", { count: related.substances.length })}
          </span>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onExploreOrgans}
        className={`${previewFocus} inline-flex min-h-11 w-full items-center justify-center gap-1 rounded-xl bg-soma-action px-3 py-2 text-sm font-medium text-[#081018] hover:bg-soma-action-hover`}
      >
        {t("exploreThisSystem")}
        <ChevronRight aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
}

function OrganRail({
  system,
  organId,
  onOrgan,
}: {
  system: AtlasSystem;
  organId: string | null;
  onOrgan: (id: string) => void;
}) {
  const { t } = useTranslation(["anatomy", "organs"]);
  return (
    <section id="atlas-organs" className="min-w-0 self-start" aria-labelledby="atlas-organs-heading">
      <header>
        <h2 id="atlas-organs-heading" className="text-lg font-semibold leading-snug text-soma-ink">
          {t("mainOrgans")}
        </h2>
        <p className="mt-1 text-sm leading-snug text-soma-ink-secondary">{t("organSectionLead")}</p>
      </header>
      {system.organs.length === 0 ? (
        <p className="mt-4 text-sm leading-relaxed text-soma-ink-muted">{t("emptySystemOrgans")}</p>
      ) : (
        <ul className="mt-4 grid min-w-0 grid-cols-1 justify-items-start gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(11.5rem,13rem))]">
          {system.organs.map((item) => {
            const selected = item.id === organId;
            const name = atlasOrganName(t, item.id, item.name);
            const copy = anatomyOrganEducationCopy(t, item.id);
            const blurb = copy?.physiology
              ? firstEducationalSentence(copy.physiology)
              : copy?.location
                ? firstEducationalSentence(copy.location)
                : null;
            return (
              <li key={item.id} className="w-full min-w-0 max-w-[20rem] sm:max-w-[18rem] lg:max-w-[13rem]">
                <button
                  type="button"
                  aria-pressed={selected}
                  aria-label={t("openOrganDetail", { name })}
                  onClick={() => onOrgan(item.id)}
                  className={`${previewFocus} flex h-full w-full min-w-0 flex-col rounded-2xl border text-left ${
                    selected
                      ? "border-soma-action bg-soma-raised/40"
                      : "border-soma-line bg-soma-surface hover:border-soma-line-strong"
                  }`}
                >
                  <span className="flex h-32 w-full items-center justify-center rounded-t-2xl bg-[#101820] px-3 pt-3 sm:h-36">
                    {item.plate ? (
                      <img src={item.plate.src} alt="" className="h-full w-full object-contain" />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="grid h-12 w-12 place-items-center rounded-full bg-soma-surface text-sm text-soma-ink-muted"
                      >
                        {name.slice(0, 1)}
                      </span>
                    )}
                  </span>
                  <span className="flex min-w-0 flex-col p-3">
                    <span className="flex items-start justify-between gap-2">
                      <span className="text-sm font-semibold leading-snug text-soma-ink">{name}</span>
                      <ChevronRight aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-soma-ink-muted" />
                    </span>
                    {blurb ? (
                      <span className="mt-1 text-pretty text-xs leading-snug text-soma-ink-secondary [overflow-wrap:break-word]">
                        {blurb}
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function RelatedContentBlock({
  related,
}: {
  related: ReturnType<typeof relatedContentForSystem>;
}) {
  const { t } = useTranslation(["anatomy", "explore-edu", "missions", "substances"]);
  const base = useShellBase();
  const available = relatedTabs.filter((item) => related[item].length > 0);
  const availableKey = available.join(",");
  const [tab, setTab] = useState<RelatedTab>(available[0] ?? "articles");
  const selected = available.includes(tab) ? tab : (available[0] ?? "articles");

  useEffect(() => {
    const next = availableKey.split(",").filter(Boolean) as RelatedTab[];
    setTab((current) => (next.includes(current) ? current : (next[0] ?? "articles")));
  }, [availableKey]);

  if (available.length === 0) return null;

  return (
    <section className="min-w-0 self-start" aria-labelledby="atlas-related-heading">
      <header>
        <h2 id="atlas-related-heading" className="text-lg font-semibold leading-snug text-soma-ink">
          {t("relatedTitle")}
        </h2>
        <p className="mt-1 hidden text-sm leading-snug lg:block lg:invisible" aria-hidden="true">
          {t("organSectionLead")}
        </p>
      </header>
      <div className="mt-4 rounded-2xl border border-soma-line bg-soma-surface p-3">
      <div role="tablist" aria-label={t("relatedTablistAria")} className="flex min-w-0 flex-wrap gap-1.5">
        {available.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            id={`atlas-related-tab-${item}`}
            aria-selected={selected === item}
            aria-controls="atlas-related-panel"
            onClick={() => setTab(item)}
            className={`${previewFocus} rounded-full px-2.5 py-1 text-xs ${
              selected === item ? "bg-soma-action text-[#081018]" : "bg-soma-canvas text-soma-ink-secondary"
            }`}
          >
            {t(relatedTabLabelKey(item))}
          </button>
        ))}
      </div>
      <div
        id="atlas-related-panel"
        role="tabpanel"
        aria-labelledby={`atlas-related-tab-${selected}`}
        className="mt-3 min-w-0"
      >
        {selected === "articles" ? (
          <ul className="space-y-2">
            {related.articles.map((article) => {
              const href = exploreEduHref(base, article.sheetId);
              if (!href) return null;
              const art = relatedArticleArt(article.sheetId);
              return (
                <li key={article.sheetId}>
                  <Link
                    to={href}
                    className={`${previewFocus} flex items-center gap-2 rounded-xl border border-soma-line px-2.5 py-2 text-sm text-soma-ink hover:border-soma-line-strong`}
                  >
                    {art ? <img src={art} alt="" className="h-8 w-8 shrink-0 object-contain" /> : null}
                    <span className="min-w-0 flex-1">
                      {t(`explore-edu:anatomyToArticle.${article.sheetId}`, {
                        defaultValue: article.sheetId,
                      })}
                    </span>
                    <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-soma-ink-muted" />
                    <span className="sr-only">{t("relatedOpenArticle")}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : null}
        {selected === "substances" ? (
          <ul className="space-y-2">
            {related.substances.map((substance) => {
              const href = anatomyExplorerHrefForOrgan(base, substance.organId);
              if (!href) return null;
              return (
                <li key={substance.id}>
                  <Link
                    to={href}
                    className={`${previewFocus} flex items-center gap-2 rounded-xl border border-soma-line px-2.5 py-2 text-sm text-soma-ink hover:border-soma-line-strong`}
                  >
                    <SubstanceIllustration
                      name={substance.id}
                      className="h-8 w-8 shrink-0"
                      iconClassName="h-4 w-4"
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {t(`substances:${substance.id}.name`, { defaultValue: substance.id })}
                    </span>
                    <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-soma-ink-muted" />
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : null}
        {selected === "missions" ? (
          <ul className="space-y-2">
            {related.missions.map((mission) => {
              const art = missionIllustrationSrc(mission.sheetId);
              return (
                <li key={mission.id}>
                  <Link
                    to={`${base}/missions`}
                    className={`${previewFocus} flex items-center gap-2 rounded-xl border border-soma-line px-2.5 py-2 text-sm text-soma-ink hover:border-soma-line-strong`}
                  >
                    {art ? <img src={art} alt="" className="h-8 w-8 shrink-0 object-contain" /> : null}
                    <span className="min-w-0 flex-1">
                      {t(missionCopyPath(mission.titleKey), { ns: "missions" })}
                    </span>
                    <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-soma-ink-muted" />
                    <span className="sr-only">{t("relatedOpenMission")}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
      </div>
    </section>
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
  const { t } = useTranslation("anatomy");
  if (!system) {
    return <p>{t("rootIntro")}</p>;
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
      <AdvicePanel
        organId={organ?.id ?? null}
        substanceId={substanceId}
        phase={phase}
        onSubstance={onSubstance}
        onPhase={onPhase}
      />
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
  const { t } = useTranslation(["anatomy", "organs", "explore"]);
  const intro = summaryIntro(t, system, organ);

  if (!organ) {
    const sheet = resolveSystemSheet(system);
    return <SystemSheetSummary intro="" sheet={sheet} />;
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
  t: TFunction,
  system: AtlasSystem,
  organ: AtlasSystem["organs"][number] | null,
): string {
  if (organ?.id === "lungs") {
    return t("introLungs");
  }
  if (organ && !organ.plate) {
    return t("introOrganNoPlate", { name: atlasOrganName(t, organ.id, organ.name) });
  }
  if (organ) {
    return atlasOrganName(t, organ.id, organ.name);
  }
  return t(`systemIntro.${system.id}`);
}

function choiceClass(selected: boolean): string {
  return `${previewFocus} flex min-w-0 cursor-pointer rounded-xl border has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-soma-focus ${
    selected
      ? "border-soma-action/80 bg-soma-raised/40 text-soma-ink"
      : "border-soma-line bg-soma-canvas/40 text-soma-ink-secondary"
  }`;
}

function CatalogDetails({
  summary,
  children,
}: {
  summary: string;
  children: ReactNode;
}) {
  return (
    <details className="rounded-xl border border-soma-line bg-soma-canvas/30 px-3 py-2">
      <summary className={`${previewFocus} cursor-pointer text-xs font-medium text-soma-ink`}>
        {summary}
      </summary>
      <div className="mt-2 space-y-2">{children}</div>
    </details>
  );
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
  const { t } = useTranslation([
    "anatomy",
    "organ-narrative",
    "phases",
    "substances",
    "neurotransmitters",
    "neurotransmitter-phases",
    "mechanisms",
  ]);
  const substances = organ ? educationalEffectsSubstances(organ.id) : [];
  const selectedSubstance = organ ? selectEducationalEffectsSubstance(substanceId, organ.id) : null;
  const narrative =
    organ && selectedSubstance
      ? resolveEducationalNarrative(organ.id, selectedSubstance, phase)
      : null;
  const narrativeText = narrative ? t(`organ-narrative:${narrative.narrativeKey}`) : "";
  const signaling =
    organ && selectedSubstance
      ? resolveEducationalSignaling(organ.id, selectedSubstance, phase)
      : [];

  if (!organ) {
    return (
      <p>
        {system.organs.length === 0 ? t("emptySystemOrgans") : t("openOrganForEffects")}
      </p>
    );
  }

  if (substances.length === 0 || !selectedSubstance) {
    return <p>{t("noEducationalEffects")}</p>;
  }

  return (
    <div className="space-y-3">
      <fieldset className="min-w-0 border-0 p-0">
        <legend className="sr-only">{t("substanceLegend")}</legend>
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
                  name={`anatomy-substance-${organ.id}`}
                  value={id}
                  checked={selected}
                  onChange={() => onSubstance(id)}
                  className="sr-only"
                />
                <span className="pointer-events-none flex h-8 w-8 items-center justify-center">
                  <SubstanceIllustration name={id} className="h-8 w-8" iconClassName="h-4 w-4" />
                </span>
                <span className="max-w-full truncate text-[11px] leading-tight">
                  {t(`substances:${id}.name`, { defaultValue: id })}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset
        className="min-w-0 border-0 p-0"
        aria-describedby={`anatomy-effects-notice-${organ.id}`}
      >
        <legend className="sr-only">{t("phaseLegend")}</legend>
        <div className="grid grid-cols-2 gap-1.5">
          {narrativePhases.map((item) => {
            const selected = item === phase;
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
                <span className="block text-[11px] leading-tight">{t(`phases:${item}`)}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <p
        id={`anatomy-effects-notice-${organ.id}`}
        className="text-[11px] leading-relaxed text-soma-ink-muted"
      >
        {t("effectsNotice")}
      </p>

      {narrative ? (
        <p className="text-sm leading-relaxed text-soma-ink-secondary">
          {narrativeText || t("missingScientificText")}
        </p>
      ) : signaling.length > 0 ? (
        <p className="rounded-xl border border-dashed border-soma-line px-3 py-2 text-xs text-soma-ink-muted">
          {t("noOrganNarrative")}
        </p>
      ) : null}

      {signaling.length > 0 ? (
        <section className="space-y-2" aria-labelledby={`anatomy-signaling-${organ.id}`}>
          <h3
            id={`anatomy-signaling-${organ.id}`}
            className="text-xs font-semibold text-soma-ink"
          >
            {t("signalingTitle")}
          </h3>
          <p className="text-[11px] leading-relaxed text-soma-ink-muted">{t("signalingMarkLegend")}</p>
          <ul className="space-y-2">
            {signaling.map((entry) => (
              <EducationalSignalingCard key={entry.neurotransmitter} entry={entry} />
            ))}
          </ul>
        </section>
      ) : null}

      {narrative || signaling.length > 0 ? (
        <CatalogDetails
          key={`${organ.id}-${selectedSubstance}-${phase}`}
          summary={t("effectsDetailsSummary")}
        >
          {signaling.length > 0 ? (
            <p className="text-[11px] leading-relaxed text-soma-ink-muted">
              {t("signalingAttribution")}
            </p>
          ) : null}
          {narrative ? (
            <CatalogEvidenceNote
              rawSource={narrative.referenceSource}
              confidenceLevel={narrative.confidenceLevel}
            />
          ) : null}
        </CatalogDetails>
      ) : null}
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
  const { t } = useTranslation(["anatomy", "substances", "organs"]);
  const substances = organ ? recoverySubstances(organ.id) : [];
  const selectedSubstance = organ ? selectRecoverySubstance(substanceId, organ.id) : null;
  const curve =
    organ && selectedSubstance
      ? resolveEducationalRecovery(organ.id, selectedSubstance)
      : null;

  if (!organ) {
    return (
      <p>
        {system.organs.length === 0 ? t("emptySystemOrgans") : t("openOrganForRecovery")}
      </p>
    );
  }

  if (substances.length === 0 || !selectedSubstance || !curve) {
    return (
      <p className="rounded-xl border border-dashed border-soma-line px-3 py-4 text-soma-ink-muted">
        {t("noRecoveryModel")}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <fieldset className="min-w-0 border-0 p-0">
        <legend className="sr-only">{t("substanceLegend")}</legend>
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
                  {t(`substances:${id}.name`, { defaultValue: id })}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <p className="text-sm leading-relaxed text-soma-ink">
        {t("recoveryAspect", {
          organ: atlasOrganName(t, organ.id, organ.name),
          substance: t(`substances:${selectedSubstance}.name`, { defaultValue: selectedSubstance }),
        })}
      </p>
      <p className="text-sm leading-relaxed text-soma-ink-secondary">
        {t(`recoveryMeaning.${curve.shape}`)}
      </p>
      <p className="text-sm leading-relaxed text-soma-ink-secondary">
        {t("recoveryPlainEstimate", { count: curve.daysTo95Recovery })}
      </p>
      <p className="text-xs leading-relaxed text-soma-ink-muted">{t("catalogEstimateNotice")}</p>

      <CatalogDetails
        key={`${organ.id}-${selectedSubstance}`}
        summary={t("recoveryDetailsSummary")}
      >
        <dl className="space-y-2 text-sm text-soma-ink-secondary">
          <div>
            <dt className="text-xs font-semibold text-soma-ink">{t("curveShape")}</dt>
            <dd>{t(`shape.${curve.shape}`)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-soma-ink">{t("daysTo95")}</dt>
            <dd>{t("daysUnit", { count: curve.daysTo95Recovery })}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-soma-ink">{t("ceiling")}</dt>
            <dd>{curve.ceilingPercentLabel}</dd>
          </div>
        </dl>
        <p className="text-xs leading-relaxed text-soma-ink-muted">{t("recoveryDisclaimer")}</p>
        <CatalogEvidenceNote
          rawSource={curve.referenceSource}
          confidenceLevel={curve.confidenceLevel}
        />
      </CatalogDetails>
    </div>
  );
}

function atlasOrganName(t: TFunction, id: string, fallback: string): string {
  return localizedCatalogLabel(t(id, { ns: "organs", defaultValue: fallback }), fallback, id);
}

function atlasSystemName(t: TFunction, id: string, fallback: string): string {
  return localizedCatalogLabel(
    t(`systems.${id}`, { ns: "explore", defaultValue: fallback }),
    fallback,
    id,
  );
}

function systemIconSrc(system: AtlasSystem): string | undefined {
  return exploreSystemCardSources(system.id, system.plates.anterior?.src)[0];
}

function relatedTabLabelKey(tab: RelatedTab): "relatedArticles" | "relatedSubstances" | "relatedMissions" {
  if (tab === "articles") return "relatedArticles";
  if (tab === "substances") return "relatedSubstances";
  return "relatedMissions";
}

function relatedArticleArt(sheetId: string): string | null {
  if (sheetId in exploreNeurotransmitterArt) {
    return exploreNeurotransmitterArt[sheetId as keyof typeof exploreNeurotransmitterArt];
  }
  if (sheetId in exploreProcessArt) {
    return exploreProcessArt[sheetId as keyof typeof exploreProcessArt];
  }
  return null;
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
