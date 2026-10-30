import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Somi } from "../somi/SomiView.js";
import type { SomiState } from "../somi/somi-model.js";
import { ONB_TOUR_LG_QUERY } from "./tour-steps.js";
import { tourGhostBtn, tourPrimaryBtn } from "./tour-buttons.js";
import {
  TOUR_SPOTLIGHT_PAD,
  inflateBox,
  placeTourCard,
  tourCardWidth,
  type TourBox,
} from "./tour-layout.js";
import "./tour-chrome.css";

function isDesktopViewport(): boolean {
  return window.matchMedia(ONB_TOUR_LG_QUERY).matches;
}

function mobileDockBox(): DOMRect | null {
  const dock = document.querySelector('[data-onb="nav-mobile"]');
  if (!dock) return null;
  const style = getComputedStyle(dock);
  if (style.display === "none" || style.visibility === "hidden") return null;
  const rect = dock.getBoundingClientRect();
  return rect.height > 8 ? rect : null;
}

export function TourSpotlight({ hole }: { hole: TourBox | null }) {
  if (!hole) return null;
  const ring = inflateBox(hole, TOUR_SPOTLIGHT_PAD);
  return (
    <div className="onb-scrim" data-onb-spotlight="true" aria-hidden="true">
      <div
        className="onb-hole"
        style={{
          top: ring.top,
          left: ring.left,
          width: ring.width,
          height: ring.height,
        }}
      />
    </div>
  );
}

export function TourTalkCard({
  somi,
  labelledBy,
  chrome,
  children,
  hole,
  compactBottom,
}: {
  somi: SomiState;
  labelledBy: string;
  chrome: string;
  children: ReactNode;
  hole: TourBox | null;
  compactBottom: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState(220);
  const [viewport, setViewport] = useState(() => {
    if (typeof window === "undefined") return { width: 1280, height: 800 };
    const view = window.visualViewport;
    return {
      width: view?.width ?? window.innerWidth,
      height: view?.height ?? window.innerHeight,
    };
  });

  useLayoutEffect(() => {
    function readViewport() {
      const view = window.visualViewport;
      setViewport({
        width: view?.width ?? window.innerWidth,
        height: view?.height ?? window.innerHeight,
      });
    }
    function readCardHeight() {
      const node = cardRef.current;
      if (!node) return;
      const next = node.getBoundingClientRect().height;
      if (next > 0) {
        setCardHeight((prev) => (Math.abs(prev - next) < 1 ? prev : next));
      }
    }
    window.addEventListener("resize", readViewport);
    window.visualViewport?.addEventListener("resize", readViewport);
    const node = cardRef.current;
    const observer = new ResizeObserver(readCardHeight);
    if (node) observer.observe(node);
    return () => {
      window.removeEventListener("resize", readViewport);
      window.visualViewport?.removeEventListener("resize", readViewport);
      observer.disconnect();
    };
  }, []);

  const dock = typeof document === "undefined" ? null : mobileDockBox();
  const desktop = typeof window !== "undefined" && isDesktopViewport();
  const compact = compactBottom || Boolean(dock) || !desktop;
  const width = tourCardWidth(viewport.width, !compact);
  const reserve = dock ? dock.height + 8 : compact ? 24 : 16;
  const pos = placeTourCard({
    viewport,
    card: { width, height: cardHeight },
    hole: compact ? null : hole,
    desktop: !compact,
    bottomReserve: reserve,
  });

  return (
    <div
      ref={cardRef}
      data-onb-chrome={chrome}
      role="dialog"
      aria-modal={chrome === "engine"}
      aria-labelledby={labelledBy}
      data-onb-compact={compact ? "true" : "false"}
      className="onb-card rounded-2xl px-4 pb-4 pt-3"
      style={{ top: pos.top, left: pos.left, width }}
    >
      <div className="onb-somi-peek">
        <Somi state={somi} size={compact ? "small" : "medium"} />
      </div>
      <div className="onb-card-body">{children}</div>
    </div>
  );
}

export function TourActions({
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: {
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel: string;
  onSecondary: () => void;
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <button type="button" className={tourPrimaryBtn} onClick={onPrimary}>
        {primaryLabel}
      </button>
      <button type="button" className={tourGhostBtn} onClick={onSecondary}>
        {secondaryLabel}
      </button>
    </div>
  );
}

export function TourProgress({ current, total }: { current: number; total: number }) {
  const { t } = useTranslation("onboarding-tour");
  return (
    <div className="onb-progress mb-2">
      <p className="onb-step-status text-[11px] font-medium uppercase tracking-[0.14em] text-soma-ink-muted">
        {t("stepStatus", { current, total })}
      </p>
      <div className="onb-progress-bar" aria-hidden="true">
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            className={`h-1 flex-1 rounded-full ${
              index <= current - 1 ? "bg-soma-shell-accent" : "bg-soma-line"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
