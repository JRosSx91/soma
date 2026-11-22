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
import { KnowledgeConceptDetail } from "../knowledge/KnowledgeBrowser.js";
import { KnowledgePrototypeTree, PrototypeIllustration } from "../knowledge/KnowledgePrototypeTree.js";
import { KNOWLEDGE_PROTOTYPE_COPY } from "../knowledge/knowledge-prototype-copy.js";
import {
  KNOWLEDGE_PROTOTYPE_CATALOG,
  KNOWLEDGE_PROTOTYPE_DEPENDENCIES,
  KNOWLEDGE_PROTOTYPE_NODES,
  prototypeNodesForScenario,
  type KnowledgePrototypeScenario,
} from "../knowledge/knowledge-prototype-fixture.js";
import {
  KNOWLEDGE_CONCEPT_QUERY_KEY,
  resolveKnowledgeConceptParam,
  sanitizeKnowledgeSearchParams,
  writeKnowledgeConceptSearchParams,
} from "../knowledge/knowledge-browser-model.js";
import type { KnowledgeConceptId } from "../knowledge/knowledge-types.js";
import { discoveryCost } from "../knowledge/knowledge-prototype-game-engine.js";
import type { PrototypeUpgradeId } from "../knowledge/knowledge-prototype-game-config.js";
import { useKnowledgePrototypeGame } from "../knowledge/useKnowledgePrototypeGame.js";

const QA_SCENARIOS: readonly KnowledgePrototypeScenario[] = ["start", "middle", "advanced"];

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

  return (
    <div
      data-knowledge-prototype="game-01e.2"
      className={`${collapsed ? SHELL_HERO_BLEED_COLLAPSED_CLASS : SHELL_HERO_BLEED_EXPANDED_CLASS} flex h-[calc(100dvh-7.25rem)] min-h-[36rem] min-w-0 flex-col overflow-hidden border-y border-soma-line/40 bg-[#050d15] lg:h-[calc(100dvh-0.75rem)] lg:min-h-[44rem] lg:border`}
    >
      <PrototypePlayHeader
        language={language}
        sparksLabel={qaScenario ? "0" : game.sparksDisplay}
        productionRate={qaScenario ? "0" : game.productionPerSecondDisplay}
        discovered={qaScenario ? nodes.filter((n) => n.state === "discovered").length : game.discoveredCount}
        total={KNOWLEDGE_PROTOTYPE_NODES.length}
        onAnalyze={game.analyze}
        onReset={() => {
          setQaScenario(null);
          game.reset();
          selectConcept(null);
        }}
        qaScenario={qaScenario}
        onQaScenarioChange={setQaScenario}
        upgrades={game.upgrades}
        onBuyUpgrade={game.buyUpgrade}
        statusMessage={game.discoveryPulse > 0 ? copy.game.discoveryDone : game.lastError ? copy.game.errors[game.lastError] : null}
      />

      {invalidSelection ? (
        <p role="status" className="border-b border-soma-line/60 bg-soma-warning/10 px-4 py-2 text-xs text-soma-ink-secondary">
          {copy.invalidConcept}
        </p>
      ) : null}

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
        onMapAnalyze={qaScenario ? undefined : game.analyze}
      />

      {selected && selectedNode && selectedNode.state === "discovered" ? (
        <DetailSheet title={selected.labels[language]} size="article" onClose={() => selectConcept(null)}>
          <KnowledgeConceptDetail
            concept={selected}
            catalog={activeCatalog}
            language={language}
            onSelect={selectConcept}
            illustration={<PrototypeIllustration kind={selectedNode.illustration} label={selected.labels[language]} language={language} />}
          />
        </DetailSheet>
      ) : null}
    </div>
  );
}

