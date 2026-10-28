import {
  isProgressTitleId,
  PROGRESS_TITLE_IDS,
  type ProgressTitleId,
} from "@soma/shared-types";

export const TITLE_EMBLEM_SIZES = [24, 40, 64, 80, 128] as const;

export type TitleEmblemSize = (typeof TITLE_EMBLEM_SIZES)[number];

export const TITLE_EMBLEM_VARIANT_PX = [128, 512] as const;

export type TitleEmblemVariantPx = (typeof TITLE_EMBLEM_VARIANT_PX)[number];

/** Masters stay on disk as `{id}.png`. The UI only loads these WebP variants. */
export const TITLE_EMBLEM_SRC = {
  walker: {
    128: "/images/progress/emblems/walker-128.webp",
    512: "/images/progress/emblems/walker-512.webp",
  },
  explorer: {
    128: "/images/progress/emblems/explorer-128.webp",
    512: "/images/progress/emblems/explorer-512.webp",
  },
  cartographer: {
    128: "/images/progress/emblems/cartographer-128.webp",
    512: "/images/progress/emblems/cartographer-512.webp",
  },
  naturalist: {
    128: "/images/progress/emblems/naturalist-128.webp",
    512: "/images/progress/emblems/naturalist-512.webp",
  },
  researcher: {
    128: "/images/progress/emblems/researcher-128.webp",
    512: "/images/progress/emblems/researcher-512.webp",
  },
  guide: {
    128: "/images/progress/emblems/guide-128.webp",
    512: "/images/progress/emblems/guide-512.webp",
  },
  chronicler: {
    128: "/images/progress/emblems/chronicler-128.webp",
    512: "/images/progress/emblems/chronicler-512.webp",
  },
  pathfinder: {
    128: "/images/progress/emblems/pathfinder-128.webp",
    512: "/images/progress/emblems/pathfinder-512.webp",
  },
  expeditioner: {
    128: "/images/progress/emblems/expeditioner-128.webp",
    512: "/images/progress/emblems/expeditioner-512.webp",
  },
} as const satisfies Record<
  ProgressTitleId,
  Record<TitleEmblemVariantPx, `/images/progress/emblems/${ProgressTitleId}-${TitleEmblemVariantPx}.webp`>
>;

for (const id of PROGRESS_TITLE_IDS) {
  for (const px of TITLE_EMBLEM_VARIANT_PX) {
    if (TITLE_EMBLEM_SRC[id][px] !== `/images/progress/emblems/${id}-${px}.webp`) {
      throw new Error(`Title emblem map missing ${id} @ ${px}`);
    }
  }
}

export function isTitleEmblemSize(value: number): value is TitleEmblemSize {
  return (TITLE_EMBLEM_SIZES as readonly number[]).includes(value);
}

/** 24–64 use the 128px asset; 80 and 128 use 512px for dense displays. */
export function titleEmblemVariantPx(size: TitleEmblemSize): TitleEmblemVariantPx {
  if (!isTitleEmblemSize(size)) {
    throw new Error("Unsupported title emblem size");
  }
  return size <= 64 ? 128 : 512;
}

export function resolveTitleEmblemSrc(titleId: ProgressTitleId, size: TitleEmblemSize): string {
  if (!isProgressTitleId(titleId)) {
    throw new Error("Unknown progress title emblem");
  }
  return TITLE_EMBLEM_SRC[titleId][titleEmblemVariantPx(size)];
}

export function resolveTitleEmblemSize(size: TitleEmblemSize): TitleEmblemSize {
  if (!isTitleEmblemSize(size)) {
    throw new Error("Unsupported title emblem size");
  }
  return size;
}
