import { useLayoutEffect, useState } from "react";
import { tourScrollIntoViewOptions } from "./tour-a11y.js";
import { boxFromElement, type TourBox } from "./tour-layout.js";

function attachBoxListeners(el: Element, update: () => void): () => void {
  const targets: EventTarget[] = [window];
  let node: Element | null = el.parentElement;
  while (node) {
    const style = getComputedStyle(node);
    if (/(auto|scroll)/.test(style.overflowY) || /(auto|scroll)/.test(style.overflow)) {
      targets.push(node);
    }
    node = node.parentElement;
  }
  window.addEventListener("resize", update);
  for (const target of targets) {
    target.addEventListener("scroll", update, { capture: true, passive: true });
  }
  const observer = new ResizeObserver(update);
  observer.observe(el);
  return () => {
    window.removeEventListener("resize", update);
    for (const target of targets) {
      target.removeEventListener("scroll", update, { capture: true });
    }
    observer.disconnect();
  };
}

export function useLiveAnchorBox(el: Element | null): TourBox | null {
  const [version, setVersion] = useState(0);

  useLayoutEffect(() => {
    if (!el) return;
    el.scrollIntoView(tourScrollIntoViewOptions());
    function update() {
      setVersion((current) => current + 1);
    }
    return attachBoxListeners(el, update);
  }, [el]);

  if (version < 0) return null;
  return boxFromElement(el);
}
