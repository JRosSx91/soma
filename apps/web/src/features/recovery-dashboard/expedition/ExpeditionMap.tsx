import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  Brain,
  FlaskConical,
  Leaf,
  MapPin,
  PersonStanding,
  Waypoints,
  type LucideIcon,
} from "lucide-react";
import { previewFocus } from "../focus.js";
import {
  EXPEDITION_MAP_HEIGHT,
  EXPEDITION_MAP_SRC,
  EXPEDITION_MAP_WEBP_SRC,
  EXPEDITION_MAP_WIDTH,
  nodeIdsForRoute,
  trailLayout,
  type MapPoint,
} from "./expedition-map-layout.js";
import {
  KNOWLEDGE_MARK_PX,
  KNOWLEDGE_MARK_SIZES,
  nodeMark,
} from "./expedition-marks.js";
import { ExpeditionTrail } from "./ExpeditionTrail.js";
import type {
  ExpeditionNode,
  ExpeditionNodeId,
  ExpeditionRouteId,
} from "./expedition-model.js";

const accent = { color: "rgb(var(--soma-shell-accent))" };
const MAP_MIN_WIDTH_PX = 640;
const SCROLL_STEP_PX = 96;
const REVEAL_PADDING_PX = 40;

const NODE_ICONS: Partial<Record<ExpeditionNodeId, LucideIcon>> = {
  neurotransmitters: Brain,
  orientation: PersonStanding,
  substances: FlaskConical,
  processes: Waypoints,
  recovery: Leaf,
};

function nodeLabelKey(id: ExpeditionNodeId): string {
  if (id === "neurotransmitters") return "nodeNeurotransmitters";
  if (id === "orientation") return "nodeOrientation";
  if (id === "substances") return "nodeSubstances";
  if (id === "processes") return "nodeProcesses";
  if (id === "recovery") return "nodeRecovery";
  return `substances:${id}.name`;
}

function statusClass(status: ExpeditionNode["status"], selected: boolean): string {
  if (selected) {
    return "border-2 border-soma-action bg-[rgb(4_12_20_/_0.88)] text-soma-ink shadow-[0_0_0_3px_rgb(104_216_192_/_0.28),0_0_16px_rgb(104_216_192_/_0.45)]";
  }
  if (status === "complete") {
    return "border border-soma-action/85 bg-[rgb(4_12_20_/_0.82)] text-soma-ink";
  }
  if (status === "in_progress" || status === "available") {
    return "border border-soma-action/70 bg-[rgb(4_12_20_/_0.78)] text-soma-ink";
  }
  return "border border-soma-line-strong bg-[rgb(4_12_20_/_0.72)] text-soma-ink-secondary";
}

function revealHorizontally(scroller: HTMLElement, marker: HTMLElement): void {
  const scrollerBox = scroller.getBoundingClientRect();
  const markerBox = marker.getBoundingClientRect();
  const leftBound = scrollerBox.left + REVEAL_PADDING_PX;
  const rightBound = scrollerBox.right - REVEAL_PADDING_PX;
  if (markerBox.left >= leftBound && markerBox.right <= rightBound) return;
  const delta =
    markerBox.left + markerBox.width / 2 - (scrollerBox.left + scrollerBox.width / 2);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  scroller.scrollBy({
    left: delta,
    behavior: reduced ? "auto" : "smooth",
  });
}

