import { useLayoutEffect, useRef, type RefObject } from "react";
import {
  TOUR_APP_ROOT,
  captureTourLockSnapshot,
  eventTargetIsInside,
  focusTourCard,
  lockTourBackground,
  readTourOpener,
  restoreTourOpener,
  trapTourTab,
  unlockTourBackground,
  type TourLockSnapshot,
} from "./tour-a11y.js";

export function useTourActiveLock({
  active,
  stepId,
  cardRef,
  onExit,
}: {
  active: boolean;
  stepId: string | null;
  cardRef: RefObject<HTMLElement | null>;
  onExit: () => void;
}): void {
  const openerRef = useRef<HTMLElement | null>(null);
  const onExitRef = useRef(onExit);

  useLayoutEffect(() => {
    onExitRef.current = onExit;
  }, [onExit]);

  useLayoutEffect(() => {
    if (!active) return;
    const card = cardRef.current;
    const root = document.querySelector(TOUR_APP_ROOT);
    openerRef.current = readTourOpener(card);
    focusTourCard(card);

    let snapshot: TourLockSnapshot | null = null;
    if (root instanceof HTMLElement) {
      snapshot = captureTourLockSnapshot(root);
      lockTourBackground(root);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onExitRef.current();
        return;
      }
      if (event.key !== "Tab" || !card) return;
      trapTourTab(event, card);
    }

    function onFocusIn(event: FocusEvent) {
      if (!card) return;
      if (eventTargetIsInside(event.target, card)) return;
      event.stopPropagation();
      focusTourCard(card);
    }

    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("focusin", onFocusIn, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("focusin", onFocusIn, true);
      if (root instanceof HTMLElement && snapshot) {
        unlockTourBackground(root, snapshot);
      }
      restoreTourOpener(openerRef.current);
    };
  }, [active, cardRef]);

  useLayoutEffect(() => {
    if (!active || !stepId) return;
    focusTourCard(cardRef.current);
  }, [active, cardRef, stepId]);
}
