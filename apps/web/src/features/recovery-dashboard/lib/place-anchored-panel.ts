export function placeAnchoredPanel(
  trigger: HTMLElement,
  panel: HTMLElement,
  options: { align?: "start" | "end"; minHeight?: number; width?: number } = {},
): void {
  const margin = 8;
  const align = options.align ?? "end";
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
  let left =
    align === "start" ? triggerRect.left : triggerRect.right - width;
  left = Math.min(Math.max(left, margin), viewWidth - margin - width);
  let top = triggerRect.bottom + 8;
  const available = viewHeight - top - margin;
  const maxHeight = Math.max(minHeight, available);
  if (available < minHeight && triggerRect.top > viewHeight / 2) {
    top = Math.max(margin, triggerRect.top - Math.min(maxHeight, triggerRect.top - margin) - 8);
  }
  panel.style.left = `${Math.round(left)}px`;
  panel.style.top = `${Math.round(top)}px`;
  panel.style.width = `${Math.round(width)}px`;
  panel.style.maxHeight = `${Math.round(Math.min(maxHeight, viewHeight - margin * 2))}px`;
  panel.style.zIndex = "70";
}
