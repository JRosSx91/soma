import { useEffect, useRef, useState } from "react";
import type { TFunction } from "i18next";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { previewFocus } from "../focus.js";
import { localizedCatalogLabel } from "../explore/explore-search.js";
import { AnatomyAtlas2D } from "../anatomy/AnatomyAtlas2D.js";
import {
  anatomySearchParams,
  resolveAnatomyExplorerSelection,
} from "../anatomy/anatomy-explorer-query.js";
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
import { resolveOrganSheet } from "../anatomy/organ-sheet.js";
import { resolveSystemSheet } from "../anatomy/system-sheet.js";
import { useShellBase } from "../context/ShellBaseContext.js";
import { PageHeading } from "../components/PageHeading.js";
import { CatalogEvidenceNote } from "../components/CatalogEvidenceNote.js";
import {
  OrganSheetSummary,
  SystemSheetSummary,
} from "../components/OrganSheetSummary.js";
import { SubstanceIllustration } from "../components/SubstanceIllustration.js";
import { EducationalSignalingCard } from "../components/EducationalSignalingCard.js";
import { AdvicePanel } from "../components/AdvicePanel.js";

const tabs = ["resumen", "efectos", "recuperacion", "consejos"] as const;
type AnatomyTab = (typeof tabs)[number];

export function AnatomyExplorerPage() {
  const { t } = useTranslation(["anatomy", "organs", "explore"]);
  const base = useShellBase();
  const [searchParams, setSearchParams] = useSearchParams();
  const { systemId, organId } = resolveAnatomyExplorerSelection(
    searchParams.get("system"),
    searchParams.get("organ"),
  );
  const [tab, setTab] = useState<AnatomyTab>("resumen");
  const [substanceId, setSubstanceId] = useState<string | null>(null);
  const [phase, setPhase] = useState<NarrativePhase>("during_use");

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

  return (
    <div className="flex flex-col gap-3 pb-2">
      <PageHeading
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        demo={base === "/preview"}
      />

      <nav aria-label={t("crumbAria")} className="flex flex-wrap items-center gap-1.5 text-sm">
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

      <div className="grid min-w-0 items-start gap-3 lg:grid-cols-[10.75rem_minmax(0,1fr)_21.5rem] xl:grid-cols-[11.5rem_minmax(0,1fr)_23rem]">
        <ul
          aria-label={t("systemsAria")}
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
                  <span className="min-w-0 whitespace-nowrap lg:whitespace-normal">
                    {atlasSystemName(t, item.id, item.name)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <AnatomyAtlas2D
          label={organLabel ?? systemLabel}
          plate={plate}
          unavailableMessage={unavailableMessage}
          regions={regions}
          selectedOrganId={organId}
          fillView={fullBodyPlate}
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
  const { t } = useTranslation(["anatomy", "organs", "explore"]);
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
          {organ
            ? atlasOrganName(t, organ.id, organ.name)
            : system
              ? atlasSystemName(t, system.id, system.name)
              : t("humanBody")}
        </h2>

        {system ? (
          <div role="tablist" aria-label={t("tablistAria")} className="mt-4 flex flex-wrap gap-1.5">
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
          <h3 className="mt-5 text-sm font-semibold text-soma-ink">{t("illustratedSystems")}</h3>
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
                  <span className="leading-tight">{atlasSystemName(t, item.id, item.name)}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : system.organs.length === 0 ? (
        <p className="mt-4 text-xs leading-relaxed text-soma-ink-muted">
          {t("emptySystemOrgans")}
        </p>
      ) : (
        <>
          <h3 className="mt-5 text-sm font-semibold text-soma-ink">{t("mainOrgans")}</h3>
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
                          {atlasOrganName(t, item.id, item.name).slice(0, 1)}
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] leading-tight text-soma-ink-secondary">
                      {atlasOrganName(t, item.id, item.name)}
                    </span>
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
  if (system.id === "respiratory") {
    return t("introRespiratory");
  }
  const systemLabel = atlasSystemName(t, system.id, system.name);
  if (system.organs.length === 0) {
    return t("introEmptySystem", { name: systemLabel });
  }
  const names = system.organs
    .map((item) => atlasOrganName(t, item.id, item.name))
    .join(", ");
  return t("introSystemIncludes", { name: systemLabel, organs: names });
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
        aria-describedby={`anatomy-phase-category-note-${organ.id}`}
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
        id={`anatomy-phase-category-note-${organ.id}`}
        className="text-[11px] leading-relaxed text-soma-ink-muted"
      >
        {t("phaseCategoryNote")}
      </p>

      <p className="text-xs leading-relaxed text-soma-ink-muted">{t("generalDisclaimer")}</p>

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
          <p className="text-[11px] leading-relaxed text-soma-ink-muted">
            {t("signalingAttribution")}
          </p>
          <p className="text-[11px] leading-relaxed text-soma-ink-muted">{t("signalingMarkLegend")}</p>
          <ul className="space-y-2">
            {signaling.map((entry) => (
              <EducationalSignalingCard key={entry.neurotransmitter} entry={entry} />
            ))}
          </ul>
        </section>
      ) : null}

      {narrative ? (
        <CatalogEvidenceNote
          rawSource={narrative.referenceSource}
          confidenceLevel={narrative.confidenceLevel}
        />
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
  const { t } = useTranslation(["anatomy", "substances"]);
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

      <p className="text-xs leading-relaxed text-soma-ink-muted">{t("recoveryDisclaimer")}</p>

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

      <p className="text-xs leading-relaxed text-soma-ink">{t("catalogEstimateNotice")}</p>

      <CatalogEvidenceNote
        rawSource={curve.referenceSource}
        confidenceLevel={curve.confidenceLevel}
      />
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
