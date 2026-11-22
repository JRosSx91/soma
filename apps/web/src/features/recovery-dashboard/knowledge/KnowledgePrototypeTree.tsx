import { useEffect, useId, useRef, useState } from "react";
import { previewFocus } from "../focus.js";
import type {
  KnowledgePrototypeDependency,
  KnowledgePrototypeIllustration,
  KnowledgePrototypeScenarioNode,
  KnowledgePrototypeState,
} from "./knowledge-prototype-fixture.js";
import type { KnowledgeCatalog, KnowledgeConcept, KnowledgeConceptId } from "./knowledge-types.js";
import {
  buildPrototypeLayout,
  visibleFrameHeight,
  type PrototypeCanvasMetrics,
} from "./knowledge-prototype-layout.js";
import { prototypeCardFootprint } from "./knowledge-prototype-organic-layout.js";
import {
  buildRenderedConnections,
  connectionStrokeStyle,
  exploredFrontierY,
  verticalFlowPath,
} from "./knowledge-prototype-connections.js";
import { KNOWLEDGE_PROTOTYPE_COPY } from "./knowledge-prototype-copy.js";
import {
  buildStratumZones,
  stratumPatternNodes,
  type PrototypeStratumZone,
} from "./knowledge-prototype-strata.js";
import { isBackgroundTapKey, keyboardTapTargetsBackground, pointerDragCancelsTap } from "./knowledge-prototype-tap.js";

const DESKTOP_METRICS: PrototypeCanvasMetrics = {
  width: 1000,
  top: 92,
  rowGap: 200,
  sideMargin: 130,
  cardHalfHeight: 96,
};

const MOBILE_METRICS: PrototypeCanvasMetrics = {
  width: 360,
  top: 84,
  rowGap: 198,
  sideMargin: 72,
  cardHalfHeight: 88,
};

