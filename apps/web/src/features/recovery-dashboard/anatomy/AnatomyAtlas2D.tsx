import { useEffect, useRef, useState } from "react";
import { previewFocus } from "../focus.js";
import {
  ATLAS_PLATE_FRAME,
  ATLAS_VIEWBOX,
  type AtlasPlate,
  type AtlasViewId,
} from "./atlas-types.js";
import {
  applyCrossfadeOpacities,
  beginPlateCrossfade,
  crossfadeOpacities,
  PLATE_CROSSFADE_MS,
  settlePlateLayers,
  type PlateLayer,
} from "./plate-crossfade.js";

const zoomSteps = [1, 1.25, 1.5, 2, 2.5] as const;

export interface AtlasRegionHit {
  organId: string;
  path: string;
}

interface AnatomyAtlas2DProps {
  label: string;
  plate: AtlasPlate | null;
  unavailableMessage: string;
  regions: readonly AtlasRegionHit[];
  selectedOrganId: string | null;
  view: AtlasViewId;
  posteriorAvailable: boolean;
  /** Body plate fills the viewBox. System plates stay in the shared frame. */
  fillView?: boolean;
  onViewChange: (view: AtlasViewId) => void;
  onSelectOrgan: (organId: string) => void;
}

/**
 * 2D atlas stage. Plates and region paths share `ATLAS_VIEWBOX`.
 * This component does not draw organs. A missing plate stays an explicit gap.
 */
