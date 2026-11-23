import { useEffect, useId, useMemo, useRef, useState } from "react";
import { previewFocus } from "../focus.js";
import type {
  KnowledgePrototypeDependency,
  KnowledgePrototypeIllustration,
  KnowledgePrototypeScenarioNode,
  KnowledgePrototypeState,
} from "./knowledge-prototype-fixture.js";
import { PROTOTYPE_COMPACT_SEQUENCES } from "./knowledge-prototype-fixture.js";
import type { KnowledgeCatalog, KnowledgeConcept, KnowledgeConceptId } from "./knowledge-types.js";
import {
  buildPrototypeLayout,
  type PrototypeCanvasMetrics,
} from "./knowledge-prototype-layout.js";
import {
  buildRenderedConnections,
  connectionEmphasis,
  constellationThread,
  playableConnectionRole,
} from "./knowledge-prototype-connections.js";
import { KNOWLEDGE_PROTOTYPE_COPY } from "./knowledge-prototype-copy.js";
import { PROTOTYPE_STRATUM_ORDER } from "./knowledge-prototype-strata.js";
import { CURIOSITY_SPARK_URL, STRATUM_NODE_ART } from "./knowledge-prototype-lookdev.js";
import { isBackgroundTapKey, keyboardTapTargetsBackground, pointerDragCancelsTap } from "./knowledge-prototype-tap.js";
import { clampMapCamera, clampMapScale, frameMapBounds, frameMapCamera, holdMapFocus, mapPointInView, zoomMapCamera, type MapCamera, type MapSize } from "./knowledge-prototype-camera.js";
import { introSafeRect, minimapSafeRect, placeClusterTitles, prototypeDiscPixels, shiftCameraClearOf, type ClearanceNode } from "./knowledge-prototype-composition.js";
import {
  PRESENTATION_HEIGHT,
  PRESENTATION_WIDTH,
  STRATUM_POSITIONS,
  THREAD_BOW,
  captionIsVisible,
  clusterFocusBounds,
  labelSide,
  mapDetail,
} from "./knowledge-prototype-presentation.js";

const DESKTOP_METRICS: PrototypeCanvasMetrics = {
  width: 1000,
  top: 92,
  rowGap: 200,
  sideMargin: 130,
  cardHalfHeight: 96,
};


function readViewport(viewport: HTMLElement) {
  return {
    width: viewport.clientWidth > 20 ? viewport.clientWidth : 360,
    height: viewport.clientHeight > 20 ? viewport.clientHeight : 448,
  };
}

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
  const visibleIds = new Set(nodes.filter((node) => node.state !== "hidden").map((node) => node.id));
  const relations = catalog.relations.filter(
    (relation) => visibleIds.has(relation.subject) && visibleIds.has(relation.object),
  );
  const visibleDependencies = dependencies.filter(
    (dependency) => visibleIds.has(dependency.from) && visibleIds.has(dependency.to),
  );

  return (
    <section
      data-prototype-map="true"
      data-prototype-layout="vertical"
      data-prototype-layout-organic="true"
      data-prototype-background="strata"
      aria-labelledby="knowledge-prototype-tree-title"
      className="relative min-h-0 min-w-0 flex-1 overflow-hidden"
    >
      <h2 id="knowledge-prototype-tree-title" className="sr-only">{copy.mapTitle}</h2>

      <div
        key={scenarioKey}
        className={`relative flex h-full min-h-0 flex-col overflow-hidden${scenarioKey ? " knowledge-prototype-scenario-enter" : ""}`}
      >
        <div className="relative min-h-0 flex-1">
        <div className="absolute inset-0">
        <PrototypeCanvas variant="desktop" metrics={DESKTOP_METRICS} catalog={catalog} nodes={nodes} dependencies={visibleDependencies} relations={relations} language={language} selectedId={selectedId} onSelect={onSelect} onDiscover={onDiscover} discoveryCost={discoveryCost} canDiscover={canDiscover} onBackgroundTap={onBackgroundTap} />
        <PrototypeCanvas variant="mobile" cluster={mobileCluster} onClusterChange={setMobileCluster} metrics={DESKTOP_METRICS} catalog={catalog} nodes={nodes} dependencies={visibleDependencies} relations={relations} language={language} selectedId={selectedId} onSelect={onSelect} onDiscover={onDiscover} discoveryCost={discoveryCost} canDiscover={canDiscover} onBackgroundTap={onBackgroundTap} />
        </div>
        </div>
      </div>
    </section>
  );
}

const TAP_RIPPLE_POOL = 16;