export function KnowledgePrototypeTree({
  catalog,
  nodes,
  dependencies,
  language,
  selectedId,
  onSelect,
  onDiscover,
  discoveryCost,
  canDiscover,
  onBackgroundTap,
  scenarioKey,
}: {
  catalog: KnowledgeCatalog;
  nodes: readonly KnowledgePrototypeScenarioNode[];
  dependencies: readonly KnowledgePrototypeDependency[];
  language: "es" | "en";
  selectedId: KnowledgeConceptId | null;
  onSelect: (id: KnowledgeConceptId) => void;
  onDiscover?: (id: KnowledgeConceptId) => void;
  discoveryCost?: (id: KnowledgeConceptId) => number;
  canDiscover?: (id: KnowledgeConceptId) => boolean;
  onBackgroundTap?: () => void;
  scenarioKey?: string;
}) {
  const copy = KNOWLEDGE_PROTOTYPE_COPY[language];
  const [mobileCluster, setMobileCluster] = useState<1 | 2 | 3 | 4>(1);
  const concepts = new Map(catalog.concepts.map((concept) => [concept.id, concept]));
  const visibleIds = new Set(nodes.filter((node) => node.state !== "hidden").map((node) => node.id));
  const relations = catalog.relations.filter(
    (relation) => visibleIds.has(relation.subject) && visibleIds.has(relation.object),
  );
  const visibleDependencies = dependencies.filter(
    (dependency) => visibleIds.has(dependency.from) && visibleIds.has(dependency.to),
  );
  const states = new Map(nodes.map((node) => [node.id, node.state]));
  const labelFor = (id: KnowledgeConceptId) =>
    states.get(id) === "hinted"
      ? copy.unknownDiscovery
      : concepts.get(id)?.labels[language] ?? copy.unknownDiscovery;

  return (
    <section
      data-prototype-map="true"
      data-prototype-layout="vertical"
      data-prototype-layout-organic="true"
      data-prototype-background="strata"
      aria-labelledby="knowledge-prototype-tree-title"
      className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-[#040a11]"
    >
      <h2 id="knowledge-prototype-tree-title" className="sr-only">{copy.mapTitle}</h2>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(182deg,#060f18_0%,#051018_38%,#040b12_68%,#060a10_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_52%_at_50%_-4%,rgb(42_132_166_/_0.22),transparent_58%),radial-gradient(ellipse_48%_40%_at_12%_52%,rgb(95_68_150_/_0.14),transparent_62%),radial-gradient(ellipse_42%_36%_at_88%_48%,rgb(56_110_140_/_0.12),transparent_64%)]" />
        <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgb(140_210_196_/_0.05)_1px,transparent_1px),linear-gradient(90deg,rgb(140_210_196_/_0.05)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,rgb(104_216_192_/_0.08),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(0deg,rgb(74_48_120_/_0.12),transparent)]" />
      </div>

      <div
        key={scenarioKey}
        className={`relative h-full overflow-x-hidden overflow-y-auto overscroll-contain px-2 pb-8 pt-4 [scrollbar-gutter:stable] sm:px-4${scenarioKey ? " knowledge-prototype-scenario-enter" : ""}`}
      >
        <PrototypeCanvas variant="desktop" metrics={DESKTOP_METRICS} catalog={catalog} nodes={nodes} dependencies={visibleDependencies} relations={relations} language={language} selectedId={selectedId} onSelect={onSelect} onDiscover={onDiscover} discoveryCost={discoveryCost} canDiscover={canDiscover} onBackgroundTap={onBackgroundTap} />
        <PrototypeCanvas variant="mobile" cluster={mobileCluster} onClusterChange={setMobileCluster} metrics={MOBILE_METRICS} catalog={catalog} nodes={nodes} dependencies={visibleDependencies} relations={relations} language={language} selectedId={selectedId} onSelect={onSelect} onDiscover={onDiscover} discoveryCost={discoveryCost} canDiscover={canDiscover} onBackgroundTap={onBackgroundTap} />

        <details data-prototype-map-ignore="true" className="relative mx-auto mt-2 max-w-4xl rounded-xl border border-soma-line/60 bg-[#091722]/90 px-4 py-3">
          <summary className={`${previewFocus} cursor-pointer rounded text-sm font-medium text-soma-action`}>
            {copy.connectionList}
          </summary>
          <ul className="mt-3 grid gap-2 text-xs leading-relaxed text-soma-ink-secondary sm:grid-cols-2">
            {relations.map((relation) => (
              <li key={relation.id} className="rounded-lg border border-[#68d8c0]/25 bg-[#68d8c0]/5 px-3 py-2">
                <strong className="text-[#8ce6d3]">{copy.scientificConnection}:</strong>{" "}
                {labelFor(relation.subject)} → {labelFor(relation.object)}
              </li>
            ))}
            {visibleDependencies.map((dependency) => (
              <li key={dependency.id} className="rounded-lg border border-[#a78bfa]/25 bg-[#a78bfa]/5 px-3 py-2">
                <strong className="text-[#c4b5fd]">{copy.gameConnection}:</strong>{" "}
                {labelFor(dependency.from)} → {labelFor(dependency.to)}
              </li>
            ))}
          </ul>
        </details>
      </div>
    </section>
  );
}

const TAP_RIPPLE_POOL = 16;

function PrototypeMapTapLayer({ onTap, label }: { onTap: () => void; label: string }) {
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);
  const pool = useRef<Array<HTMLSpanElement | null>>([]);
  const poolIndex = useRef(0);
  const reducedMotion = useRef(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return undefined;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      reducedMotion.current = query.matches;
    };
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  function showRipple(x: number, y: number) {
    if (reducedMotion.current) return;
    const ripple = pool.current[poolIndex.current];
    poolIndex.current = (poolIndex.current + 1) % TAP_RIPPLE_POOL;
    if (!ripple) return;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.remove("is-on");
    void ripple.offsetWidth;
    ripple.classList.add("is-on");
  }

  return (
    <div
      data-prototype-map-tap-surface="true"
      tabIndex={0}
      aria-label={label}
      className="absolute inset-0 z-[5] touch-manipulation outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-soma-shell-accent"
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        pointer.current = { x: event.clientX, y: event.clientY };
        dragged.current = false;
      }}
      onPointerMove={(event) => {
        if (!pointer.current) return;
        const dx = event.clientX - pointer.current.x;
        const dy = event.clientY - pointer.current.y;
        if (pointerDragCancelsTap(dx, dy)) dragged.current = true;
      }}
      onPointerUp={(event) => {
        if (event.button !== 0 || dragged.current || !pointer.current) {
          pointer.current = null;
          dragged.current = false;
          return;
        }
        const rect = event.currentTarget.getBoundingClientRect();
        showRipple(event.clientX - rect.left, event.clientY - rect.top);
        onTap();
        pointer.current = null;
      }}
      onPointerCancel={() => {
        pointer.current = null;
        dragged.current = false;
      }}
      onKeyDown={(event) => {
        if (!keyboardTapTargetsBackground(event.target, event.currentTarget)) return;
        if (!isBackgroundTapKey(event.key)) return;
        event.preventDefault();
        const rect = event.currentTarget.getBoundingClientRect();
        showRipple(rect.width / 2, rect.height / 2);
        onTap();
      }}
    >
      {Array.from({ length: TAP_RIPPLE_POOL }, (_, index) => (
        <span
          key={index}
          ref={(node) => {
            pool.current[index] = node;
          }}
          aria-hidden="true"
          className="knowledge-prototype-tap-ripple pointer-events-none absolute h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-soma-shell-accent/70 bg-soma-shell-accent/15"
        />
      ))}
    </div>
  );
}

