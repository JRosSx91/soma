import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { resolveInterfaceLanguage } from "../../../i18n/interface-languages.js";
import { DetailSheet } from "../components/DetailSheet.js";
import { useShellLayout } from "../hooks/useShellLayout.js";
import { previewFocus } from "../focus.js";
import {
  SHELL_HERO_BLEED_COLLAPSED_CLASS,
  SHELL_HERO_BLEED_EXPANDED_CLASS,
} from "../shell-sidebar.js";
import { KnowledgePrototypeTree } from "../knowledge/KnowledgePrototypeTree.js";
import { PrototypeConceptSheet } from "../knowledge/PrototypeConceptSheet.js";
import { CURIOSITY_SPARK_URL, STRATUM_BACKGROUND_URL } from "../knowledge/knowledge-prototype-lookdev.js";
import { KNOWLEDGE_PROTOTYPE_COPY } from "../knowledge/knowledge-prototype-copy.js";
import {
  KNOWLEDGE_PROTOTYPE_CATALOG,
  KNOWLEDGE_PROTOTYPE_DEPENDENCIES,
  KNOWLEDGE_PROTOTYPE_NODES,
  prototypeNodesForScenario,
  type KnowledgePrototypeScenario,
} from "../knowledge/knowledge-prototype-fixture.js";
export { PrototypePlayableRequirements } from "../knowledge/PrototypeConceptSheet.js";
import {
  KNOWLEDGE_CONCEPT_QUERY_KEY,
  resolveKnowledgeConceptParam,
  sanitizeKnowledgeSearchParams,
  writeKnowledgeConceptSearchParams,
} from "../knowledge/knowledge-browser-model.js";
import type { KnowledgeConceptId } from "../knowledge/knowledge-types.js";
import { discoveryCost, formatMilliPerSecond } from "../knowledge/knowledge-prototype-game-engine.js";
import type { PrototypeGeneratorOffer, PrototypeManualOffer, PrototypeNextDiscovery } from "../knowledge/knowledge-prototype-game-engine.js";
import type { KnowledgeCatalog } from "../knowledge/knowledge-types.js";
import type { KnowledgePrototypeScenarioNode } from "../knowledge/knowledge-prototype-fixture.js";
import { useKnowledgePrototypeGame } from "../knowledge/useKnowledgePrototypeGame.js";

const QA_SCENARIOS: readonly KnowledgePrototypeScenario[] = ["start", "middle", "advanced", "complete"];

