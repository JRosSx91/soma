import { ImageOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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

  const regionFrame = fillView
    ? { x: 0, y: 0, width: ATLAS_VIEWBOX.width, height: ATLAS_VIEWBOX.height }
    : ATLAS_PLATE_FRAME;
  const regionCenterX = regionFrame.x + regionFrame.width / 2;
  const regionCenterY = regionFrame.y + regionFrame.height / 2;
  const regionZoomTransform =
    zoom === 1
      ? undefined
      : `translate(${regionCenterX} ${regionCenterY}) scale(${zoom}) translate(${-regionCenterX} ${-regionCenterY})`;
  const showRegions = regions.length > 0;
  const viewLabel = view === "anterior" ? "anterior" : "posterior";
  const { t } = useTranslation("anatomy");

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="group" aria-label={t("viewGroup")} className="flex gap-1.5">
          <ViewButton
            pressed={view === "anterior"}
            onClick={() => onViewChange("anterior")}
          >
            {t("viewAnterior")}
          </ViewButton>
          <ViewButton
            pressed={view === "posterior"}
            disabled={!posteriorAvailable}
            disabledReason={t("posteriorUnavailableShort")}
            onClick={() => onViewChange("posterior")}
          >
            {t("viewPosterior")}
          </ViewButton>
        </div>
        <div role="group" aria-label={t("zoomGroup")} className="flex gap-1.5">
          <ToolButton
            label={t("zoomOut")}
            disabled={zoomIndex === 0}
            onClick={() => setZoomIndex((index) => Math.max(0, index - 1))}
          >
            −
          </ToolButton>
          <ToolButton
            label={t("zoomIn")}
            disabled={zoomIndex === zoomSteps.length - 1}
            onClick={() =>
              setZoomIndex((index) => Math.min(zoomSteps.length - 1, index + 1))
            }
          >
            +
          </ToolButton>
          <ToolButton label={t("reset")} disabled={zoomIndex === 0} onClick={() => setZoomIndex(0)}>
            {t("reset")}
          </ToolButton>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-soma-line bg-[#101820]">
        {/*
          Continuous stage fill. Organ plates render as CSS images so SVG
          letterboxing cannot leave a darker central band over the glow.
        */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgb(104_216_192/0.14),transparent_68%)]"
        />
        <div
          className="relative flex h-[22rem] w-full items-center justify-center sm:h-[28rem] md:h-[32rem] lg:h-[min(48rem,calc(100svh-15.5rem))]"
          style={{ containerType: "size" }}
        >
        {plate && fillView ? (
          <div
            role="img"
            aria-label={`${label}, vista ${viewLabel}`}
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
        {plate && !fillView ? (
          <img
            src={plate.src}
            alt={`${label}, vista ${viewLabel}`}
            className="max-h-full max-w-full object-contain"
            style={{ transform: zoom === 1 ? undefined : `scale(${zoom})` }}
            draggable={false}
          />
        ) : null}
        {showRegions || fillView ? (
          <svg
            viewBox={`0 0 ${ATLAS_VIEWBOX.width} ${ATLAS_VIEWBOX.height}`}
            role="presentation"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full"
          >
            <g transform={regionZoomTransform} className={showRegions ? "pointer-events-auto" : undefined}>
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
        ) : null}
        {!plate ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-8">
            <div className="flex max-w-[16rem] flex-col items-center gap-3 text-center">
              <ImageOff className="h-8 w-8 text-soma-ink-muted" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-soma-ink-secondary">{unavailableMessage}</p>
            </div>
          </div>
        ) : null}
        </div>
      </div>
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
