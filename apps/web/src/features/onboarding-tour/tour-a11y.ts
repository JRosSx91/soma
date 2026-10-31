export const TOUR_APP_ROOT = "[data-onb-app-root]";

export const TOUR_FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

export const TOUR_MAIN_FALLBACK_ID = "main-content";

export function wrapFocusIndex(count: number, current: number, shiftKey: boolean): number {
  if (count <= 0) return 0;
  if (shiftKey) return current <= 0 ? count - 1 : current - 1;
  return current >= count - 1 ? 0 : current + 1;
}

export function eventTargetIsInside(target: EventTarget | null, root: EventTarget | null): boolean {
  if (!(target instanceof Node) || !(root instanceof Node)) return false;
  return root === target || root.contains(target);
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function tourScrollIntoViewOptions(): ScrollIntoViewOptions {
  return {
    block: "nearest",
    inline: "nearest",
    behavior: "auto",
  };
}

export function focusableIn(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(TOUR_FOCUSABLE)].filter((node) => {
    if (node.closest("[hidden]")) return false;
    if (node.getAttribute("aria-hidden") === "true") return false;
    return node.getClientRects().length > 0;
  });
}

export function readTourOpener(panel: HTMLElement | null): HTMLElement | null {
  const active = document.activeElement;
  if (!(active instanceof HTMLElement)) return null;
  if (active === document.body) return null;
  if (panel && (active === panel || panel.contains(active))) return null;
  return active;
}

export interface TourLockSnapshot {
  hadInert: boolean;
  inertValue: boolean;
  hadAriaHidden: boolean;
  ariaHiddenValue: string | null;
}

export interface TourLockTarget {
  inert: boolean;
  hasAttribute(name: string): boolean;
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
}

export function captureTourLockSnapshot(el: TourLockTarget): TourLockSnapshot {
  return {
    hadInert: el.hasAttribute("inert"),
    inertValue: el.inert,
    hadAriaHidden: el.hasAttribute("aria-hidden"),
    ariaHiddenValue: el.getAttribute("aria-hidden"),
  };
}

export function lockTourBackground(el: TourLockTarget): void {
  el.inert = true;
  el.setAttribute("aria-hidden", "true");
}

export function unlockTourBackground(el: TourLockTarget, snapshot: TourLockSnapshot): void {
  if (snapshot.hadInert) el.inert = snapshot.inertValue;
  else {
    el.inert = false;
    el.removeAttribute("inert");
  }
  if (snapshot.hadAriaHidden && snapshot.ariaHiddenValue != null) {
    el.setAttribute("aria-hidden", snapshot.ariaHiddenValue);
    return;
  }
  el.removeAttribute("aria-hidden");
}

export function restoreTourOpener(opener: HTMLElement | null): void {
  if (opener?.isConnected) {
    opener.focus();
    return;
  }
  const main = document.getElementById(TOUR_MAIN_FALLBACK_ID);
  if (!(main instanceof HTMLElement)) return;
  if (!main.hasAttribute("tabindex")) main.tabIndex = -1;
  main.focus();
}

export function focusTourCard(card: HTMLElement | null): void {
  if (!card) return;
  const nodes = focusableIn(card);
  (nodes[0] ?? card).focus();
}

export function trapTourTab(event: KeyboardEvent, card: HTMLElement): void {
  const nodes = focusableIn(card);
  if (nodes.length === 0) {
    event.preventDefault();
    card.focus();
    return;
  }
  event.preventDefault();
  const active = document.activeElement;
  const current = nodes.findIndex((node) => node === active);
  if (current < 0) {
    (event.shiftKey ? nodes[nodes.length - 1] : nodes[0])?.focus();
    return;
  }
  nodes[wrapFocusIndex(nodes.length, current, event.shiftKey)]?.focus();
}