function PrototypePlayHeader({
  language,
  sparksLabel,
  productionRate,
  discovered,
  total,
  onAnalyze,
  onReset,
  qaScenario,
  onQaScenarioChange,
  upgrades,
  onBuyUpgrade,
  statusMessage,
}: {
  language: "es" | "en";
  sparksLabel: string;
  productionRate: string;
  discovered: number;
  total: number;
  onAnalyze: () => void;
  onReset: () => void;
  qaScenario: KnowledgePrototypeScenario | null;
  onQaScenarioChange: (value: KnowledgePrototypeScenario | null) => void;
  upgrades: ReturnType<typeof useKnowledgePrototypeGame>["upgrades"];
  onBuyUpgrade: (id: PrototypeUpgradeId) => void;
  statusMessage: string | null;
}) {
  const copy = KNOWLEDGE_PROTOTYPE_COPY[language];
  const playing = qaScenario === null;
  return (
    <header className="relative z-30 shrink-0 border-b border-soma-line/60 bg-[#07131e]/95 px-3 py-2 shadow-[0_8px_28px_rgb(1_7_12/0.35)] backdrop-blur-md sm:px-4 lg:px-5">
      <div className="flex min-w-0 flex-wrap items-center gap-2 lg:flex-nowrap lg:gap-3">
        <div className="mr-auto min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-soma-shell-accent sm:text-[10px]">
            {copy.eyebrow}
          </p>
          <h1 className="truncate text-base font-semibold text-soma-ink sm:text-lg">
            {copy.centreTitle}
          </h1>
        </div>

        <div className="order-3 flex w-full items-center gap-2 overflow-x-auto pb-0.5 lg:order-none lg:w-auto lg:overflow-visible lg:pb-0">
          <ResourceStat label={copy.resources.sparks} value={sparksLabel} emphasized={playing} title={copy.resources.perSecondHint} />
          <ResourceStat label={copy.resources.production} value={copy.resources.perSecond(productionRate)} compact title={copy.resources.perSecondHint} />
          <ResourceStat label={copy.resources.discoveries} value={`${discovered}/${total}`} />
        </div>

        {playing ? (
          <button
            type="button"
            onClick={onAnalyze}
            className={`${previewFocus} order-4 min-h-10 shrink-0 rounded-lg border border-soma-shell-accent/60 bg-soma-shell-accent/15 px-3 text-xs font-semibold uppercase tracking-wide text-soma-shell-accent hover:bg-soma-shell-accent/25 lg:order-none`}
            title={copy.game.analyzeHint}
          >
            {copy.game.analyze}
          </button>
        ) : null}

        <button
          type="button"
          onClick={onReset}
          className={`${previewFocus} order-5 min-h-8 shrink-0 rounded-lg border border-soma-line/60 bg-[#0b1b28] px-2.5 text-[10px] font-semibold uppercase tracking-wide text-soma-ink-secondary hover:text-soma-ink`}
        >
          {copy.game.reset}
        </button>

        <div className="flex shrink-0 items-center gap-1">
          <HeaderDetails label={copy.game.upgradesSummary}>
            <PrototypeUpgradePanel language={language} upgrades={upgrades} onBuy={onBuyUpgrade} playing={playing} />
          </HeaderDetails>
          <HeaderDetails label={copy.legendTitle}>
            <PrototypeLegend language={language} />
          </HeaderDetails>
          <HeaderDetails label={copy.demoTitle} alignRight>
            <div className="space-y-3">
              <p className="max-w-xs text-xs leading-relaxed text-soma-ink-secondary">
                <strong className="text-soma-warning">{copy.noticeTitle}</strong>{" "}
                {copy.noticeBody}
              </p>
              <details className="rounded-lg border border-soma-line/50 bg-[#050d15]/80 p-2" data-dev-qa-scenarios="true">
                <summary className={`${previewFocus} cursor-pointer text-[10px] font-semibold uppercase tracking-wide text-soma-ink-muted`}>
                  {copy.game.qaScenarios}
                </summary>
                <div className="mt-2 flex flex-wrap gap-1">
                  <QaScenarioButton active={qaScenario === null} onClick={() => onQaScenarioChange(null)} label={language === "es" ? "Jugar" : "Play"} />
                  {QA_SCENARIOS.map((item) => (
                    <QaScenarioButton
                      key={item}
                      active={qaScenario === item}
                      onClick={() => onQaScenarioChange(item)}
                      label={copy.scenarios[item]}
                    />
                  ))}
                </div>
              </details>
            </div>
          </HeaderDetails>
        </div>
      </div>
      {statusMessage ? (
        <p role="status" className="mt-2 rounded-lg border border-soma-shell-accent/30 bg-soma-shell-accent/10 px-3 py-1.5 text-xs text-soma-ink">
          {statusMessage}
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
  upgrades,
  onBuy,
  playing,
}: {
  language: "es" | "en";
  upgrades: ReturnType<typeof useKnowledgePrototypeGame>["upgrades"];
  onBuy: (id: PrototypeUpgradeId) => void;
  playing: boolean;
}) {
  const copy = KNOWLEDGE_PROTOTYPE_COPY[language];
  return (
    <div className="max-h-64 space-y-2 overflow-y-auto text-xs text-soma-ink-secondary">
      <p className="font-semibold text-soma-ink">{copy.game.upgradesTitle}</p>
      {upgrades.map((offer) => {
        const meta = copy.game.upgrades[offer.id];
        return (
          <div key={offer.id} className="rounded-lg border border-soma-line/50 bg-[#050d15]/70 p-2">
            <p className="font-semibold text-soma-ink">{meta.name}</p>
            <p className="mt-1 leading-relaxed text-soma-ink-muted">{meta.description}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wide text-soma-ink-muted">
              {copy.game.level(offer.level, offer.maxLevel)}
            </p>
            {playing ? (
              <button
                type="button"
                disabled={offer.maxed || offer.locked || !offer.affordable}
                onClick={() => onBuy(offer.id)}
                className={`${previewFocus} mt-2 min-h-8 w-full rounded-md border px-2 text-[10px] font-semibold uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-50 ${offer.affordable ? "border-soma-shell-accent/50 text-soma-shell-accent" : "border-soma-line/50 text-soma-ink-muted"}`}
              >
                {offer.maxed ? copy.game.owned : offer.locked ? copy.game.locked : offer.cost ? `${copy.game.buy} · ${copy.game.cost(offer.cost)}` : copy.game.locked}
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function ResourceStat({ label, value, emphasized = false, compact = false, title }: {
  label: string;
  value: string;
  emphasized?: boolean;
  compact?: boolean;
  title?: string;
}) {
  return (
    <div title={title} className={`${compact ? "hidden sm:block" : "block"} min-w-max rounded-lg border px-2.5 py-1 ${emphasized ? "border-soma-warning/40 bg-soma-warning/10" : "border-soma-line/50 bg-[#0b1b28]"}`}>
      <span className="block text-[9px] uppercase tracking-wide text-soma-ink-muted">{label}</span>
      <span className="flex items-baseline gap-1 text-sm font-semibold text-soma-ink">{value}</span>
    </div>
  );
}

function HeaderDetails({ label, alignRight = false, children }: { label: string; alignRight?: boolean; children: React.ReactNode }) {
  return (
    <details className="group relative">
      <summary className={`${previewFocus} flex min-h-8 cursor-pointer list-none items-center rounded-lg border border-soma-line/50 bg-[#0b1b28] px-2 text-[10px] font-semibold text-soma-ink-secondary hover:text-soma-ink`}>
        {label}
      </summary>
      <div className={`absolute top-[calc(100%+0.5rem)] z-50 w-72 rounded-xl border border-soma-line bg-[#0b1b28] p-3 shadow-xl ${alignRight ? "right-0" : "left-0"}`}>
        {children}
      </div>
    </details>
  );
}

function PrototypeLegend({ language }: { language: "es" | "en" }) {
  const copy = KNOWLEDGE_PROTOTYPE_COPY[language];
  return (
    <div className="space-y-2 text-xs text-soma-ink-secondary">
      <span className="flex items-center gap-2"><span aria-hidden="true" className="w-8 border-t-[3px] border-[#68d8c0]" />{copy.scientificConnection}</span>
      <span className="flex items-center gap-2"><span aria-hidden="true" className="w-8 border-t-[3px] border-dashed border-[#a78bfa]" />{copy.gameConnection}</span>
      <span className="flex items-center gap-2"><span aria-hidden="true" className="flex h-6 w-8 items-center justify-center rounded border border-dashed border-soma-line text-soma-ink-muted">?</span>{copy.unknownDiscovery}</span>
      <p className="leading-relaxed text-soma-ink-muted">{copy.legendNotice}</p>
    </div>
  );
}