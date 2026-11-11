/**
 * GAME-07 map and stage emblems. Knowledge and perseverance use approved circular WebP.
 */

import type { ExpeditionNodeId } from "./expedition-model.js";

export interface ExpeditionMarkAsset {
  src: string;
  srcSet: string;
}

/** Visual diameter of a map marker (hit target stays 44px). */
export const KNOWLEDGE_MARK_PX = 36;
export const KNOWLEDGE_MARK_SIZES = "36px";
export const STAGE_EMBLEM_PX = 56;
export const STAGE_EMBLEM_SIZES = "56px";

function circularMark(fileStem: string): ExpeditionMarkAsset {
  return {
    src: `/images/expedition/icons/${fileStem}-192.webp`,
    srcSet: `/images/expedition/icons/${fileStem}-96.webp 96w, /images/expedition/icons/${fileStem}-192.webp 192w`,
  };
}

const KNOWLEDGE_MARKS: Record<
  "neurotransmitters" | "orientation" | "substances" | "processes" | "recovery",
  ExpeditionMarkAsset
> = {
  neurotransmitters: circularMark("knowledge-neuroscience"),
  orientation: circularMark("knowledge-anatomy"),
  substances: circularMark("knowledge-substances"),
  processes: circularMark("knowledge-processes"),
  recovery: circularMark("knowledge-recovery"),
};

const PERSEVERANCE_MARKS: Record<
  "alcohol" | "nicotine" | "cannabis" | "cocaine" | "caffeine",
  ExpeditionMarkAsset
> = {
  alcohol: circularMark("perseverance-alcohol"),
  nicotine: circularMark("perseverance-nicotine"),
  cannabis: circularMark("perseverance-cannabis"),
  cocaine: circularMark("perseverance-cocaine"),
  caffeine: circularMark("perseverance-caffeine"),
};

export function knowledgeMark(
  id: ExpeditionNodeId,
): ExpeditionMarkAsset | null {
  if (id in KNOWLEDGE_MARKS) {
    return KNOWLEDGE_MARKS[id as keyof typeof KNOWLEDGE_MARKS];
  }
  return null;
}

export function perseveranceMark(
  id: ExpeditionNodeId,
): ExpeditionMarkAsset | null {
  if (id in PERSEVERANCE_MARKS) {
    return PERSEVERANCE_MARKS[id as keyof typeof PERSEVERANCE_MARKS];
  }
  return null;
}

export function nodeMark(id: ExpeditionNodeId): ExpeditionMarkAsset | null {
  return knowledgeMark(id) ?? perseveranceMark(id);
}
