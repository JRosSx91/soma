import { useTranslation } from "react-i18next";
import { previewFocus } from "../features/recovery-dashboard/focus.js";

export const MAIN_CONTENT_ID = "main-content";

export const skipToContentClass = `${previewFocus} sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-lg focus:bg-soma-action focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#081018]`;

export function SkipToContent({
  targetId = MAIN_CONTENT_ID,
}: {
  targetId?: string;
}) {
  const { t } = useTranslation("common");

  return (
    <a href={`#${targetId}`} className={skipToContentClass}>
      {t("skipToContent")}
    </a>
  );
}
