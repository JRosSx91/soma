import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
import { previewFocus } from "../recovery-dashboard/focus.js";
import {
  atlasSystems,
  bodyAtlasView,
} from "../recovery-dashboard/anatomy/atlas-config.js";
import { resolveSystemSheet } from "../recovery-dashboard/anatomy/system-sheet.js";
import {
  applyCrossfadeOpacities,
  beginPlateCrossfade,
  crossfadeOpacities,
  PLATE_CROSSFADE_MS,
  settlePlateLayers,
  type PlateLayer,
} from "../recovery-dashboard/anatomy/plate-crossfade.js";

const FEATURED_SYSTEM_IDS = [
  "nervous-central",
  "cardiovascular",
  "respiratory",
  "digestive",
  "immune",
] as const;

const BODY_PLATE = bodyAtlasView.plates.anterior;
const BODY_SRC = BODY_PLATE?.src ?? "/images/anatomy/body-master-anterior.png";

/**
 * Modest uniform scales for plates whose luminous silhouette is wider
 * than the master (glow / highlight bleed). Values are from 1024×1536
 * bounding boxes; originals are not edited.
 */
const PLATE_SCALE: Record<string, number> = {
  "/images/anatomy/system-central-nervous.png": 0.98,
  "/images/anatomy/respiratory-highlight-anterior.png": 0.97,
  "/images/anatomy/system-digestive.png": 0.975,
};

/** Plates whose silhouette weight differs enough that overlap ghosts. */
const CUT_PLATES = new Set([
  "/images/anatomy/respiratory-highlight-anterior.png",
  "/images/anatomy/system-digestive.png",
  "/images/anatomy/system-central-nervous.png",
  "/images/anatomy/system-integumentary.png",
]);

function plateScale(src: string): number {
  return PLATE_SCALE[src] ?? 1;
}

function shouldCut(fromSrc: string, toSrc: string): boolean {
  return fromSrc !== toSrc && (CUT_PLATES.has(fromSrc) || CUT_PLATES.has(toSrc));
}

function useSystemPlateLayers(src: string, reduceMotion: boolean) {
  const [layers, setLayers] = useState<PlateLayer[]>(() => [
    { id: 1, src, opacity: 1 },
  ]);
  const layersRef = useRef(layers);
  layersRef.current = layers;
  const layerSeq = useRef(1);
  const shownSrc = useRef(src);
  const incomingId = useRef(1);
  const cutRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => () => clearTimer(), []);

  useEffect(() => {
    if (src === shownSrc.current) return;
    cutRef.current = shouldCut(shownSrc.current, src);
    shownSrc.current = src;
    const nextId = ++layerSeq.current;
    incomingId.current = nextId;
    clearTimer();
    setLayers((current) => beginPlateCrossfade(current, src, nextId, false));
  }, [src]);

  const runInterval = (
    duration: number,
    apply: (progress: number) => void,
    done: () => void,
  ) => {
    clearTimer();
    const started = performance.now();
    timerRef.current = window.setInterval(() => {
      const progress = Math.min(1, (performance.now() - started) / duration);
      apply(progress);
      if (progress >= 1) {
        clearTimer();
        done();
      }
    }, 32);
  };

  const onIncomingLoad = (layerId: number) => {
    if (layerId !== incomingId.current) return;
    const outgoingStart =
      layersRef.current.find((layer) => layer.id !== layerId)?.opacity ?? 0;
    if (reduceMotion || outgoingStart === 0) {
      setLayers((current) => settlePlateLayers(current, layerId));
      return;
    }

    if (cutRef.current) {
      const fadeMs = Math.max(160, Math.round(PLATE_CROSSFADE_MS * 0.7));
      runInterval(
        fadeMs,
        (progress) => {
          setLayers((current) =>
            current.map((layer) =>
              layer.id === layerId
                ? { ...layer, opacity: 0 }
                : { ...layer, opacity: outgoingStart * (1 - progress) },
            ),
          );
        },
        () => {
          runInterval(
            fadeMs,
            (progress) => {
              setLayers((current) =>
                current.map((layer) =>
                  layer.id === layerId
                    ? { ...layer, opacity: progress }
                    : { ...layer, opacity: 0 },
                ),
              );
            },
            () => setLayers((current) => settlePlateLayers(current, layerId)),
          );
        },
      );
      return;
    }

    const started = performance.now();
    clearTimer();
    timerRef.current = window.setInterval(() => {
      const frame = crossfadeOpacities(
        performance.now() - started,
        PLATE_CROSSFADE_MS,
        outgoingStart,
      );
      if (frame.done) {
        clearTimer();
        setLayers((current) => settlePlateLayers(current, layerId));
        return;
      }
      setLayers((current) =>
        applyCrossfadeOpacities(current, layerId, frame.outgoing, frame.incoming),
      );
    }, 32);
  };

  return { layers, onIncomingLoad };
}