function StratumPattern({
  zone,
  layoutWidth,
  canvasPrefix,
}: {
  zone: PrototypeStratumZone;
  layoutWidth: number;
  canvasPrefix: string;
}) {
  const clipId = `${canvasPrefix}-clip-${zone.id}`;
  const patterns = stratumPatternNodes(zone, layoutWidth, canvasPrefix);
  return (
    <g clipPath={`url(#${clipId})`} aria-hidden="true">
      {patterns.map((item) => {
        if (item.element === "circle") {
          return <circle key={item.key} {...item.attrs} />;
        }
        if (item.element === "ellipse") {
          return <ellipse key={item.key} {...item.attrs} />;
        }
        return <path key={item.key} {...item.attrs} />;
      })}
    </g>
  );
}

function PrototypeCanvas({
  variant,
  metrics,
  catalog,
  nodes,
  dependencies,
  relations,
  language,
  selectedId,
  onSelect,
  onDiscover,
  discoveryCost,
  canDiscover,
  onBackgroundTap,
  cluster,
  onClusterChange,
}: {
  variant: "desktop" | "mobile";
  cluster?: 1 | 2 | 3 | 4;
  onClusterChange?: (cluster: 1 | 2 | 3 | 4) => void;
  metrics: PrototypeCanvasMetrics;
  catalog: KnowledgeCatalog;
  nodes: readonly KnowledgePrototypeScenarioNode[];
  dependencies: readonly KnowledgePrototypeDependency[];
  relations: KnowledgeCatalog["relations"];
  language: "es" | "en";
  selectedId: KnowledgeConceptId | null;
  onSelect: (id: KnowledgeConceptId) => void;
  onDiscover?: (id: KnowledgeConceptId) => void;
  discoveryCost?: (id: KnowledgeConceptId) => number;
  canDiscover?: (id: KnowledgeConceptId) => boolean;
  onBackgroundTap?: () => void;
}) {
  const copy = KNOWLEDGE_PROTOTYPE_COPY[language];
  const layout = buildPrototypeLayout(nodes, dependencies, metrics);
  const inMobileCluster = (item: (typeof layout.nodes)[number]) => {
    if (cluster === undefined) return true;
    if (item.node.sequence === 23) return cluster === 1;
    return item.node.cluster === cluster;
  };
  const framedNodes = layout.nodes.filter(inMobileCluster);
  const frameOrigin = variant === "mobile" && framedNodes.length > 0
    ? Math.min(...framedNodes.map((item) => item.y)) - metrics.cardHalfHeight - 28
    : 0;
  const shift = (point: { x: number; y: number }) => ({ x: point.x, y: point.y - frameOrigin });
  const positions = new Map(framedNodes.map((item) => [item.node.id, shift(item)]));
  const renderedNodes = framedNodes
    .filter((item) => item.node.state !== "hidden")
    .map((item) => ({ ...item, ...shift(item) }));
  if (variant === "mobile") {
    const packed = [...renderedNodes].sort((a, b) => a.y - b.y || a.node.sequence - b.node.sequence);
    let cursor = metrics.cardHalfHeight + 28;
    const step = metrics.cardHalfHeight * 2 + 28;
    for (const item of packed) {
      item.y = cursor;
      positions.set(item.node.id, { x: item.x, y: cursor });
      cursor += step;
    }
  }
  const canvasHeight = variant === "mobile"
    ? renderedNodes.length === 0
      ? 168
      : Math.max(...renderedNodes.map((item) => item.y)) + metrics.cardHalfHeight + 96
    : visibleFrameHeight(layout, metrics);
  const concepts = new Map(catalog.concepts.map((concept) => [concept.id, concept]));
  const stateById = new Map(nodes.map((node) => [node.id, node.state]));
  const laneScale = variant === "mobile" ? 0.72 : 1;
  const cardHalfWidth = prototypeCardFootprint(metrics).halfWidth;
  const connections = buildRenderedConnections(relations, dependencies, positions, laneScale);
  const frontierY = exploredFrontierY(
    renderedNodes.length > 0 ? renderedNodes : layout.nodes,
    metrics.top,
  );
  const stratumZones = buildStratumZones(metrics, frontierY, canvasHeight);
  const canvasPrefix = `${variant}-visual04`;

  const clusterTabs = variant === "mobile" && cluster !== undefined && onClusterChange ? (
    <div data-prototype-cluster-tabs="true" data-prototype-map-ignore="true" className="mb-3 grid grid-cols-2 gap-1.5">
      {([1, 2, 3, 4] as const).map((item) => {
        const pending = nodes.some((node) => (
          (node.sequence === 23 ? item === 1 : node.cluster === item)
          && (node.state === "available" || node.state === "researching")
        ));
        return (
          <button
            key={item}
            type="button"
            data-prototype-cluster-tab={item}
            aria-pressed={cluster === item}
            onClick={() => onClusterChange(item)}
            className={`${previewFocus} min-h-11 rounded-lg border px-2 text-left text-[11px] font-semibold leading-tight ${cluster === item ? "border-soma-shell-accent/70 bg-soma-shell-accent/15 text-soma-ink" : "border-soma-line/50 bg-[#07131e] text-soma-ink-secondary"}`}
          >
            {copy.game.clusters[item]}
            {pending ? <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-soma-shell-accent" /> : null}
          </button>
        );
      })}
    </div>
  ) : null;

  return (
    <div
      data-prototype-canvas={variant}
      data-prototype-cluster={cluster}
      className={variant === "desktop" ? "relative mx-auto hidden w-full max-w-[72rem] lg:block" : "relative mx-auto w-full max-w-[24rem] lg:hidden"}
    >
      {clusterTabs}
      {variant === "mobile" && renderedNodes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-soma-line/60 px-3 py-6 text-center text-sm text-soma-ink-secondary">{copy.game.clusterClosed}</p>
      ) : null}
      <div className="relative" style={{ height: `${canvasHeight}px` }}>
      <svg viewBox={`0 0 ${layout.width} ${canvasHeight}`} preserveAspectRatio="none" aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2] h-full w-full" data-prototype-map-connections="true">
        <defs>
          {stratumZones.map((zone) => (
            <linearGradient key={`${zone.id}-veil`} id={`${canvasPrefix}-stratum-${zone.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={zone.veilTop} stopOpacity={0.88 * zone.opacity} />
              <stop offset="42%" stopColor={zone.veilTop} stopOpacity={0.55 * zone.opacity} />
              <stop offset="100%" stopColor={zone.veilBottom} stopOpacity={0.35 * zone.opacity} />
            </linearGradient>
          ))}
          <linearGradient id={`${canvasPrefix}-explored-wash`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a4a62" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#12374a" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id={`${canvasPrefix}-unknown-wash`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a1630" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#120d1e" stopOpacity="0.2" />
          </linearGradient>
          <filter id={`${canvasPrefix}-glow`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="18" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker id={`${canvasPrefix}-prototype-science-arrow`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0 0 10 5 0 10z" fill="#78e2cb" />
          </marker>
          <marker id={`${canvasPrefix}-prototype-game-arrow`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
            <path d="M0 0 10 5 0 10z" fill="#c4b5fd" />
          </marker>
          {connections.map((connection) => {
            const from = positions.get(connection.from);
            const to = positions.get(connection.to);
            if (!from || !to || stateById.get(connection.to) !== "hinted") return null;
            const color = connection.kind === "scientific" ? "#68d8c0" : "#a78bfa";
            return (
              <linearGradient key={`gradient-${connection.kind}-${connection.id}`} id={`${canvasPrefix}-${connection.kind}-fade-${connection.index}`} gradientUnits="userSpaceOnUse" x1={from.x} y1={from.y} x2={to.x} y2={to.y}>
                <stop offset="0" stopColor={color} stopOpacity={connection.kind === "game" ? "0.88" : "0.72"} />
                <stop offset="0.68" stopColor={color} stopOpacity="0.34" />
                <stop offset="1" stopColor={color} stopOpacity="0.04" />
              </linearGradient>
            );
          })}
          {stratumZones.map((zone) => (
            <clipPath key={`clip-${zone.id}`} id={`${canvasPrefix}-clip-${zone.id}`}>
              <rect x={0} y={zone.y0} width={layout.width} height={zone.y1 - zone.y0} />
            </clipPath>
          ))}
        </defs>

        <g data-prototype-stratum-layer="true">
          {stratumZones.map((zone) => (
            <g key={zone.id} data-prototype-stratum={zone.id} opacity={zone.opacity}>
              <rect x={0} y={zone.y0} width={layout.width} height={zone.y1 - zone.y0} fill={`url(#${canvasPrefix}-stratum-${zone.id})`} />
              <rect
                x={layout.width * 0.2}
                y={zone.y0 + 8}
                width={layout.width * 0.6}
                height={zone.y1 - zone.y0 - 16}
                rx={28}
                fill={zone.glow}
                opacity={0.06 * zone.opacity}
              />
              <StratumPattern zone={zone} layoutWidth={layout.width} canvasPrefix={canvasPrefix} />
            </g>
          ))}
        </g>

        <rect width={layout.width} height={Math.max(frontierY + metrics.cardHalfHeight, metrics.top)} fill={`url(#${canvasPrefix}-explored-wash)`} />
        <rect y={frontierY - metrics.cardHalfHeight * 0.4} width={layout.width} height={canvasHeight - frontierY + metrics.cardHalfHeight * 0.4} fill={`url(#${canvasPrefix}-unknown-wash)`} />

        {layout.nodes.map(({ node, x, y }) => {
          if (node.state === "hidden") return null;
          const haloColor = node.state === "hinted" ? "#a78bfa" : node.state === "discovered" ? "#68d8c0" : "#4f9ed0";
          const haloOpacity = node.state === "hinted" ? 0.08 : node.state === "discovered" ? 0.12 : 0.07;
          return (
            <ellipse
              key={`halo-${node.id}`}
              cx={x}
              cy={y}
              rx={variant === "desktop" ? 112 : 84}
              ry={variant === "desktop" ? 54 : 44}
              fill={haloColor}
              opacity={haloOpacity}
              filter={`url(#${canvasPrefix}-glow)`}
            />
          );
        })}

        <g data-prototype-connection-layer="scientific">
          {connections.filter((connection) => connection.kind === "scientific").map((connection) => {
            const from = positions.get(connection.from);
            const to = positions.get(connection.to);
            if (!from || !to) return null;
            const fromState = stateById.get(connection.from) ?? "hidden";
            const toState = stateById.get(connection.to) ?? "hidden";
            if (fromState === "hidden" || toState === "hidden") return null;
            const mysteryTarget = toState === "hinted";
            const stroke = connectionStrokeStyle("scientific", fromState, toState);
            return (
              <path
                key={`${connection.kind}-${connection.id}`}
                data-prototype-connection="scientific"
                data-prototype-shared-pair={connection.sharesPair ? "true" : undefined}
                data-prototype-fades={mysteryTarget ? "true" : undefined}
                d={verticalFlowPath(
                  from,
                  to,
                  metrics.cardHalfHeight,
                  connection.laneOffset,
                  connection.id,
                  cardHalfWidth,
                )}
                fill="none"
                stroke={mysteryTarget ? `url(#${canvasPrefix}-${connection.kind}-fade-${connection.index})` : "#68d8c0"}
                strokeWidth={stroke.width}
                strokeDasharray={stroke.dash}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                markerEnd={mysteryTarget ? undefined : `url(#${canvasPrefix}-prototype-science-arrow)`}
                opacity={mysteryTarget ? 1 : stroke.opacity}
              />
            );
          })}
        </g>
        <g data-prototype-connection-layer="game">
          {connections.filter((connection) => connection.kind === "game").map((connection) => {
            const from = positions.get(connection.from);
            const to = positions.get(connection.to);
            if (!from || !to) return null;
            const fromState = stateById.get(connection.from) ?? "hidden";
            const toState = stateById.get(connection.to) ?? "hidden";
            if (fromState === "hidden" || toState === "hidden") return null;
            const mysteryTarget = toState === "hinted";
            const stroke = connectionStrokeStyle("game", fromState, toState);
            return (
              <path
                key={`${connection.kind}-${connection.id}`}
                data-prototype-connection="game"
                data-prototype-shared-pair={connection.sharesPair ? "true" : undefined}
                data-prototype-fades={mysteryTarget ? "true" : undefined}
                d={verticalFlowPath(
                  from,
                  to,
                  metrics.cardHalfHeight,
                  connection.laneOffset,
                  connection.id,
                  cardHalfWidth,
                )}
                fill="none"
                stroke={mysteryTarget ? `url(#${canvasPrefix}-${connection.kind}-fade-${connection.index})` : "#a78bfa"}
                strokeWidth={stroke.width}
                strokeDasharray={stroke.dash}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                markerEnd={mysteryTarget ? undefined : `url(#${canvasPrefix}-prototype-game-arrow)`}
                opacity={mysteryTarget ? 1 : stroke.opacity}
              />
            );
          })}
        </g>
      </svg>

      {onBackgroundTap ? <PrototypeMapTapLayer onTap={onBackgroundTap} label={copy.game.tapSurface} /> : null}

      <div className="pointer-events-none absolute inset-0 z-[15]">
        {renderedNodes.map(({ node, x, y }) => {
          const concept = concepts.get(node.id);
          const widthClass = cardWidthClass(node.visualRole, variant);
          return (
            <div key={node.id} data-prototype-map-ignore="true" data-prototype-role={node.visualRole} data-prototype-code={node.provisionalCode} className={`pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 ${widthClass}`} style={{ left: `${(x / layout.width) * 100}%`, top: `${y}px` }}>
              {node.state === "hinted" ? (
                <PrototypeMysteryCard language={language} />
              ) : concept ? (
                <PrototypeCard concept={concept} node={node} language={language} selected={selectedId === node.id} onSelect={onSelect} onDiscover={onDiscover} discoveryCost={discoveryCost} canDiscover={canDiscover} />
              ) : null}
            </div>
          );
        })}
      </div>
      <p className="sr-only">{copy.verticalFlowNotice}</p>
      </div>
    </div>
  );
}

function PrototypeMysteryCard({ language }: { language: "es" | "en" }) {
  const copy = KNOWLEDGE_PROTOTYPE_COPY[language];
  return (
    <div role="img" aria-label={copy.unknownDiscovery} data-prototype-mystery="true" data-prototype-state="hinted" className="relative min-h-40 w-full overflow-hidden rounded-2xl border border-dashed border-soma-line/60 bg-[#09121d]/80 shadow-[0_14px_38px_rgb(1_7_12/0.55)]">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgb(167_139_250_/_0.18),transparent_34%),linear-gradient(135deg,transparent_25%,rgb(104_216_192_/_0.06)_50%,transparent_75%)]" />
      <div aria-hidden="true" className="absolute inset-x-6 top-6 h-20 rounded-full bg-[#121f2e] blur-md" />
      <div className="relative flex min-h-40 flex-col items-center justify-center gap-3 px-3 text-center">
        <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-soma-ink-muted/50 bg-[#08121c] text-2xl font-semibold text-soma-ink-muted">?</span>
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-soma-ink-muted">{copy.unknownDiscovery}</span>
      </div>
    </div>
  );
}

