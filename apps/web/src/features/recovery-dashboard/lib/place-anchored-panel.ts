export function placeAnchoredPanel(
  trigger: HTMLElement,
  panel: HTMLElement,
  options: {
    align?: "start" | "end";
    anchor?: "bottom" | "right";
    minHeight?: number;
    width?: number;
  } = {},
): void {
  const margin = 8;
  const align = options.align ?? "end";
  const anchor = options.anchor ?? "bottom";
  const minHeight = options.minHeight ?? 160;
  const triggerRect = trigger.getBoundingClientRect();
  const viewWidth = globalThis.innerWidth;
  const viewHeight = globalThis.innerHeight;
  const maxWidth = viewWidth - margin * 2;
  panel.style.position = "fixed";
  panel.style.maxWidth = `${maxWidth}px`;
  if (!options.width) {
    panel.style.width = "max-content";
  }
  const measured = options.width ?? panel.offsetWidth;
  const width = Math.min(Math.max(measured, 1), maxWidth);
  const heightCap = Math.min(
    Math.max(panel.offsetHeight || minHeight, minHeight),
    viewHeight - margin * 2,
  );

  let left: number;
  let top: number;
  if (anchor === "right") {
    left = triggerRect.right + 8;
    if (left + width > viewWidth - margin) {
      left = Math.max(margin, triggerRect.left - 8 - width);
    }
    left = Math.min(Math.max(left, margin), viewWidth - margin - width);
    top = triggerRect.top;
    if (top + heightCap > viewHeight - margin) {
      top = Math.max(margin, triggerRect.bottom - heightCap);
    }
    top = Math.min(Math.max(top, margin), viewHeight - margin - Math.min(heightCap, minHeight));
  } else {
    left = align === "start" ? triggerRect.left : triggerRect.right - width;
    left = Math.min(Math.max(left, margin), viewWidth - margin - width);
    top = triggerRect.bottom + 8;
    const available = viewHeight - top - margin;
    if (available < minHeight && triggerRect.top > viewHeight / 2) {
      top = Math.max(
        margin,
        triggerRect.top - Math.min(heightCap, triggerRect.top - margin) - 8,
      );
    }
    top = Math.min(Math.max(top, margin), viewHeight - margin - minHeight);
  }

  panel.style.left = `${Math.round(left)}px`;
  panel.style.top = `${Math.round(top)}px`;
  panel.style.width = `${Math.round(width)}px`;
  panel.style.maxHeight = `${Math.round(heightCap)}px`;
  panel.style.zIndex = "70";
}
