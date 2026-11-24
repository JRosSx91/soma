import { useEffect, type ReactNode } from "react";
import katex from "katex";
import type { EditorialBlock } from "./knowledge-prototype-editorial.js";

function useKatexCss() {
  useEffect(() => {
    void import("katex/dist/katex.min.css");
  }, []);
}

const INLINE_TOKEN = /(\*\*([^*]+)\*\*|\\\((.+?)\\\))/g;

function renderKatex(latex: string, displayMode: boolean) {
  return katex.renderToString(latex, {
    displayMode,
    throwOnError: true,
    output: "html",
    strict: "ignore",
  });
}

export function EditorialInline({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  for (const match of text.matchAll(INLINE_TOKEN)) {
    const index = match.index ?? 0;
    if (index > cursor) nodes.push(text.slice(cursor, index));
    if (match[2]) {
      nodes.push(<strong key={`${index}:b`} className="font-semibold text-white">{match[2]}</strong>);
    } else if (match[3]) {
      nodes.push(<Formula key={`${index}:m`} latex={match[3]} />);
    }
    cursor = index + match[0].length;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return <>{nodes}</>;
}

export function Formula({ latex, display = false }: { latex: string; display?: boolean }) {
  useKatexCss();
  const html = renderKatex(latex, display);
  return (
    <span
      data-prototype-formula={display ? "display" : "inline"}
      role="math"
      aria-label={latex}
      className={display ? "my-3 block max-w-full overflow-x-auto py-1 text-[15px] leading-normal" : "inline-block max-w-full align-middle"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function EditorialBlocks({ blocks }: { blocks: readonly EditorialBlock[] }) {
  return (
    <div className="space-y-3 text-sm leading-7 text-[#d7e4ec]">
      {blocks.map((block, index) => {
        if (block.kind === "heading") {
          return <h3 key={index} className="pt-1 text-base font-semibold tracking-tight text-white">{block.text}</h3>;
        }
        if (block.kind === "formula") {
          return <Formula key={index} latex={block.latex} display />;
        }
        if (block.kind === "list") {
          return (
            <ul key={index} className="list-disc space-y-2 pl-5">
              {block.items.map((item) => <li key={item}><EditorialInline text={item} /></li>)}
            </ul>
          );
        }
        return <p key={index}><EditorialInline text={block.text} /></p>;
      })}
    </div>
  );
}

export function EditorialParagraphs({ paragraphs }: { paragraphs: readonly string[] }) {
  return (
    <div className="space-y-3 text-[15px] leading-7 text-[#d7e4ec]">
      {paragraphs.map((paragraph) => <p key={paragraph}><EditorialInline text={paragraph} /></p>)}
    </div>
  );
}
