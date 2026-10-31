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
  const preferredMinTop = TOUR_VIEW_MARGIN + peek;
  const minTop = Math.min(preferredMinTop, Math.max(TOUR_VIEW_MARGIN, maxTopByBottom));
  const maxTop = Math.max(minTop, maxTopByBottom);
  const minLeft = TOUR_VIEW_MARGIN;
  const maxLeft = Math.max(minLeft, viewport.width - card.width - TOUR_VIEW_MARGIN);
  const safe = (top: number, left: number) => ({
    top: clamp(top, minTop, maxTop),
    left: clamp(left, minLeft, maxLeft),
  });

  if (!desktop) {
    return safe(maxTop, (viewport.width - card.width) / 2);
  }

  if (!hole) {
    return safe(maxTop, maxLeft);
  }

  const candidates = [
    { top: hole.top + hole.height + TOUR_HOLE_GAP, left: hole.left },
    { top: hole.top, left: hole.left + hole.width + TOUR_HOLE_GAP },
    { top: hole.top, left: hole.left - TOUR_HOLE_GAP - card.width },
    { top: hole.top - TOUR_HOLE_GAP - card.height, left: hole.left },
  ];

  for (const raw of candidates) {
    const pos = safe(raw.top, raw.left);
    const cardBox = { ...pos, width: card.width, height: card.height };
    if (!boxesOverlap(cardBox, hole)) return pos;
  }

  return safe(maxTop, maxLeft);
}

export function tourCardWidth(viewportWidth: number, desktop: boolean): number {
  const side = desktop ? TOUR_VIEW_MARGIN * 2 : 32;
  return Math.min(TOUR_CARD_WIDTH, Math.max(240, viewportWidth - side));
}
