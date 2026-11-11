import { useId } from "react";
import {
  NEUROSCIENCE_LIGHT_SRC,
  NEUROSCIENCE_MASK_STROKE,
  NEUROSCIENCE_TRAIL_D,
  PROCESSES_LIGHT_SRC,
  PROCESSES_MASK_STROKE,
  PROCESSES_TRAIL_D,
  TRAIL_VIEWBOX_HEIGHT,
  TRAIL_VIEWBOX_WIDTH,
  beaconPixelForNode,
} from "./expedition-trail-layout.js";
import {
  knowledgeFillForRoute,
  perseveranceHaloTicks,
} from "./expedition-trail-progress.js";
import type {
  ExpeditionNode,
  ExpeditionNodeId,
  ExpeditionRouteId,
} from "./expedition-model.js";

const HALO = "rgb(var(--soma-shell-accent))";
const DASH_MS = "duration-[380ms]";
const LIGHT_OPACITY = 0.82;

function RevealLight({
  maskId,
  d,
  fill,
  href,
  strokeWidth,
}: {
  maskId: string;
  d: string;
  fill: number;
  href: string;
  strokeWidth: number;
}) {
  if (fill <= 0) return null;
  const dash = `${fill} ${100 - fill}`;
  return (
    <>
      <mask id={maskId} maskUnits="userSpaceOnUse">
        <rect
          width={TRAIL_VIEWBOX_WIDTH}
          height={TRAIL_VIEWBOX_HEIGHT}
          fill="#000"
        />
        <path
          d={d}
          fill="none"
          stroke="#fff"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={100}
          strokeDasharray={dash}
          className={`motion-safe:transition-[stroke-dasharray] motion-reduce:transition-none ${DASH_MS} ease-out`}
        />
      </mask>
      <image
        href={href}
        width={TRAIL_VIEWBOX_WIDTH}
        height={TRAIL_VIEWBOX_HEIGHT}
        mask={`url(#${maskId})`}
      />
    </>
  );
}

function PerseveranceHalo({
  node,
  selectedId,
}: {
  node: ExpeditionNode | undefined;
  selectedId: ExpeditionNodeId;
}) {
  if (!node || node.id !== selectedId || node.route !== "perseverance") {
    return null;
  }
  const place = beaconPixelForNode(node.id, "perseverance");
  if (!place) return null;
  const ticks = perseveranceHaloTicks(node);
  const gap = Math.max(0, ticks.total - ticks.completed);
  return (
    <div
      className="pointer-events-none absolute z-[5] -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${place.left}%`, top: `${place.top}%` }}
      aria-hidden="true"
    >
      <svg width="52" height="52" viewBox="0 0 52 52" className="block">
        <circle
          cx="26"
          cy="26"
          r="22"
          fill="none"
          stroke="rgba(232, 195, 90, 0.28)"
          strokeWidth="3"
        />
        <circle
          cx="26"
          cy="26"
          r="22"
          fill="none"
          strokeWidth="3"
          style={{ stroke: HALO }}
          pathLength={ticks.total}
          strokeDasharray={`${ticks.completed} ${gap}`}
          strokeLinecap="butt"
          transform="rotate(-90 26 26)"
          className={`motion-safe:transition-[stroke-dasharray] motion-reduce:transition-none ${DASH_MS} ease-out`}
        />
      </svg>
    </div>
  );
}

export function ExpeditionTrail({
  route,
  nodes,
  selectedId,
}: {
  route: ExpeditionRouteId;
  nodes: readonly ExpeditionNode[];
  selectedId: ExpeditionNodeId;
}) {
  const uid = useId().replace(/:/g, "");
  const fill = knowledgeFillForRoute(route, nodes);
  const selected = nodes.find((node) => node.id === selectedId);
  const showLights =
    route === "knowledge" &&
    (fill.neurotransmitters > 0 || fill.processes > 0);

  return (
    <>
      {showLights ? (
        <svg
          viewBox={`0 0 ${TRAIL_VIEWBOX_WIDTH} ${TRAIL_VIEWBOX_HEIGHT}`}
          className="pointer-events-none absolute inset-0 z-[1] h-full w-full mix-blend-screen"
          style={{ opacity: LIGHT_OPACITY }}
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <RevealLight
            maskId={`trail-neuro-${uid}`}
            d={NEUROSCIENCE_TRAIL_D}
            fill={fill.neurotransmitters}
            href={NEUROSCIENCE_LIGHT_SRC}
            strokeWidth={NEUROSCIENCE_MASK_STROKE}
          />
          <RevealLight
            maskId={`trail-proc-${uid}`}
            d={PROCESSES_TRAIL_D}
            fill={fill.processes}
            href={PROCESSES_LIGHT_SRC}
            strokeWidth={PROCESSES_MASK_STROKE}
          />
        </svg>
      ) : null}
      {route === "perseverance" ? (
        <PerseveranceHalo node={selected} selectedId={selectedId} />
      ) : null}
    </>
  );
}