function PrototypeCard({ concept, node, language, selected, onSelect, onDiscover, discoveryCost, canDiscover }: {
  concept: KnowledgeConcept;
  node: KnowledgePrototypeScenarioNode;
  language: "es" | "en";
  selected: boolean;
  onSelect: (id: KnowledgeConceptId) => void;
  onDiscover?: (id: KnowledgeConceptId) => void;
  discoveryCost?: (id: KnowledgeConceptId) => number;
  canDiscover?: (id: KnowledgeConceptId) => boolean;
}) {
  const copy = KNOWLEDGE_PROTOTYPE_COPY[language];
  const label = concept.labels[language];
  const stateLabel = copy.states[node.state];
  const cost = discoveryCost?.(node.id) ?? 0;
  const affordable = canDiscover?.(node.id) ?? false;

  if (node.state === "available" && onDiscover) {
    return (
      <div data-prototype-node={node.id} data-prototype-state={node.state} data-prototype-cue={node.visualCue} className={`group block w-full min-w-0 overflow-hidden rounded-2xl border text-left shadow-[0_14px_38px_rgb(1_7_12/0.48)] ${roleFrame(node.visualRole)} ${stateClasses(node.state, selected)}`}>
        <PrototypeIllustration kind={node.illustration} label={label} language={language} decorative />
        <div className="block px-3 pb-3 pt-2">
          <CardHeading label={label} stateLabel={stateLabel} state={node.state} />
          <span className="mt-1 block text-[10px] font-medium uppercase tracking-wide text-soma-ink-muted">{stateLabel}</span>
          {node.generator ? <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wide text-soma-warning">{copy.game.generatorMark}</span> : null}
          {node.visualCue === "forward-field" ? <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wide text-[#c4b5fd]">{copy.game.fieldForward}</span> : null}
          <button
            type="button"
            onClick={() => onDiscover(node.id)}
            disabled={!affordable}
            className={`${previewFocus} mt-2 flex min-h-9 w-full items-center justify-center rounded-lg border px-2 text-[10px] font-semibold uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-45 ${affordable ? "border-soma-shell-accent/60 bg-soma-shell-accent/15 text-soma-shell-accent hover:bg-soma-shell-accent/25" : "border-soma-line/50 text-soma-ink-muted"}`}
          >
            {cost === 0 ? copy.game.openExit : copy.game.discoverFor(cost)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button type="button" data-prototype-node={node.id} data-prototype-state={node.state} data-prototype-cue={node.visualCue} aria-current={selected ? "true" : undefined} aria-label={copy.openCard(label, stateLabel)} onClick={() => onSelect(node.id)} className={`${previewFocus} group block w-full min-w-0 overflow-hidden rounded-2xl border text-left shadow-[0_14px_38px_rgb(1_7_12/0.48)] transition motion-reduce:transition-none ${roleFrame(node.visualRole)} ${stateClasses(node.state, selected)}`}>
      <PrototypeIllustration kind={node.illustration} label={label} language={language} decorative />
      <span className="block px-3 pb-3 pt-2">
        <CardHeading label={label} stateLabel={stateLabel} state={node.state} />
        <span className="mt-1 block text-[10px] font-medium uppercase tracking-wide text-soma-ink-muted">{stateLabel}</span>
        {node.generator ? <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wide text-soma-warning">{copy.game.generatorMark}</span> : null}
        {node.visualCue === "forward-field" ? <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wide text-[#c4b5fd]">{copy.game.fieldForward}</span> : null}
        {node.state === "researching" ? (
          <span className="mt-2 block">
            <span className="mb-1 flex justify-between text-[10px] text-soma-ink-muted"><span>{copy.progress}</span><span>{node.progress ?? 0}%</span></span>
            <span role="progressbar" aria-label={copy.progressFor(label)} aria-valuemin={0} aria-valuemax={100} aria-valuenow={node.progress ?? 0} className="block h-1.5 overflow-hidden rounded-full bg-[#07111b]">
              <span className="block h-full rounded-full bg-soma-action" style={{ width: `${node.progress ?? 0}%` }} />
            </span>
          </span>
        ) : null}
        {node.state === "discovered" ? (
          <span className="mt-2 block text-[10px] font-medium uppercase tracking-wide text-soma-action">{copy.game.openSheet}</span>
        ) : null}
      </span>
    </button>
  );
}

function CardHeading({ label, stateLabel, state }: { label: string; stateLabel: string; state: KnowledgePrototypeState }) {
  return (
    <span className="flex items-start justify-between gap-2">
      <span className="min-w-0 break-words text-sm font-semibold leading-tight text-soma-ink">{label}</span>
      <span aria-hidden="true" className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${stateDot(state)}`} />
      <span className="sr-only">{stateLabel}</span>
    </span>
  );
}

export function PrototypeIllustration({ kind, label, language, decorative = false }: { kind: KnowledgePrototypeIllustration; label: string; language: "es" | "en"; decorative?: boolean }) {
  const copy = KNOWLEDGE_PROTOTYPE_COPY[language];
  const prefix = useId().replaceAll(":", "");
  return (
    <svg viewBox="0 0 240 116" role={decorative ? undefined : "img"} aria-hidden={decorative ? "true" : undefined} aria-label={decorative ? undefined : copy.placeholderAlt(label)} className="block h-20 w-full bg-[#0a1723] sm:h-24">
      <defs>
        <linearGradient id={`${prefix}-bg`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#10283a" /><stop offset="0.55" stopColor="#16233c" /><stop offset="1" stopColor="#271b42" /></linearGradient>
        <filter id={`${prefix}-glow`}><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <rect width="240" height="116" fill={`url(#${prefix}-bg)`} />
      <g filter={`url(#${prefix}-glow)`} fill="none" strokeLinecap="round" strokeLinejoin="round"><IllustrationGlyph kind={kind} /></g>
      <text x="12" y="104" fill="#9fb1bf" fontSize="9" letterSpacing="1.2">{copy.placeholder}</text>
    </svg>
  );
}

function roleFrame(role: KnowledgePrototypeScenarioNode["visualRole"]) {
  if (role === "door") return "ring-2 ring-[#68d8c0]";
  if (role === "bridge") return "ring-2 ring-[#c4b5fd]";
  return "";
}

function cardWidthClass(role: KnowledgePrototypeScenarioNode["visualRole"], variant: "desktop" | "mobile") {
  if (role === "compact") return variant === "desktop" ? "w-32" : "w-[7.25rem]";
  if (role === "bridge" || role === "open") return variant === "desktop" ? "w-40" : "w-36";
  return variant === "desktop" ? "w-44" : "w-[8.75rem]";
}

function IllustrationGlyph({ kind }: { kind: KnowledgePrototypeIllustration }) {
  if (kind === "root") return <><circle cx="120" cy="52" r="26" stroke="#68d8c0" strokeWidth="3" /><circle cx="120" cy="52" r="6" fill="#68d8c0" stroke="none" /></>;
  if (kind === "frame") return <><path d="M48 70h144M70 28v72" stroke="#68d8c0" strokeWidth="3" /><circle cx="120" cy="52" r="8" stroke="#c4b5fd" strokeWidth="3" /></>;
  if (kind === "spacetime") return <><path d="M36 78c40-58 128-58 168 0" stroke="#68d8c0" strokeWidth="3" /><path d="M36 40c48 20 120 20 168 0" stroke="#c4b5fd" strokeWidth="2" /></>;
  if (kind === "field") return <><path d="M40 36c30 18 30 28 0 46M80 30c36 20 36 36 0 56M120 26c40 22 40 42 0 64M160 30c36 20 36 36 0 56" stroke="#68d8c0" strokeWidth="2" /></>;
  if (kind === "quantum") return <><circle cx="92" cy="52" r="16" stroke="#68d8c0" strokeWidth="3" /><circle cx="148" cy="52" r="16" stroke="#c4b5fd" strokeWidth="3" /><path d="M108 52h24" stroke="#d7e5ed" strokeWidth="2" strokeDasharray="3 4" /></>;
  if (kind === "bridge") return <><path d="M42 70c26-40 52-40 78 0s52 40 78 0" stroke="#c4b5fd" strokeWidth="3" /><circle cx="120" cy="48" r="7" fill="#68d8c0" stroke="none" /></>;
  if (kind === "door") return <><rect x="78" y="28" width="84" height="62" rx="8" stroke="#68d8c0" strokeWidth="3" /><path d="M120 28v62" stroke="#c4b5fd" strokeWidth="2" /></>;
  if (kind === "open") return <><circle cx="120" cy="52" r="24" stroke="#c4b5fd" strokeWidth="2" strokeDasharray="5 5" /><path d="M120 36v32M104 52h32" stroke="#68d8c0" strokeWidth="2" /></>;
  if (kind === "milestone") return <><circle cx="120" cy="52" r="22" stroke="#68d8c0" strokeWidth="4" /><path d="M120 30v44M98 52h44" stroke="#c4b5fd" strokeWidth="2" /></>;
  return <><circle cx="120" cy="52" r="14" stroke="#9b7bd1" strokeWidth="3" /></>;
}

function stateClasses(state: KnowledgePrototypeState, selected: boolean) {
  if (selected) return "border-white bg-[#17283a] ring-2 ring-soma-focus ring-offset-2 ring-offset-[#07111b]";
  if (state === "discovered") return "border-[#68d8c0]/80 bg-[#102531] hover:border-[#8ce6d3]";
  if (state === "researching") return "border-soma-action bg-[#112638] hover:border-soma-action-hover";
  return "border-[#a78bfa]/80 bg-[#211b36] hover:border-[#c4b5fd]";
}

function stateDot(state: KnowledgePrototypeState) {
  if (state === "discovered") return "bg-[#68d8c0]";
  if (state === "researching") return "bg-soma-action";
  return "bg-[#a78bfa]";
}