export function AnatomyAtlas2D({
  label,
  plate,
  unavailableMessage,
  regions,
  selectedOrganId,
  view,
  posteriorAvailable,
  fillView = false,
  onViewChange,
  onSelectOrgan,
}: AnatomyAtlas2DProps) {
  const [zoomIndex, setZoomIndex] = useState(0);
  const [layers, setLayers] = useState<PlateLayer[]>(() =>
    plate?.src ? [{ id: 1, src: plate.src, opacity: 1 }] : [],
  );
  const layerSeq = useRef(1);
  const shownSrc = useRef(plate?.src ?? null);
  const layersRef = useRef(layers);
  layersRef.current = layers;
  const zoom = zoomSteps[zoomIndex] ?? 1;

  useEffect(() => {
    setZoomIndex(0);
  }, [view]);

  useEffect(() => {
    if (!fillView) setZoomIndex(0);
  }, [fillView]);

  useEffect(() => {
    if (!fillView) return;
    const src = plate?.src;
    if (!src || src === shownSrc.current) return;
    shownSrc.current = src;
    const nextId = ++layerSeq.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const next = beginPlateCrossfade(layersRef.current, src, nextId, reduced);
    const outgoingStart = next.find((layer) => layer.id !== nextId)?.opacity ?? 0;
    setLayers(next);
    if (reduced || outgoingStart === 0) return;
    const started = performance.now();
    const timer = window.setInterval(() => {
      const frame = crossfadeOpacities(performance.now() - started, PLATE_CROSSFADE_MS, outgoingStart);
      if (frame.done) {
        window.clearInterval(timer);
        setLayers((current) => settlePlateLayers(current, nextId));
        return;
      }
      setLayers((current) => applyCrossfadeOpacities(current, nextId, frame.outgoing, frame.incoming));
    }, 32);
    return () => {
      window.clearInterval(timer);
    };
  }, [plate?.src, fillView]);

  useEffect(() => {
    if (fillView) return;
    const src = shownSrc.current;
    if (!src) return;
    setLayers((current) =>
      current.length === 1 && current[0]?.src === src && current[0].opacity === 1
        ? current
        : [{ id: ++layerSeq.current, src, opacity: 1 }],
    );
  }, [fillView]);

  const frame = fillView
    ? { x: 0, y: 0, width: ATLAS_VIEWBOX.width, height: ATLAS_VIEWBOX.height }
    : ATLAS_PLATE_FRAME;
  const centerX = frame.x + frame.width / 2;
  const centerY = frame.y + frame.height / 2;
  const zoomTransform =
    zoom === 1
      ? undefined
      : `translate(${centerX} ${centerY}) scale(${zoom}) translate(${-centerX} ${-centerY})`;

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="group" aria-label="Vista anatómica" className="flex gap-1.5">
          <ViewButton
            pressed={view === "anterior"}
            onClick={() => onViewChange("anterior")}
          >
            Vista anterior
          </ViewButton>
          <ViewButton
            pressed={view === "posterior"}
            disabled={!posteriorAvailable}
            disabledReason="La vista posterior todavía no está disponible."
            onClick={() => onViewChange("posterior")}
          >
            Vista posterior
          </ViewButton>
        </div>
        <div role="group" aria-label="Zoom de la ilustración" className="flex gap-1.5">
          <ToolButton
            label="Alejar"
            disabled={zoomIndex === 0}
            onClick={() => setZoomIndex((index) => Math.max(0, index - 1))}
          >
            −
          </ToolButton>
          <ToolButton
            label="Acercar"
            disabled={zoomIndex === zoomSteps.length - 1}
            onClick={() =>
              setZoomIndex((index) => Math.min(zoomSteps.length - 1, index + 1))
            }
          >
            +
          </ToolButton>
          <ToolButton label="Restablecer" disabled={zoomIndex === 0} onClick={() => setZoomIndex(0)}>
            Restablecer
          </ToolButton>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-soma-line bg-[#101820] shadow-[inset_0_0_80px_rgba(104,216,192,0.08)]">
        <div
          className="relative flex h-[22rem] w-full items-center justify-center sm:h-[28rem] md:h-[32rem] lg:h-[min(48rem,calc(100svh-15.5rem))]"
          style={{ containerType: "size" }}
        >
        {plate && fillView ? (
          <div
            role="img"
            aria-label={`${label}, vista ${view === "anterior" ? "anterior" : "posterior"}`}
            className="relative max-w-full"
            style={{
              aspectRatio: plate.aspectRatio ?? "1024 / 1536",
              height: "min(100cqh, calc(100cqw * 1536 / 1024))",
              width: "auto",
              transform: zoom === 1 ? undefined : `scale(${zoom})`,
            }}
          >
            {layers.map((layer) => (
              <div
                key={layer.id}
                aria-hidden={layer.src !== plate.src}
                className="atlas-plate-layer absolute inset-0"
                style={{
                  backgroundImage: `url(${layer.src})`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  backgroundSize: "100% 100%",
                  opacity: layer.opacity,
                }}
              />
            ))}
          </div>
        ) : null}
        <svg
          viewBox={`0 0 ${ATLAS_VIEWBOX.width} ${ATLAS_VIEWBOX.height}`}
          role={plate && fillView ? "presentation" : "img"}
          aria-label={plate && fillView ? undefined : plate ? `${label}, vista ${view === "anterior" ? "anterior" : "posterior"}` : unavailableMessage}
          className={
            plate && fillView
              ? "pointer-events-none absolute inset-0 h-full w-full"
              : "h-full max-h-full w-full"
          }
        >
          <defs>
            <radialGradient id="atlas-glow" cx="50%" cy="42%" r="55%">
              <stop offset="0%" stopColor="rgb(104 216 192 / 0.16)" />
              <stop offset="70%" stopColor="rgb(16 24 32 / 0)" />
            </radialGradient>
          </defs>
          {plate && fillView ? null : (
            <>
              <rect width={ATLAS_VIEWBOX.width} height={ATLAS_VIEWBOX.height} fill="#101820" />
              <rect width={ATLAS_VIEWBOX.width} height={ATLAS_VIEWBOX.height} fill="url(#atlas-glow)" />
            </>
          )}
          <g transform={zoomTransform}>
            {plate && !fillView ? (
              <image
                href={plate.src}
                x={frame.x}
                y={frame.y}
                width={frame.width}
                height={frame.height}
                preserveAspectRatio="xMidYMid meet"
              />
            ) : plate ? null : (
              <g>
                <rect
                  x={frame.x}
                  y={frame.y}
                  width={frame.width}
                  height={frame.height}
                  rx="28"
                  fill="rgb(28 42 53 / 0.65)"
                  stroke="rgb(143 163 184 / 0.45)"
                  strokeDasharray="10 8"
                />
                <text
                  x={ATLAS_VIEWBOX.width / 2}
                  y={ATLAS_VIEWBOX.height / 2}
                  textAnchor="middle"
                  fill="#d5e2ee"
                  fontSize="64"
                  fontFamily="inherit"
                >
                  Sin ilustración
                </text>
              </g>
            )}
            {regions.map((region) => (
              <path
                key={region.organId}
                d={region.path}
                tabIndex={0}
                role="button"
                aria-label={region.organId}
                aria-pressed={selectedOrganId === region.organId}
                fill={
                  selectedOrganId === region.organId
                    ? "rgb(104 216 192 / 0.28)"
                    : "rgb(104 216 192 / 0.08)"
                }
                stroke="#68d8c0"
                strokeWidth="3"
                className="cursor-pointer outline-none focus-visible:stroke-white"
                onClick={() => onSelectOrgan(region.organId)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectOrgan(region.organId);
                  }
                }}
              />
            ))}
          </g>
        </svg>
        </div>
        {!plate ? (
          <p className="px-4 pb-4 text-center text-sm text-soma-ink-secondary">{unavailableMessage}</p>
        ) : null}
      </div>
      {!posteriorAvailable && view === "anterior" ? (
        <p className="text-xs text-soma-ink-muted">La vista posterior todavía no está disponible.</p>
      ) : null}
    </div>
  );
}

function ViewButton({
  pressed,
  disabled = false,
  disabledReason,
  onClick,
  children,
}: {
  pressed: boolean;
  disabled?: boolean;
  disabledReason?: string;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={disabled ? undefined : pressed}
      disabled={disabled}
      title={disabled ? disabledReason : undefined}
      onClick={onClick}
      className={`${previewFocus} rounded-full px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40 ${
        pressed && !disabled
          ? "bg-soma-action text-[#081018]"
          : "bg-soma-surface text-soma-ink-secondary"
      }`}
    >
      {children}
    </button>
  );
}

function ToolButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`${previewFocus} rounded-full border border-soma-line bg-soma-surface px-3 py-1.5 text-xs text-soma-ink disabled:opacity-40`}
    >
      {children}
    </button>
  );
}