export function KnowledgePrototypePage() {
  const { i18n } = useTranslation("knowledge");
  const { collapsed } = useShellLayout();
  const language = resolveInterfaceLanguage(i18n.resolvedLanguage ?? i18n.language);
  const copy = KNOWLEDGE_PROTOTYPE_COPY[language];
  const game = useKnowledgePrototypeGame();
  const [qaScenario, setQaScenario] = useState<KnowledgePrototypeScenario | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const nodes = qaScenario ? prototypeNodesForScenario(qaScenario) : game.nodes;
  const activeCatalog = qaScenario
    ? KNOWLEDGE_PROTOTYPE_CATALOG
    : game.playableCatalog;
  const conceptParam = searchParams.get(KNOWLEDGE_CONCEPT_QUERY_KEY);
  const selectedId = resolveKnowledgeConceptParam(activeCatalog, conceptParam);
  const invalidSelection = conceptParam !== null && selectedId === null;
  const selected = selectedId
    ? activeCatalog.concepts.find((item) => item.id === selectedId) ?? null
    : null;
  const selectedNode = selectedId ? nodes.find((item) => item.id === selectedId) ?? null : null;
  const desktopPanel = useDesktopPanel();
  const sheetOpen = Boolean(selected && selectedNode && selectedNode.state === "discovered");

  useEffect(() => {
    const sanitized = sanitizeKnowledgeSearchParams(searchParams, activeCatalog);
    if (sanitized.toString() === searchParams.toString()) return;
    setSearchParams(sanitized, { replace: true });
  }, [activeCatalog, searchParams, setSearchParams]);

  function selectConcept(id: KnowledgeConceptId | null) {
    setSearchParams(
      (current) => writeKnowledgeConceptSearchParams(current, id, activeCatalog),
      { replace: true },
    );
  }

  const generator = selected ? game.generators.find((item) => item.conceptId === selected.id) ?? null : null;

  return (
    <div
      data-knowledge-prototype="game-02d"
      className={`${collapsed ? SHELL_HERO_BLEED_COLLAPSED_CLASS : SHELL_HERO_BLEED_EXPANDED_CLASS} relative flex h-[calc(100dvh-7.25rem)] min-h-[36rem] min-w-0 flex-col overflow-hidden bg-[#050b14] lg:h-[calc(100dvh-0.75rem)] lg:min-h-[44rem]`}
    >
      <div aria-hidden="true" data-prototype-stratum-background="true" className="pointer-events-none absolute inset-0">
        <img src={STRATUM_BACKGROUND_URL} alt="" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(5_12_22/0.12),rgb(4_8_16/0.62))]" />
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#050b14]/85 to-transparent" />
      </div>
      <PrototypePlayHeader
        language={language}
        sparksLabel={qaScenario ? "0" : game.sparksDisplay}
        productionRate={qaScenario ? "0" : game.productionPerSecondDisplay}
        perTap={qaScenario ? "0" : game.perTapDisplay}
        nextLabel={qaScenario ? copy.game.chapterComplete : nextDiscoveryLabel(language, game.nextDiscovery, game.playableCatalog, game.nodes)}
        discovered={qaScenario ? nodes.filter((n) => n.state === "discovered").length : game.discoveredCount}
        total={KNOWLEDGE_PROTOTYPE_NODES.length}
        onReset={() => {
          setQaScenario(null);
          game.reset();
          selectConcept(null);
        }}
        qaScenario={qaScenario}
        onQaScenarioChange={setQaScenario}
        manual={game.manual}
        generators={game.generators}
        catalog={KNOWLEDGE_PROTOTYPE_CATALOG}
        nodes={nodes}
        onBuyManual={game.buyManual}
        onBuyGenerator={game.buyGenerator}
        doorOpen={!qaScenario && game.nodes.some((node) => node.sequence === 26 && node.state === "discovered")}
        statusMessage={game.discoveryPulse > 0 ? copy.game.discoveryDone : game.lastError ? copy.game.errors[game.lastError] : null}
      />

      {invalidSelection ? (
        <p role="status" className="border-b border-soma-line/60 bg-soma-warning/10 px-4 py-2 text-xs text-soma-ink-secondary">
          {copy.invalidConcept}
        </p>
      ) : null}

      <div className="relative z-10 flex min-h-0 min-w-0 flex-1">
        <KnowledgePrototypeTree
          scenarioKey={qaScenario ?? "play"}
          catalog={KNOWLEDGE_PROTOTYPE_CATALOG}
          nodes={nodes}
          dependencies={KNOWLEDGE_PROTOTYPE_DEPENDENCIES}
          language={language}
          selectedId={selectedId}
          onSelect={selectConcept}
          onDiscover={qaScenario ? undefined : game.discover}
          discoveryCost={qaScenario ? undefined : discoveryCost}
          canDiscover={qaScenario ? undefined : game.canDiscoverConcept}
          onBackgroundTap={qaScenario ? undefined : game.queueTap}
        />
        {sheetOpen && desktopPanel && selected && selectedNode ? (
          <PrototypeConceptSheet
            variant="panel"
            concept={selected}
            node={selectedNode}
            catalog={activeCatalog}
            nodes={nodes}
            language={language}
            onSelect={selectConcept}
            onClose={() => selectConcept(null)}
            generator={generator}
            playing={qaScenario === null}
            onBuyGenerator={game.buyGenerator}
          />
        ) : null}
      </div>

      {sheetOpen && !desktopPanel && selected && selectedNode ? (
        <DetailSheet title={selected.labels[language]} size="article" tone="expedition" onClose={() => selectConcept(null)}>
          <PrototypeConceptSheet
            variant="sheet"
            concept={selected}
            node={selectedNode}
            catalog={activeCatalog}
            nodes={nodes}
            language={language}
            onSelect={selectConcept}
            onClose={() => selectConcept(null)}
            generator={generator}
            playing={qaScenario === null}
            onBuyGenerator={game.buyGenerator}
          />
        </DetailSheet>
      ) : null}
    </div>
  );
}