function NodeButton({
  node,
  point,
  selected,
  label,
  onSelect,
}: {
  node: ExpeditionNode;
  point: MapPoint;
  selected: boolean;
  label: string;
  onSelect: (id: ExpeditionNodeId) => void;
}) {
  const Icon = NODE_ICONS[node.id] ?? MapPin;
  const mark = nodeMark(node.id);
  const above = point.label === "above";
  return (
    <button
      type="button"
      data-expedition-node={node.id}
      aria-pressed={selected}
      aria-current={selected ? "true" : undefined}
      onClick={() => onSelect(node.id)}
      className={`${previewFocus} pointer-events-auto absolute z-10 flex min-h-11 min-w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center ${
        selected ? "z-20" : ""
      } ${
        node.status === "in_progress"
          ? "motion-safe:[&>span:first-child]:animate-pulse motion-reduce:[&>span:first-child]:animate-none"
          : ""
      }`}
      style={{ left: `${point.x}%`, top: `${point.y}%` }}
    >
      <span
        className={`flex items-center justify-center overflow-hidden rounded-full ${statusClass(node.status, selected)}`}
        style={{ width: KNOWLEDGE_MARK_PX, height: KNOWLEDGE_MARK_PX }}
      >
        {mark ? (
          <img
            src={mark.src}
            srcSet={mark.srcSet}
            sizes={KNOWLEDGE_MARK_SIZES}
            alt=""
            width={192}
            height={192}
            decoding="async"
            draggable={false}
            className="h-full w-full object-cover"
            aria-hidden="true"
          />
        ) : (
          <Icon
            className="h-3.5 w-3.5 drop-shadow-[0_0_4px_rgb(4_12_20_/_0.9)]"
            style={accent}
            aria-hidden="true"
          />
        )}
      </span>
      <span
        className={`absolute left-1/2 w-max max-w-[5.25rem] -translate-x-1/2 whitespace-normal rounded-full border px-1.5 py-0.5 text-center text-[10px] font-semibold leading-tight sm:max-w-[7.25rem] sm:px-2 sm:text-[11px] ${
          selected
            ? "border-soma-action/70 bg-[rgb(4_12_20_/_0.94)] text-soma-ink"
            : "border-soma-line-strong/80 bg-[rgb(4_12_20_/_0.9)] text-soma-ink"
        } ${above ? "bottom-full mb-1.5" : "top-full mt-1.5"}`}
      >
        {label}
      </span>
    </button>
  );
}

export function ExpeditionMap({
  route,
  nodes,
  selectedId,
  revealKey,
  onSelect,
}: {
  route: ExpeditionRouteId;
  nodes: readonly ExpeditionNode[];
  selectedId: ExpeditionNodeId;
  revealKey: number;
  onSelect: (id: ExpeditionNodeId) => void;
}) {
  const { t } = useTranslation(["expedition", "substances"]);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  const layout = trailLayout(route);
  const ids = nodeIdsForRoute(route);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const update = () => {
      setOverflows(scroller.scrollWidth > scroller.clientWidth + 1);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const marker = scroller?.querySelector<HTMLElement>(
      `[data-expedition-node="${selectedId}"]`,
    );
    if (!scroller || !marker) return;
    revealHorizontally(scroller, marker);
  }, [selectedId, route, revealKey]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const node = event.currentTarget;
    if (node.scrollWidth <= node.clientWidth) return;
    event.preventDefault();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    node.scrollBy({
      left: event.key === "ArrowRight" ? SCROLL_STEP_PX : -SCROLL_STEP_PX,
      behavior: reduced ? "auto" : "smooth",
    });
  }

  return (
    <div className="min-w-0">
      <div
        ref={scrollerRef}
        tabIndex={0}
        role="region"
        aria-label={t("expedition:mapLabel")}
        onKeyDown={handleKeyDown}
        className={`${previewFocus} min-w-0 overflow-x-auto overflow-y-hidden overscroll-x-contain rounded-2xl border border-soma-line-strong [scrollbar-width:thin]`}
      >
        <div className="relative w-full" style={{ minWidth: MAP_MIN_WIDTH_PX }}>
          <picture>
            <source type="image/webp" srcSet={EXPEDITION_MAP_WEBP_SRC} />
            <img
              src={EXPEDITION_MAP_SRC}
              alt=""
              width={EXPEDITION_MAP_WIDTH}
              height={EXPEDITION_MAP_HEIGHT}
              decoding="async"
              draggable={false}
              className="pointer-events-none block h-auto w-full max-w-none"
            />
          </picture>
          <div
            className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[#041018]/28 via-transparent to-[#041018]/12"
            aria-hidden="true"
          />
          <ExpeditionTrail
            route={route}
            nodes={nodes}
            selectedId={selectedId}
          />
          {ids.map((id) => {
            const node = nodes.find((item) => item.id === id);
            const point = layout[id];
            if (!node || !point) return null;
            const labelKey = nodeLabelKey(node.id);
            const label = labelKey.startsWith("substances:")
              ? t(labelKey, { defaultValue: node.id })
              : t(`expedition:${labelKey}`);
            return (
              <NodeButton
                key={node.id}
                node={node}
                point={point}
                selected={selectedId === node.id}
                label={label}
                onSelect={onSelect}
              />
            );
          })}
        </div>
      </div>
      {overflows ? (
        <p className="mt-2 text-center text-[11px] text-soma-ink-muted">
          {t("expedition:mapSwipeHint")}
          <span className="sr-only"> {t("expedition:mapScrollHint")}</span>
        </p>
      ) : null}
    </div>
  );
}