function PrototypeMapTapLayer({
  onTap,
  onPan,
  onPinch,
  label,
}: {
  onTap: () => void;
  onPan?: (dx: number, dy: number) => void;
  onPinch?: (ratio: number, clientX: number, clientY: number) => void;
  label: string;
}) {
  const contacts = useRef(new Map<number, { x: number; y: number }>());
  const dragged = useRef(false);
  const pinchDistance = useRef<number | null>(null);
  const pool = useRef<Array<HTMLSpanElement | null>>([]);
  const poolIndex = useRef(0);
  const reducedMotion = useRef(false);

  function spanOf(points: Array<{ x: number; y: number }>) {
    const first = points[0];
    const second = points[1];
    if (!first || !second) return 0;
    return Math.hypot(first.x - second.x, first.y - second.y);
  }

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
        contacts.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (contacts.current.size === 1) dragged.current = false;
        if (contacts.current.size >= 2) {
          dragged.current = true;
          pinchDistance.current = spanOf([...contacts.current.values()]);
        }
      }}
      onPointerMove={(event) => {
        const origin = contacts.current.get(event.pointerId);
        if (!origin) return;
        contacts.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
        const points = [...contacts.current.values()];
        if (points.length >= 2 && pinchDistance.current) {
          const next = spanOf(points);
          if (next > 0) onPinch?.(next / pinchDistance.current, event.clientX, event.clientY);
          pinchDistance.current = next;
          dragged.current = true;
          return;
        }
        const dx = event.clientX - origin.x;
        const dy = event.clientY - origin.y;
        if (!dragged.current) {
          if (!pointerDragCancelsTap(dx, dy)) return;
          dragged.current = true;
        }
        onPan?.(dx, dy);
        contacts.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      }}
      onPointerUp={(event) => {
        contacts.current.delete(event.pointerId);
        pinchDistance.current = contacts.current.size >= 2 ? spanOf([...contacts.current.values()]) : null;
        if (event.button !== 0 || dragged.current || contacts.current.size > 0) {
          if (contacts.current.size === 0) dragged.current = false;
          return;
        }
        const rect = event.currentTarget.getBoundingClientRect();
        showRipple(event.clientX - rect.left, event.clientY - rect.top);
        onTap();
        dragged.current = false;
      }}
      onPointerCancel={(event) => {
        contacts.current.delete(event.pointerId);
        pinchDistance.current = null;
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
  const scene = useMemo(() => {
    const layout = buildPrototypeLayout(nodes, dependencies, metrics);
    const renderedNodes = layout.nodes
      .filter((item) => item.node.state !== "hidden" && PROTOTYPE_COMPACT_SEQUENCES.has(item.node.sequence))
      .map((item) => {
        const placed = STRATUM_POSITIONS[item.node.sequence];
        return placed ? { ...item, x: placed.x, y: placed.y } : item;
      });
    const positions = new Map(renderedNodes.map((item) => [item.node.id, { x: item.x, y: item.y }]));
    return {
      renderedNodes,
      positions,
      canvasHeight: PRESENTATION_HEIGHT,
      world: { width: PRESENTATION_WIDTH, height: PRESENTATION_HEIGHT },
    };
  }, [nodes, dependencies, metrics]);
  const { renderedNodes, positions, canvasHeight, world } = scene;
  const viewportRef = useRef<HTMLDivElement>(null);
  const viewportSizeRef = useRef({ width: 360, height: 448 });
  const [viewportSize, setViewportSize] = useState({ width: 360, height: 448 });
  const positionsRef = useRef(positions);
  const worldRef = useRef(world);
  const nodesRef = useRef(renderedNodes);
  const [camera, setCamera] = useState<MapCamera>({ x: 0, y: 0, scale: 1 });
  const detail = mapDetail(camera.scale);
  const framedRef = useRef(false);
  const gestureRef = useRef(false);
  const modeRef = useRef<"overview" | "opening" | 1 | 2 | 3 | 4>(cluster ?? "overview");
  const clusterRef = useRef(cluster);
  const variantRef = useRef(variant);

  useEffect(() => {
    positionsRef.current = scene.positions;
    worldRef.current = scene.world;
    nodesRef.current = scene.renderedNodes;
    clusterRef.current = cluster;
    variantRef.current = variant;
  }, [scene, cluster, variant]);

  function clearanceNodes(): ClearanceNode[] {
    return nodesRef.current.map((item) => ({
      sequence: item.node.sequence,
      x: item.x,
      y: item.y,
      r: prototypeDiscPixels(item.node) / 2,
      role: item.node.visualRole,
      state: item.node.state,
    }));
  }

  function composedCamera(size: MapSize, mode: "overview" | "opening" | 1 | 2 | 3 | 4) {
    const intro = introSafeRect(variantRef.current, size.width);
    const bounds = mode === "overview"
      ? { minX: 40, minY: 40, maxX: PRESENTATION_WIDTH - 40, maxY: PRESENTATION_HEIGHT - 40 }
      : mode === "opening"
        ? openingBounds()
        : clusterFocusBounds(mode);
    const framed = frameMapBounds(
      bounds,
      size,
      worldRef.current,
      mode === "overview" ? 1 : mode === "opening" ? 1.15 : 1.05,
      mode === "overview" ? 0.18 : 0.5,
    );
    return shiftCameraClearOf(framed, size, worldRef.current, intro, clearanceNodes());
  }
  const composeRef = useRef(composedCamera);
  useEffect(() => {
    composeRef.current = composedCamera;
  });

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(() => {
      if (viewport.clientWidth < 20) return;
      const next = { width: viewport.clientWidth, height: viewport.clientHeight };
      const previous = viewportSizeRef.current;
      viewportSizeRef.current = next;
      setViewportSize(next);
      if (!framedRef.current || !gestureRef.current) {
        framedRef.current = true;
        setCamera(composeRef.current(next, modeRef.current));
        return;
      }
      if (previous.width === next.width && previous.height === next.height) return;
      setCamera((current) => holdMapFocus(current, previous, next, worldRef.current));
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    const point = positionsRef.current.get(selectedId);
    const viewport = viewportRef.current;
    if (!point || !viewport) return;
    const size = readViewport(viewport);
    setCamera((current) => (
      mapPointInView(point, current, size) ? current : frameMapCamera(point, size, worldRef.current, current.scale)
    ));
  }, [selectedId]);

  useEffect(() => {
    if (cluster === undefined) return;
    modeRef.current = cluster;
    gestureRef.current = false;
    const viewport = viewportRef.current;
    if (!viewport || viewport.clientWidth < 20) return;
    setCamera(composeRef.current(readViewport(viewport), cluster));
  }, [cluster]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      gestureRef.current = true;
      const rect = viewport.getBoundingClientRect();
      setCamera((current) => zoomMapCamera(
        current,
        { width: viewport.clientWidth, height: viewport.clientHeight },
        worldRef.current,
        { x: event.clientX - rect.left, y: event.clientY - rect.top },
        event.deltaY,
      ));
    };
    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
  }, []);
  const concepts = new Map(catalog.concepts.map((concept) => [concept.id, concept]));
  const stateById = new Map(nodes.map((node) => [node.id, node.state]));
  const clusterById = new Map(nodes.map((node) => [node.id, node.cluster]));
  const connections = buildRenderedConnections(relations, dependencies, positions, 1);
  const canvasPrefix = `${variant}-visual04`;
  const introBox = introSafeRect(variant, viewportSize.width);
  const titleNodes: ClearanceNode[] = renderedNodes.map((item) => ({
    sequence: item.node.sequence,
    x: item.x,
    y: item.y,
    r: prototypeDiscPixels(item.node) / 2,
    role: item.node.visualRole,
    state: item.node.state,
  }));
  const constellationTitles = detail === "near"
    ? null
    : placeClusterTitles(camera, viewportSize, titleNodes, [introBox, minimapSafeRect(viewportSize)]);

  const clusterTabs = variant === "mobile" && cluster !== undefined && onClusterChange ? (
    <div data-prototype-cluster-tabs="true" data-prototype-map-ignore="true" className="mb-3 grid grid-cols-2 gap-1.5">
      {([1, 2, 3, 4] as const).map((item) => {
        const pending = nodes.some((node) => (
          node.cluster === item
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
      className={variant === "desktop" ? "relative hidden h-full w-full lg:flex lg:flex-col" : "relative flex h-full w-full flex-col lg:hidden"}
    >
      {clusterTabs}
      {variant === "mobile" && renderedNodes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-soma-line/60 px-3 py-6 text-center text-sm text-soma-ink-secondary">{copy.game.clusterClosed}</p>
      ) : null}
      <div
        ref={viewportRef}
        data-prototype-camera-viewport="true"
        className="relative min-h-[22rem] flex-1 overflow-hidden bg-transparent"
      >
      <PrototypeMapTapLayer
        onTap={() => onBackgroundTap?.()}
        onPan={(dx, dy) => {
            const viewport = viewportRef.current;
            if (!viewport) return;
            gestureRef.current = true;
            setCamera((current) => clampMapCamera(
              { ...current, x: current.x + dx, y: current.y + dy },
              readViewport(viewport),
              worldRef.current,
            ));
          }}
          onPinch={(ratio, clientX, clientY) => {
            const viewport = viewportRef.current;
            if (!viewport) return;
            gestureRef.current = true;
            const rect = viewport.getBoundingClientRect();
            const anchor = { x: clientX - rect.left, y: clientY - rect.top };
            setCamera((current) => {
              const scale = clampMapScale(current.scale * ratio);
              const worldX = (anchor.x - current.x) / current.scale;
              const worldY = (anchor.y - current.y) / current.scale;
              return clampMapCamera(
                { scale, x: anchor.x - worldX * scale, y: anchor.y - worldY * scale },
                readViewport(viewport),
                worldRef.current,
              );
            });
          }}
        label={copy.game.tapSurface}
      />
      <div
        data-prototype-camera-world="true"
        data-prototype-detail={detail}
        className="pointer-events-none absolute left-0 top-0 z-[6]"
        style={{
          width: `${PRESENTATION_WIDTH}px`,
          height: `${canvasHeight}px`,
          transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`,
          transformOrigin: "0 0",
        }}
      >
      <div className="relative h-full w-full">
      <svg viewBox={`0 0 ${PRESENTATION_WIDTH} ${canvasHeight}`} preserveAspectRatio="none" aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2] h-full w-full" data-prototype-map-connections="true">
        <defs>
          {connections.map((connection) => {
            const from = positions.get(connection.from);
            const to = positions.get(connection.to);
            if (!from || !to || stateById.get(connection.to) !== "hinted") return null;
            const color = connection.kind === "scientific" ? "#68d8c0" : "#a78bfa";
            return (
              <linearGradient key={`gradient-${connection.kind}-${connection.id}`} id={`${canvasPrefix}-${connection.kind}-fade-${connection.index}`} gradientUnits="userSpaceOnUse" x1={from.x} y1={from.y} x2={to.x} y2={to.y}>
                <stop offset="0" stopColor={color} stopOpacity={connection.kind === "game" ? "1" : "0.84"} />
                <stop offset="0.68" stopColor={color} stopOpacity="0.58" />
                <stop offset="1" stopColor={color} stopOpacity="0.16" />
              </linearGradient>
            );
          })}
        </defs>

        <g data-prototype-stratum-layer="metadata">
          {PROTOTYPE_STRATUM_ORDER.map((stratum) => (
            <g key={stratum} data-prototype-stratum={stratum} />
          ))}
        </g>

        <g data-prototype-connection-layer="scientific" />
        <g data-prototype-connection-layer="game">
          {connections.filter((connection) => connection.kind === "game").map((connection) => {
            const from = positions.get(connection.from);
            const to = positions.get(connection.to);
            if (!from || !to) return null;
            const fromNode = nodes.find((item) => item.id === connection.from);
            const toNode = nodes.find((item) => item.id === connection.to);
            const fromState = stateById.get(connection.from) ?? "hidden";
            const toState = stateById.get(connection.to) ?? "hidden";
            if (!fromNode || !toNode || fromState === "hidden" || toState === "hidden") return null;
            const role = playableConnectionRole(fromNode.essential, toNode.essential);
            const emphasis = connectionEmphasis({
              kind: "game",
              from: connection.from,
              to: connection.to,
              fromCluster: clusterById.get(connection.from) ?? 0,
              toCluster: clusterById.get(connection.to) ?? 0,
              length: Math.hypot(to.x - from.x, to.y - from.y),
              selectedId,
              role,
            });
            if (emphasis === "hidden") return null;
            const mysteryTarget = toState === "hinted";
            const paint = threadPaint(emphasis, role);
            const quiet = detail === "far" && role === "secondary" && emphasis !== "focus";
            const thread = constellationThread(
              from,
              to,
              discRadius(fromNode),
              discRadius(toNode),
              THREAD_BOW[`${fromNode.sequence}-${toNode.sequence}`],
            );
            return (
              <g key={`${connection.kind}-${connection.id}`}>
              <path
                d={thread}
                fill="none"
                stroke={paint.color}
                strokeWidth={paint.glowWidth}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                opacity={quiet ? paint.glow * 0.75 : paint.glow}
              />
              <path
                data-prototype-connection="game"
                data-prototype-connection-id={connection.id}
                data-prototype-connection-role={role}
                data-prototype-connection-form="thread"
                data-prototype-connection-emphasis={emphasis}
                data-prototype-shared-pair={connection.sharesPair ? "true" : undefined}
                data-prototype-fades={mysteryTarget ? "true" : undefined}
                d={thread}
                fill="none"
                stroke={mysteryTarget ? `url(#${canvasPrefix}-${connection.kind}-fade-${connection.index})` : paint.color}
                strokeWidth={paint.width}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                opacity={mysteryTarget ? 0.92 : quiet ? paint.opacity * 0.78 : paint.opacity}
              />
              </g>
            );
          })}
        </g>
      </svg>

      <div className="pointer-events-none absolute inset-0 z-[15]">
        {renderedNodes.map(({ node, x, y }) => {
          const concept = concepts.get(node.id);
          const compact = PROTOTYPE_COMPACT_SEQUENCES.has(node.sequence);
          const widthClass = compact ? compactWidthClass(node.visualRole) : cardWidthClass(node.visualRole, variant);
          return (
            <div key={node.id} data-prototype-map-ignore="true" data-prototype-role={node.visualRole} data-prototype-code={node.provisionalCode} data-prototype-node-variant={compact ? "compact" : "card"} className={`pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 ${compact ? "" : widthClass}`} style={{ left: `${(x / PRESENTATION_WIDTH) * 100}%`, top: `${y}px`, width: compact ? discPixels(node) : undefined, height: compact ? discPixels(node) : undefined }}>
              {compact ? (
                <PrototypeCompactNode concept={concept} node={node} language={language} selected={selectedId === node.id} labelSide={labelSide(node.sequence)} showCaption={captionIsVisible(detail, node.visualRole)} onSelect={onSelect} onDiscover={onDiscover} discoveryCost={discoveryCost} canDiscover={canDiscover} />
              ) : node.state === "hinted" ? (
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
      {constellationTitles ? (
        <div className="pointer-events-none absolute inset-0 z-[19]">
          {([1, 2, 3, 4] as const).map((item) => {
            const placed = constellationTitles[item];
            if (!placed.visible) return null;
            return (
              <p
                key={item}
                data-prototype-cluster-label={item}
                data-prototype-cluster-label-slot={placed.index}
                className={`absolute flex items-center gap-2 whitespace-nowrap text-[13px] font-semibold tracking-wide [text-shadow:0_1px_2px_rgb(2_6_12)] ${CLUSTER_TITLE_CLASS[item]}`}
                style={{ left: placed.left, top: placed.top }}
              >
                <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${CLUSTER_DOT_CLASS[item]}`} />
                {copy.game.clusterTitles[item]}
              </p>
            );
          })}
        </div>
      ) : null}
      <div
        data-prototype-map-ignore="true"
        data-prototype-stratum-intro="true"
        className="pointer-events-none absolute z-20"
        style={{ left: introBox.x, top: introBox.y, maxWidth: introBox.width }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7ee0f0]">{copy.game.stratumLabel}</p>
        <p className="mt-0.5 text-sm font-semibold leading-snug text-white">{copy.game.introTitle}</p>
        {variant === "desktop" && viewportSize.width >= 1100 ? (
          <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-[#c5d4e0]">{copy.game.introBody}</p>
        ) : null}
        <button type="button" data-prototype-camera-home="true" className={`${previewFocus} pointer-events-auto mt-1 text-left text-[11px] font-semibold text-[#9ad4e0] underline-offset-2 hover:underline`} onClick={() => {
          const viewport = viewportRef.current;
          if (!viewport) return;
          modeRef.current = "opening";
          gestureRef.current = false;
          setCamera(composeRef.current(readViewport(viewport), "opening"));
        }}>{copy.game.goToUniverse}</button>
      </div>
      <div data-prototype-map-ignore="true" data-prototype-camera-dock="true" className="pointer-events-none absolute bottom-3 left-3 z-20 flex items-end gap-1.5">
        <div className="pointer-events-auto">
          <PrototypeMinimap camera={camera} viewport={viewportSize} label={copy.game.clusters} />
        </div>
        <div className="pointer-events-auto flex flex-col gap-1">
        <button type="button" data-prototype-camera-in="true" aria-label={copy.game.cameraIn} className={`${previewFocus} grid h-9 w-9 place-items-center rounded-md border border-white/15 bg-[#07131e]/80 text-lg leading-none text-soma-ink backdrop-blur-sm`} onClick={() => {
          const viewport = viewportRef.current;
          if (!viewport) return;
          const size = readViewport(viewport);
          gestureRef.current = true;
          setCamera((current) => zoomMapCamera(current, size, worldRef.current, { x: size.width / 2, y: size.height / 2 }, -1));
        }}>+</button>
        <button type="button" data-prototype-camera-out="true" aria-label={copy.game.cameraOut} className={`${previewFocus} grid h-9 w-9 place-items-center rounded-md border border-white/15 bg-[#07131e]/80 text-lg leading-none text-soma-ink backdrop-blur-sm`} onClick={() => {
          const viewport = viewportRef.current;
          if (!viewport) return;
          gestureRef.current = true;
          const size = readViewport(viewport);
          setCamera((current) => zoomMapCamera(current, size, worldRef.current, { x: size.width / 2, y: size.height / 2 }, 1));
        }}>−</button>
        </div>
      </div>
      </div>
    </div>
  );
}

function PrototypeMinimap({
  camera,
  viewport,
  label,
}: {
  camera: MapCamera;
  viewport: { width: number; height: number };
  label: Record<1 | 2 | 3 | 4, string>;
}) {
  const width = 132;
  const height = 84;
  const sx = width / PRESENTATION_WIDTH;
  const sy = height / PRESENTATION_HEIGHT;
  const view = {
    x: (-camera.x / camera.scale) * sx,
    y: (-camera.y / camera.scale) * sy,
    w: (viewport.width / camera.scale) * sx,
    h: (viewport.height / camera.scale) * sy,
  };
  return (
    <svg
      data-prototype-minimap="true"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      aria-hidden="true"
      className="shrink-0 rounded-lg border border-white/15 bg-[#07111b]/80"
    >
      <title>{label[1]}</title>
      {Object.entries(STRATUM_POSITIONS).map(([sequence, point]) => (
        <circle key={sequence} cx={point.x * sx} cy={point.y * sy} r={1.6} fill="#9ad4e0" opacity={0.85} />
      ))}
      <rect x={view.x} y={view.y} width={Math.max(4, view.w)} height={Math.max(4, view.h)} fill="none" stroke="#e4d8ff" strokeWidth={1} />
    </svg>
  );
}

const CLUSTER_TITLE_CLASS = {
  1: "text-[#7ee0f0]",
  2: "text-[#d7c4ff]",
  3: "text-[#f5c16c]",
  4: "text-[#5eead4]",
} as const;

const CLUSTER_DOT_CLASS = {
  1: "bg-[#7ee0f0] shadow-[0_0_8px_#7ee0f0]",
  2: "bg-[#c4b5fd] shadow-[0_0_8px_#c4b5fd]",
  3: "bg-[#f5c16c] shadow-[0_0_8px_#f5c16c]",
  4: "bg-[#5eead4] shadow-[0_0_8px_#5eead4]",
} as const;

function discPixels(node: { sequence: number; visualRole: KnowledgePrototypeScenarioNode["visualRole"]; essential: boolean; state: KnowledgePrototypeState }) {
  return prototypeDiscPixels(node);
}

function openingBounds() {
  const points = [1, 2, 3, 4].map((sequence) => STRATUM_POSITIONS[sequence]).filter((point): point is { x: number; y: number } => Boolean(point));
  const pad = 96;
  return {
    minX: Math.min(...points.map((point) => point.x)) - pad,
    maxX: Math.max(...points.map((point) => point.x)) + pad,
    minY: Math.min(...points.map((point) => point.y)) - pad,
    maxY: Math.max(...points.map((point) => point.y)) + pad,
  };
}

function discRadius(node: { sequence: number; visualRole: KnowledgePrototypeScenarioNode["visualRole"]; essential: boolean; state: KnowledgePrototypeState }) {
  return discPixels(node) / 2;
}

function threadPaint(
  emphasis: "regional" | "focus" | "dim" | "context" | "hidden",
  role: "trunk" | "secondary",
) {
  if (emphasis === "focus") return { width: 2.15, opacity: 1, color: "#f4ecff", glow: 0.34, glowWidth: 5.2 };
  if (emphasis === "dim") {
    return role === "trunk"
      ? { width: 1.7, opacity: 0.74, color: "#dff6fb", glow: 0.2, glowWidth: 4.2 }
      : { width: 1.45, opacity: 0.52, color: "#d0eef6", glow: 0.14, glowWidth: 3.6 };
  }
  return role === "trunk"
    ? { width: 1.9, opacity: 0.94, color: "#eef9ff", glow: 0.28, glowWidth: 4.8 }
    : { width: 1.55, opacity: 0.76, color: "#dff3f8", glow: 0.18, glowWidth: 3.8 };
}

function captionPlacement(side: "above" | "below" | "left" | "right") {
  if (side === "above") return "absolute bottom-full left-1/2 z-10 mb-1 w-max max-w-[7.5rem] -translate-x-1/2 text-center";
  if (side === "below") return "absolute top-full left-1/2 z-10 mt-1 w-max max-w-[7.5rem] -translate-x-1/2 text-center";
  if (side === "left") return "absolute right-full top-1/2 z-10 mr-1.5 w-max max-w-[7.5rem] -translate-y-1/2 text-right";
  return "absolute left-full top-1/2 z-10 ml-1.5 w-max max-w-[7.5rem] -translate-y-1/2 text-left";
}

function PrototypeCompactNode({ concept, node, language, selected, labelSide, showCaption, onSelect, onDiscover, discoveryCost, canDiscover }: {
  concept: KnowledgeConcept | undefined;
  node: KnowledgePrototypeScenarioNode;
  language: "es" | "en";
  selected: boolean;
  labelSide: "above" | "below" | "left" | "right";
  showCaption: boolean;
  onSelect: (id: KnowledgeConceptId) => void;
  onDiscover?: (id: KnowledgeConceptId) => void;
  discoveryCost?: (id: KnowledgeConceptId) => number;
  canDiscover?: (id: KnowledgeConceptId) => boolean;
}) {
  const copy = KNOWLEDGE_PROTOTYPE_COPY[language];
  if (node.state === "hinted" || !concept) {
    return (
      <div role="img" aria-label={copy.unknownDiscovery} data-prototype-mystery="true" data-prototype-state="hinted" className="flex h-full w-full items-center justify-center rounded-full border border-dashed border-soma-line/70 bg-[#09121d] text-sm text-soma-ink-muted">?</div>
    );
  }
  const label = concept.labels[language];
  const stateLabel = copy.states[node.state];
  const cost = discoveryCost?.(node.id) ?? 0;
  const affordable = canDiscover?.(node.id) ?? false;
  const prominent = node.visualRole === "milestone" || node.visualRole === "door" || node.visualRole === "convergence" || node.visualRole === "bridge";
  const nameClass = `${showCaption ? "block" : "sr-only"} font-semibold leading-tight text-soma-ink [text-shadow:0_1px_2px_rgb(2_6_12)] ${prominent ? "text-sm" : node.visualRole === "compact" && !node.essential ? "text-[11px] text-soma-ink-secondary" : "text-xs"}`;
  const portrait = STRATUM_NODE_ART[node.sequence];
  const glyph = (
    <span className={`relative grid h-full w-full place-items-center overflow-hidden rounded-full border bg-[#0c1826]/90 ${portrait ? "shadow-[0_0_16px_rgb(126_224_240_/_0.35)] ring-1 ring-[#9ad4e0]/70" : ""} ${compactFrame(node.visualRole, selected, node.state)}`}>
      {portrait ? (
        <img src={portrait} alt="" width={256} height={256} data-prototype-node-art={node.provisionalCode} className="h-full w-full object-cover" />
      ) : (
        <NodeSymbol sequence={node.sequence} kind={node.illustration} />
      )}
      {node.generator ? <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-soma-warning ring-2 ring-[#07111b]" /> : null}
    </span>
  );
  const caption = (
    <span className={captionPlacement(labelSide)}>
      <span data-prototype-caption={showCaption ? "visible" : "quiet"} className={nameClass}>{label}</span>
      {node.generator ? <span className="sr-only">{copy.game.generatorMark}</span> : null}
      {node.visualCue === "forward-field" ? <span className="mt-0.5 block text-[10px] font-medium leading-tight text-[#c4b5fd]">{copy.game.fieldForward}</span> : null}
      {node.state === "researching" ? (
        <span className="mt-1 block h-1 overflow-hidden rounded-full bg-[#07111b]">
          <span className="block h-full rounded-full bg-soma-action" style={{ width: `${node.progress ?? 0}%` }} />
        </span>
      ) : null}
    </span>
  );

  if (node.state === "available" && onDiscover) {
    return (
      <div data-prototype-node={node.id} data-prototype-state={node.state} data-prototype-cue={node.visualCue} className="relative h-full w-full">
        {glyph}
        <span className={captionPlacement(labelSide)}>
          <span data-prototype-caption={showCaption ? "visible" : "quiet"} className={nameClass}>{label}</span>
          <button
            type="button"
            onClick={() => onDiscover(node.id)}
            disabled={!affordable}
            aria-label={cost === 0 ? copy.game.openExit : copy.game.discoverFor(cost)}
            className={`${previewFocus} mt-1 flex min-h-11 min-w-11 items-center justify-center rounded-full border px-2 text-[11px] font-semibold disabled:cursor-not-allowed disabled:opacity-45 ${affordable ? "border-soma-shell-accent/60 bg-soma-shell-accent/15 text-soma-shell-accent" : "border-soma-line/50 text-soma-ink-muted"}`}
          >
            {cost > 0 ? <img src={CURIOSITY_SPARK_URL} alt="" width={16} height={16} className="mr-1 h-4 w-4" /> : null}
            {cost === 0 ? copy.game.compactExit : copy.game.compactDiscover(cost)}
          </button>
        </span>
      </div>
    );
  }

  return (
    <button type="button" data-prototype-node={node.id} data-prototype-state={node.state} data-prototype-cue={node.visualCue} aria-current={selected ? "true" : undefined} aria-label={copy.openCard(label, stateLabel)} onClick={() => onSelect(node.id)} className={`${previewFocus} relative block h-full w-full rounded-full text-center`}>
      {glyph}
      {caption}
    </button>
  );
}

function compactWidthClass(role: KnowledgePrototypeScenarioNode["visualRole"]) {
  if (role === "door" || role === "milestone" || role === "convergence" || role === "bridge") return "w-36";
  return "w-24";
}

function compactFrame(role: KnowledgePrototypeScenarioNode["visualRole"], selected: boolean, state: KnowledgePrototypeState) {
  const selectedRing = selected ? "ring-2 ring-white ring-offset-2 ring-offset-[#07111b]" : "";
  if (role === "door") return `border-[#5eead4] shadow-[0_0_14px_rgb(94_234_212_/_0.38)] ring-2 ring-[#5eead4]/70 ${selectedRing}`;
  if (role === "bridge") return `border-[#c4b5fd]/80 ${selectedRing}`;
  if (role === "milestone" || role === "convergence") return `border-[#7ee0f0] shadow-[0_0_14px_rgb(126_224_240_/_0.32)] ${selectedRing}`;
  if (state === "discovered") return `border-[#7ddec8]/70 ${selectedRing}`;
  if (state === "available") return `border-[#c4b5fd]/70 ${selectedRing}`;
  return `border-white/25 ${selectedRing}`;
}

function NodeSymbol({ sequence, kind }: { sequence: number; kind: KnowledgePrototypeIllustration }) {
  const featured = featuredIcon(sequence);
  if (!featured) {
    return (
      <svg viewBox="78 22 84 68" aria-hidden="true" className="h-[52%] w-[52%]">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round"><IllustrationGlyph kind={kind} /></g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="h-[58%] w-[58%]">
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">{featured}</g>
    </svg>
  );
}

function featuredIcon(sequence: number) {
  if (sequence === 1) return <><ellipse cx="32" cy="32" rx="18" ry="7.5" transform="rotate(-32 32 32)" stroke="#7ee0f0" strokeWidth="1.7" /><ellipse cx="32" cy="32" rx="10" ry="4" transform="rotate(-32 32 32)" stroke="#c4b5fd" strokeWidth="1.4" /><circle cx="32" cy="32" r="2.2" fill="#f6d7a1" stroke="none" /></>;
  if (sequence === 2) return <><path d="M32 14v22M32 36 16 48M32 36l16 12" stroke="#7ee0f0" strokeWidth="1.7" /><circle cx="32" cy="36" r="2" fill="#7ee0f0" stroke="none" /></>;
  if (sequence === 3) return <><path d="M20 14h24L32 32 44 50H20L32 32Z" stroke="#7ee0f0" strokeWidth="1.7" /><path d="M24 18h16M24 46h16" stroke="#c4b5fd" strokeWidth="1.3" /></>;
  if (sequence === 4) return <><circle cx="18" cy="34" r="6" stroke="#7ee0f0" strokeWidth="1.7" /><circle cx="46" cy="30" r="6" stroke="#c4b5fd" strokeWidth="1.7" /><path d="M24 32c6-10 10-10 16-4" stroke="#d7e7f2" strokeWidth="1.6" /></>;
  if (sequence === 5) return <><path d="M12 24c10-8 30-8 40 2M12 34c12-6 28 8 40-2M12 46c10 6 30 4 40-6" stroke="#7ee0f0" strokeWidth="1.5" /><path d="M24 16c2 12 0 22-4 32M42 16c-2 12 2 22 6 30" stroke="#c4b5fd" strokeWidth="1.4" /></>;
  if (sequence === 10) return <><path d="M32 12v40M15 22l34 20M49 22 15 42" stroke="#7ee0f0" strokeWidth="1.6" /><circle cx="32" cy="32" r="4" stroke="#c4b5fd" strokeWidth="1.5" /></>;
  if (sequence === 15) return <path d="M36 12 22 34h10l-6 18 20-24H34Z" fill="#f5c16c" stroke="#f5c16c" strokeWidth="1.2" />;
  if (sequence === 19) return <><ellipse cx="32" cy="32" rx="18" ry="7" stroke="#7ee0f0" strokeWidth="1.5" /><ellipse cx="32" cy="32" rx="18" ry="7" transform="rotate(60 32 32)" stroke="#c4b5fd" strokeWidth="1.5" /><ellipse cx="32" cy="32" rx="18" ry="7" transform="rotate(120 32 32)" stroke="#9ad4e0" strokeWidth="1.5" /><circle cx="32" cy="32" r="2.4" fill="#e4d8ff" stroke="none" /></>;
  if (sequence === 23) return <><path d="M10 24c8-8 12 8 22 0s14-8 22 2M10 36c8-8 12 8 22 0s14-8 22 2M10 48c8-8 12 8 22 0s14-8 22 2" stroke="#7ee0f0" strokeWidth="1.5" /></>;
  if (sequence === 26) return <><path d="M20 18h24a12 12 0 0 1 0 24H20a8 8 0 0 1 0-16h20" stroke="#5eead4" strokeWidth="1.7" /><path d="M22 50h20" stroke="#5eead4" strokeWidth="1.7" /></>;
  return null;
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