function useDesktopPanel() {
  const query = "(min-width: 1024px)";
  const [desktop, setDesktop] = useState(() => (
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia(query).matches
      : false
  ));
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return undefined;
    const media = window.matchMedia(query);
    const sync = () => setDesktop(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  return desktop;
}

function nextDiscoveryLabel(
  language: "es" | "en",
  next: PrototypeNextDiscovery,
  catalog: KnowledgeCatalog,
  nodes: readonly KnowledgePrototypeScenarioNode[],
) {
  const copy = KNOWLEDGE_PROTOTYPE_COPY[language];
  if (next.status === "complete" || !next.conceptId || next.costSparks === null) return copy.game.chapterComplete;
  if (next.status === "blocked") {
    const visible = next.missingIds.filter((id) => {
      const state = nodes.find((node) => node.id === id)?.state;
      return state === "available" || state === "discovered";
    });
    if (visible.length === 0) return copy.game.nextBlocked;
    const names = visible.map((id) => catalog.concepts.find((concept) => concept.id === id)?.labels[language] ?? copy.game.hiddenPrerequisite);
    return names.join(", ");
  }
  const name = catalog.concepts.find((concept) => concept.id === next.conceptId)?.labels[language] ?? copy.game.nextBlocked;
  return copy.game.nextReady(name, next.costSparks);
}

function PrototypePlayHeader({
  language,
  sparksLabel,
  productionRate,
  perTap,
  nextLabel,
  discovered,
  total,
  onReset,
  qaScenario,
  onQaScenarioChange,
  manual,
  generators,
  catalog,
  nodes,
  onBuyManual,
  onBuyGenerator,
  doorOpen,
  statusMessage,
}: {
  language: "es" | "en";
  sparksLabel: string;
  productionRate: string;
  perTap: string;
  nextLabel: string;
  discovered: number;
  total: number;
  onReset: () => void;
  qaScenario: KnowledgePrototypeScenario | null;
  onQaScenarioChange: (value: KnowledgePrototypeScenario | null) => void;
  manual: PrototypeManualOffer;
  generators: readonly PrototypeGeneratorOffer[];
  catalog: KnowledgeCatalog;
  nodes: readonly KnowledgePrototypeScenarioNode[];
  onBuyManual: () => void;
  onBuyGenerator: (id: PrototypeGeneratorOffer["id"]) => void;
  doorOpen: boolean;
  statusMessage: string | null;
}) {
  const copy = KNOWLEDGE_PROTOTYPE_COPY[language];
  const playing = qaScenario === null;
  const [confirmReset, setConfirmReset] = useState(false);
  const progress = total > 0 ? Math.round((discovered / total) * 100) : 0;
  return (
    <header data-prototype-map-ignore="true" className="relative z-30 shrink-0 border-b border-white/10 bg-[#07131e]/55 px-3 py-2 backdrop-blur-md sm:px-4">
      <div className="flex min-w-0 items-center gap-3">
        <h1 className="sr-only">{copy.centreTitle}</h1>
        <div className="ml-auto flex min-w-0 items-center gap-3 sm:gap-4" title={copy.resources.perSecondHint}>
          <div className="flex items-center gap-2">
            <img src={CURIOSITY_SPARK_URL} alt="" width={22} height={22} data-prototype-spark="true" className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="sr-only">{copy.resources.sparks}</span>
            <span className="text-lg font-semibold tabular-nums text-white sm:text-xl">{sparksLabel}</span>
          </div>
          <span className="text-sm font-semibold tabular-nums text-[#7ddec8]">{copy.resources.perSecond(productionRate)}</span>
          <div className="min-w-[5.5rem]">
            <p className="flex items-baseline justify-between gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7ee0f0]">
              <span>{copy.game.stratumLabel}</span>
              <span className="tabular-nums text-soma-ink">{discovered}/{total}</span>
            </p>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={discovered} aria-label={copy.resources.discoveries}>
              <div className="h-full rounded-full bg-[#7ee0f0]" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
        <details className="group relative shrink-0" onToggle={(event) => { if (!(event.currentTarget as HTMLDetailsElement).open) setConfirmReset(false); }}>
          <summary aria-label={copy.game.options} className={`${previewFocus} grid h-9 w-9 cursor-pointer list-none place-items-center rounded-full border border-white/15 bg-[#07131e]/70 text-soma-ink`}>
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[1.6]">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M18 6l-1.6 1.6M7.6 16.4 6 18" />
            </svg>
          </summary>
          <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 max-h-[min(70vh,32rem)] w-[min(22rem,calc(100vw-2rem))] space-y-3 overflow-y-auto rounded-xl border border-white/10 bg-[#0b1724]/95 p-3 text-xs text-soma-ink-secondary shadow-xl">
            <p><span className="font-semibold text-soma-ink">{copy.resources.perTap}</span> {copy.resources.perTapValue(perTap)}</p>
            <p><span className="font-semibold text-soma-ink">{copy.resources.next}</span> {nextLabel}</p>
            <section>
              <p className="font-semibold text-soma-ink">{copy.game.upgradesSummary}</p>
              <PrototypeUpgradePanel language={language} manual={manual} generators={generators} catalog={catalog} onBuyManual={onBuyManual} onBuyGenerator={onBuyGenerator} playing={playing} />
            </section>
            <section>
              <p className="font-semibold text-soma-ink">{copy.legendTitle}</p>
              <PrototypeLegend language={language} nodes={nodes} catalog={catalog} />
            </section>
            <section>
              <p className="font-semibold text-soma-ink">{copy.demoTitle}</p>
              <p className="mt-1 leading-relaxed"><strong className="text-soma-warning">{copy.noticeTitle}</strong> {copy.noticeBody}</p>
              <div className="mt-2" data-dev-qa-scenarios="true">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-soma-ink-muted">{copy.game.qaScenarios}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <QaScenarioButton active={qaScenario === null} onClick={() => onQaScenarioChange(null)} label={language === "es" ? "Jugar" : "Play"} />
                  {QA_SCENARIOS.map((item) => (
                    <QaScenarioButton key={item} active={qaScenario === item} onClick={() => onQaScenarioChange(item)} label={copy.scenarios[item]} />
                  ))}
                </div>
              </div>
            </section>
            {confirmReset ? (
              <button type="button" onClick={onReset} className={`${previewFocus} min-h-8 w-full rounded-md border border-soma-warning/50 px-2 text-[10px] font-semibold uppercase tracking-wide text-soma-warning`}>
                {copy.game.confirmReset}
              </button>
            ) : (
              <button type="button" onClick={() => setConfirmReset(true)} className={`${previewFocus} min-h-8 w-full rounded-md px-2 text-[10px] font-semibold uppercase tracking-wide text-soma-ink-muted hover:bg-white/5 hover:text-soma-ink`}>
                {copy.game.reset}
              </button>
            )}
          </div>
        </details>
      </div>
      {statusMessage ? (
        <p role="status" className="mt-2 rounded-lg border border-soma-shell-accent/30 bg-soma-shell-accent/10 px-3 py-1.5 text-xs text-soma-ink">
          {statusMessage}
        </p>
      ) : null}
      {playing && doorOpen ? (
        <p role="status" className="mt-2 rounded-lg border border-soma-line/60 bg-[#0b1b28] px-3 py-1.5 text-xs text-soma-ink-secondary">
          {copy.game.stratumPending}
        </p>
      ) : null}
    </header>
  );
}

function QaScenarioButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`${previewFocus} min-h-7 rounded-md px-2 text-[10px] font-semibold uppercase tracking-wide ${active ? "bg-soma-shell-accent/20 text-soma-shell-accent" : "text-soma-ink-muted hover:bg-soma-raised hover:text-soma-ink"}`}
    >
      {label}
    </button>
  );
}

