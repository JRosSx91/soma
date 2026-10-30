import { useTranslation } from "react-i18next";
import { Somi } from "./SomiView.js";

/**
 * Isolated, reversible CHR-01 preview on Account. Not a health indicator
 * and not the ONB-01 tutorial.
 */
export function SomiAccountPreview() {
  const { t } = useTranslation("account");

  return (
    <aside
      className="flex items-center gap-4 rounded-2xl border border-soma-line bg-soma-surface px-4 py-3"
      aria-labelledby="somi-preview-title"
    >
      <Somi state="idle" size="medium" animated />
      <div className="min-w-0">
        <p id="somi-preview-title" className="text-sm font-semibold text-soma-ink">
          {t("somiPreviewTitle")}
        </p>
        <p className="mt-1 text-sm text-soma-ink-secondary">{t("somiPreviewHint")}</p>
      </div>
    </aside>
  );
}