export function LandingV2Atlas() {
  const { t } = useTranslation("landing-v2", {
    bindI18n: "languageChanged loaded added",
  });
  const reduceMotion = Boolean(useReducedMotion());
  const enter = reduceMotion ? { duration: 0 } : { duration: 0.55, ease };
  const fadeUp = reduceMotion ? false : { opacity: 0, y: 12 };
  const systemsLabelId = useId();
  const [systemId, setSystemId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const system = atlasSystems.find((item) => item.id === systemId) ?? null;
  const sheet = system ? resolveSystemSheet(system) : null;
  const plateSrc = sheet?.plate?.src ?? BODY_SRC;
  const { layers, onIncomingLoad } = useSystemPlateLayers(plateSrc, reduceMotion);

  const systemName = (id: string, fallback: string) =>
    t(`atlas.systems.${id}`, { defaultValue: fallback });

  const visibleSystems = useMemo(() => {
    const catalog = showAll
      ? atlasSystems.filter((item) => item.plates.anterior)
      : FEATURED_SYSTEM_IDS.map((id) =>
          atlasSystems.find((item) => item.id === id),
        ).filter((item): item is (typeof atlasSystems)[number] => Boolean(item));
    if (system && !catalog.some((item) => item.id === system.id)) {
      return [...catalog, system];
    }
    return catalog;
  }, [showAll, system]);

  const selectedName = system ? systemName(system.id, system.name) : null;
  const plateAlt = selectedName
    ? t("atlas.plateAltSystem", { name: selectedName })
    : t("atlas.plateAltBody");
  const panelTitle = selectedName ?? t("atlas.overviewTitle");
  const panelBody = system
    ? t(`atlas.blurbs.${system.id}`)
    : t("atlas.overviewBody");

  return (
    <section
      className={`relative overflow-x-hidden bg-[#081018] px-4 py-8 sm:px-6 lg:px-12 lg:py-5 xl:px-16 ${
        showAll
          ? "lg:min-h-svh"
          : "lg:flex lg:h-svh lg:max-h-svh lg:flex-col lg:overflow-hidden"
      }`}
      aria-labelledby="landing-v2-atlas-title"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_12%,rgba(134,183,232,0.14),transparent_44%),radial-gradient(ellipse_at_88%_80%,rgba(104,216,192,0.1),transparent_40%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-soma-physiology/25 to-transparent"
      />

      <div
        className={`relative mx-auto flex w-full max-w-[88rem] flex-col gap-3 lg:gap-3 ${
          showAll ? "" : "lg:min-h-0 lg:flex-1"
        }`}
      >
        <header className="max-w-3xl shrink-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-soma-action">
            {t("atlas.eyebrow")}
          </p>
          <h2
            id="landing-v2-atlas-title"
            className="mt-2 text-3xl font-semibold tracking-tight text-soma-ink sm:text-4xl lg:text-[2.35rem] lg:leading-[1.1] xl:text-[2.75rem]"
          >
            {t("atlas.title")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-soma-ink-secondary sm:text-base">
            {t("atlas.subtitle")}
          </p>
        </header>

        <div
          className={`grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,23rem)] lg:gap-8 ${
            showAll ? "" : "lg:h-full lg:min-h-0 lg:flex-1 lg:grid-rows-[minmax(0,1fr)]"
          }`}
        >
          <motion.div
            className={`flex min-h-0 min-w-0 items-center justify-center overflow-hidden rounded-3xl border border-soma-line/80 bg-soma-canvas/70 shadow-[0_24px_80px_rgba(8,16,24,0.45)] ${
              showAll
                ? "h-[min(36rem,70svh)]"
                : "h-[min(20rem,50svh)] sm:h-[min(28rem,60svh)] lg:h-full"
            }`}
            initial={fadeUp}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={enter}
          >
            <div
              role="img"
              aria-label={plateAlt}
              className="relative h-full w-auto max-h-full max-w-full"
              style={{ aspectRatio: "1024 / 1536" }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(104,216,192,0.12),transparent_68%)]"
              />
              {layers.map((layer) => {
                const scale = plateScale(layer.src);
                return (
                  <img
                    key={layer.id}
                    src={layer.src}
                    alt=""
                    width={1024}
                    height={1536}
                    decoding="async"
                    draggable={false}
                    onLoad={() => onIncomingLoad(layer.id)}
                    className="absolute inset-0 h-full w-full object-contain object-center"
                    style={{
                      opacity: layer.opacity,
                      transform: scale === 1 ? undefined : `scale(${scale})`,
                      transformOrigin: "center center",
                    }}
                  />
                );
              })}
              <p className="sr-only" aria-live="polite">
                {plateAlt}
              </p>
            </div>
          </motion.div>

          <div className="flex min-w-0 flex-col gap-3 lg:min-h-0 lg:justify-center">
            <motion.div
              initial={fadeUp}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ ...enter, delay: reduceMotion ? 0 : 0.1 }}
            >
              <p
                id={systemsLabelId}
                className="text-[11px] font-medium uppercase tracking-[0.18em] text-soma-ink-muted"
              >
                {t("atlas.systemsLabel")}
              </p>
              <div
                role="group"
                aria-labelledby={systemsLabelId}
                className="mt-2 flex flex-wrap gap-1.5"
              >
                <button
                  type="button"
                  aria-pressed={systemId === null}
                  onClick={() => setSystemId(null)}
                  className={`${previewFocus} rounded-full border px-2.5 py-1 text-sm transition-colors ${
                    systemId === null
                      ? "border-soma-action/80 bg-soma-action/10 text-soma-ink"
                      : "border-soma-line text-soma-ink-secondary hover:border-soma-line-strong hover:text-soma-ink"
                  }`}
                >
                  {t("atlas.overviewAction")}
                </button>
                {visibleSystems.map((item) => {
                  const selected = item.id === systemId;
                  const label = systemName(item.id, item.name);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setSystemId(item.id)}
                      className={`${previewFocus} rounded-full border px-2.5 py-1 text-sm transition-colors ${
                        selected
                          ? "border-soma-action/80 bg-soma-action/10 text-soma-ink"
                          : "border-soma-line text-soma-ink-secondary hover:border-soma-line-strong hover:text-soma-ink"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                aria-expanded={showAll}
                onClick={() => setShowAll((current) => !current)}
                className={`${previewFocus} mt-2 text-sm text-soma-physiology underline-offset-4 hover:underline`}
              >
                {showAll ? t("atlas.showFeatured") : t("atlas.showAll")}
              </button>
            </motion.div>

            <motion.aside
              className="rounded-2xl border border-soma-line/80 bg-[#081018]/40 px-4 py-3 sm:px-5"
              aria-live="polite"
              initial={fadeUp}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ ...enter, delay: reduceMotion ? 0 : 0.18 }}
            >
              <h3 className="text-base font-semibold tracking-tight text-soma-ink lg:text-lg">
                {panelTitle}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-soma-ink-secondary">
                {panelBody}
              </p>
              {sheet?.emptySystem ? (
                <p className="mt-2 text-xs leading-relaxed text-soma-ink-muted">
                  {t("atlas.emptySystem")}
                </p>
              ) : null}
            </motion.aside>

            <p className="text-[11px] leading-relaxed text-soma-ink-muted">
              {t("atlas.disclaimer")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