function PrototypeUpgradePanel({
  language,
  manual,
  generators,
  catalog,
  onBuyManual,
  onBuyGenerator,
  playing,
}: {
  language: "es" | "en";
  manual: PrototypeManualOffer;
  generators: readonly PrototypeGeneratorOffer[];
  catalog: KnowledgeCatalog;
  onBuyManual: () => void;
  onBuyGenerator: (id: PrototypeGeneratorOffer["id"]) => void;
  playing: boolean;
}) {
  const copy = KNOWLEDGE_PROTOTYPE_COPY[language];
  return (
    <div className="max-h-80 space-y-3 overflow-y-auto text-xs text-soma-ink-secondary">
      <p className="leading-relaxed text-soma-ink-muted">{copy.game.provisionalNote}</p>
      <section>
        <p className="font-semibold text-soma-ink">{copy.game.manualTitle}</p>
        <p className="mt-1 text-soma-ink">{manual.lockReason === "later-stratum" ? copy.game.laterStratum : copy.game.perTapStep(manual.yieldSparks, manual.nextYieldSparks ?? manual.yieldSparks)}</p>
        {playing && manual.lockReason !== "later-stratum" ? (
          <button
            type="button"
            disabled={manual.maxed || manual.locked || !manual.affordable}
            onClick={onBuyManual}
            className={`${previewFocus} mt-2 min-h-8 w-full rounded-md border px-2 text-[10px] font-semibold uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-50 ${manual.affordable ? "border-soma-shell-accent/50 text-soma-shell-accent" : "border-soma-line/50 text-soma-ink-muted"}`}
          >
            {manual.maxed || manual.locked || manual.costSparks === null ? (manual.maxed ? copy.game.owned : copy.game.locked) : (
              <span className="inline-flex items-center justify-center gap-1">
                <img src={CURIOSITY_SPARK_URL} alt="" width={14} height={14} className="h-3.5 w-3.5" />
                {`${copy.game.buy} · ${copy.game.cost(manual.costSparks)}`}
              </span>
            )}
          </button>
        ) : null}
      </section>
      <section className="space-y-2">
        <p className="font-semibold text-soma-ink">{copy.game.generatorTitle}</p>
        {generators.map((offer) => {
          const name = catalog.concepts.find((concept) => concept.id === offer.conceptId)?.labels[language] ?? offer.id;
          return (
            <div key={offer.id} className="rounded-lg border border-soma-line/50 bg-[#050d15]/70 p-2">
              <p className="font-semibold text-soma-ink">{name}</p>
              {offer.discovered ? (
                <p className="mt-1 text-[10px] uppercase tracking-wide text-soma-ink-muted">
                  {copy.game.level(offer.level, offer.maxLevel)} · {copy.game.rateNow(formatMilliPerSecond(offer.rateMilliPerSecond))}
                  {offer.nextRateMilliPerSecond !== null ? ` · ${copy.game.rateNext(formatMilliPerSecond(offer.nextRateMilliPerSecond))}` : ""}
                </p>
              ) : (
                <p className="mt-1 text-soma-ink-muted">{copy.game.notDiscovered}</p>
              )}
              {playing && offer.discovered ? (
                <button
                  type="button"
                  disabled={offer.maxed || !offer.affordable}
                  onClick={() => onBuyGenerator(offer.id)}
                  className={`${previewFocus} mt-2 min-h-8 w-full rounded-md border px-2 text-[10px] font-semibold uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-50 ${offer.affordable ? "border-soma-shell-accent/50 text-soma-shell-accent" : "border-soma-line/50 text-soma-ink-muted"}`}
                >
                  {offer.maxed || offer.costSparks === null ? (offer.maxed ? copy.game.owned : copy.game.locked) : (
                    <span className="inline-flex items-center justify-center gap-1">
                      <img src={CURIOSITY_SPARK_URL} alt="" width={14} height={14} className="h-3.5 w-3.5" />
                      {`${copy.game.buy} · ${copy.game.cost(offer.costSparks)}`}
                    </span>
                  )}
                </button>
              ) : null}
            </div>
          );
        })}
      </section>
    </div>
  );
}

