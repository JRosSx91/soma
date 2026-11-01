export interface TourBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const TOUR_CARD_WIDTH = 360;
export const TOUR_SPOTLIGHT_PAD = 10;
export const TOUR_VIEW_MARGIN = 12;
export const TOUR_BOTTOM_MARGIN = 16;
export const TOUR_HOLE_GAP = 16;
export const TOUR_SOMI_PEEK = { desktop: 64, mobile: 42 } as const;

export function boxFromElement(el: Element | null): TourBox | null {
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) return null;
  return { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
}

export function inflateBox(box: TourBox, pad: number): TourBox {
  return {
    top: box.top - pad,
    left: box.left - pad,
    width: box.width + pad * 2,
    height: box.height + pad * 2,
  };
}

export function boxesOverlap(a: TourBox, b: TourBox): boolean {
  return (
    a.left < b.left + b.width &&
    a.left + a.width > b.left &&
    a.top < b.top + b.height &&
    a.top + a.height > b.top
  );
}

function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  return Math.min(max, Math.max(min, value));
}

/** Somi sits above the card's top-left; CSS uses ~42% of the card width. */
export function somiPeekBox(
  pos: { top: number; left: number },
  card: { width: number },
  peek: number,
): TourBox {
  return {
    top: pos.top - peek,
    left: pos.left,
    width: Math.min(card.width * 0.42, 112),
    height: peek,
  };
}

export function tourPlacementCoversAnchor(
  pos: { top: number; left: number },
  card: { width: number; height: number },
  hole: TourBox,
  peek: number,
): boolean {
  const cardBox = { ...pos, width: card.width, height: card.height };
  return boxesOverlap(cardBox, hole) || boxesOverlap(somiPeekBox(pos, card, peek), hole);
}

export function placeTourCard(input: {
  viewport: { width: number; height: number };
  card: { width: number; height: number };
  hole: TourBox | null;
  desktop: boolean;
  bottomReserve: number;
}): { top: number; left: number } {
  const { viewport, card, hole, desktop, bottomReserve } = input;
  const peek = desktop ? TOUR_SOMI_PEEK.desktop : TOUR_SOMI_PEEK.mobile;
  const bottomPad = Math.max(TOUR_BOTTOM_MARGIN, bottomReserve);
  const maxTopByBottom = viewport.height - card.height - bottomPad;
  const minLeft = TOUR_VIEW_MARGIN;
  const maxLeft = Math.max(minLeft, viewport.width - card.width - TOUR_VIEW_MARGIN);
  /** Keep a strip of the card on-screen so Next/Skip stay reachable. */
  const minVisibleCard = Math.min(card.height, 160);
  const latestTopForControls = viewport.height - minVisibleCard;

  if (!desktop) {
    const minTop = Math.min(
      TOUR_VIEW_MARGIN + peek,
      Math.max(TOUR_VIEW_MARGIN, maxTopByBottom),
    );
    const maxTop = Math.max(minTop, maxTopByBottom);
    return {
      top: clamp(maxTopByBottom, minTop, maxTop),
      left: clamp((viewport.width - card.width) / 2, minLeft, maxLeft),
    };
  }

  const clampLeft = (left: number) => clamp(left, minLeft, maxLeft);

  if (!hole) {
    return {
      top: clamp(
        maxTopByBottom,
        TOUR_VIEW_MARGIN,
        Math.max(TOUR_VIEW_MARGIN, maxTopByBottom),
      ),
      left: maxLeft,
    };
  }

  const candidates = [
    { top: hole.top + hole.height + TOUR_HOLE_GAP + peek, left: hole.left },
    { top: hole.top + hole.height + TOUR_HOLE_GAP, left: hole.left },
    { top: hole.top + hole.height + TOUR_HOLE_GAP, left: maxLeft },
    { top: hole.top, left: hole.left + hole.width + TOUR_HOLE_GAP },
    { top: hole.top, left: hole.left - TOUR_HOLE_GAP - card.width },
    { top: hole.top - TOUR_HOLE_GAP - card.height, left: hole.left },
    { top: maxTopByBottom, left: maxLeft },
    { top: maxTopByBottom, left: minLeft },
  ];

  const fullyOnScreen = (pos: { top: number; left: number }) =>
    pos.top >= TOUR_VIEW_MARGIN &&
    pos.top + card.height <= viewport.height - bottomPad + 0.5;

  const onScreenClear = candidates
    .map((raw) => ({ top: raw.top, left: clampLeft(raw.left) }))
    .filter((pos) => fullyOnScreen(pos) && !tourPlacementCoversAnchor(pos, card, hole, peek));
  if (onScreenClear[0]) return onScreenClear[0];

  const clearAnchor = candidates
    .map((raw) => ({
      top: clamp(raw.top, TOUR_VIEW_MARGIN, latestTopForControls),
      left: clampLeft(raw.left),
    }))
    .filter((pos) => !tourPlacementCoversAnchor(pos, card, hole, peek));
  if (clearAnchor[0]) return clearAnchor[0];

  const belowHole = hole.top + hole.height + TOUR_HOLE_GAP;
  return {
    top: clamp(belowHole, TOUR_VIEW_MARGIN, latestTopForControls),
    left: clampLeft(hole.left),
  };
}

export function tourCardWidth(viewportWidth: number, desktop: boolean): number {
  const side = desktop ? TOUR_VIEW_MARGIN * 2 : 32;
  return Math.min(TOUR_CARD_WIDTH, Math.max(240, viewportWidth - side));
}
