import { useTranslation } from "react-i18next";
import type { EducationalNeurotransmitter } from "../anatomy/neurotransmitter-education.js";
import { exploreNeurotransmitterArt } from "../explore/explore-art.js";
import { previewFocus } from "../focus.js";

interface ExploreNeurotransmitterIndexProps {
  ids: readonly EducationalNeurotransmitter[];
  onOpen: (id: EducationalNeurotransmitter) => void;
}

export function ExploreNeurotransmitterIndex({
  ids,
  onOpen,
}: ExploreNeurotransmitterIndexProps) {
  const { t } = useTranslation(["explore", "neurotransmitters"]);

  return (
    <ul className="mt-2 grid grid-cols-2 gap-1.5 min-[360px]:grid-cols-3">
      {ids.map((id) => {
        const name = t(`neurotransmitters:${id}.name`, { defaultValue: id });
        return (
          <li key={id} className="min-w-0">
            <button
              type="button"
              onClick={() => onOpen(id)}
              className={`${previewFocus} flex h-full w-full min-w-0 flex-col items-center gap-1 rounded-xl border border-soma-line bg-[#101820] px-1 py-2 text-center hover:border-soma-line-strong hover:bg-[#15202c]`}
            >
              <span className="flex h-20 w-full items-center justify-center">
                <img
                  src={exploreNeurotransmitterArt[id]}
                  alt=""
                  width={160}
                  height={160}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="max-h-full w-auto max-w-full object-contain"
                />
              </span>
              <span className="w-full min-w-0 px-0.5 text-[10px] font-medium leading-snug break-words hyphens-auto text-soma-ink sm:text-[11px]">
                {name}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