function PrototypeLegend({
  language,
  nodes,
  catalog,
}: {
  language: "es" | "en";
  nodes: readonly KnowledgePrototypeScenarioNode[];
  catalog: KnowledgeCatalog;
}) {
  const copy = KNOWLEDGE_PROTOTYPE_COPY[language];
  const labels = new Map(catalog.concepts.map((concept) => [concept.id, concept.labels[language]]));
  const states = new Map(nodes.map((node) => [node.id, node.state]));
  const nameFor = (id: KnowledgeConceptId) => states.get(id) === "hinted" ? copy.unknownDiscovery : labels.get(id) ?? copy.unknownDiscovery;
  const visible = (id: KnowledgeConceptId) => states.get(id) !== "hidden";
  return (
    <div className="mt-2 space-y-2 text-xs text-soma-ink-secondary">
      <span className="flex items-center gap-2"><span aria-hidden="true" className="w-8 border-t-[3px] border-[#68d8c0]" />{copy.scientificConnection}</span>
      <span className="flex items-center gap-2"><span aria-hidden="true" className="w-8 border-t-[3px] border-[#a78bfa]" />{copy.gameConnection}</span>
      <span className="flex items-center gap-2"><span aria-hidden="true" className="flex h-6 w-8 items-center justify-center rounded border border-dashed border-soma-line text-soma-ink-muted">?</span>{copy.unknownDiscovery}</span>
      <p className="leading-relaxed text-soma-ink-muted">{copy.legendNotice}</p>
      <details>
        <summary className={`${previewFocus} cursor-pointer font-medium text-[#9ad4e0]`}>{copy.connectionList}</summary>
        <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto">
          {catalog.relations.filter((item) => visible(item.subject) && visible(item.object)).map((item) => (
            <li key={item.id}>{copy.scientificConnection}: {nameFor(item.subject)} → {nameFor(item.object)}</li>
          ))}
          {KNOWLEDGE_PROTOTYPE_DEPENDENCIES.filter((item) => visible(item.from) && visible(item.to)).map((item) => (
            <li key={item.id}>{copy.gameConnection}: {nameFor(item.from)} → {nameFor(item.to)}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}