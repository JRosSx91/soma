import { useTranslation } from "react-i18next";
import { presentCatalogReference } from "../anatomy/present-catalog-reference.js";

/**
 * Separates catalog citation status from model-confidence labels.
 * Does not rewrite scientific prose or invent bibliography.
 */
export function CatalogEvidenceNote({
  rawSource,
  confidenceLevel,
}: {
  rawSource: string;
  confidenceLevel: "high" | "medium" | "low";
}) {
  const { t } = useTranslation("anatomy");
  const presented = presentCatalogReference(rawSource);

  return (
    <div className="space-y-1.5 text-[11px] leading-relaxed text-soma-ink-muted">
      {presented.displayText ? <p>{presented.displayText}</p> : null}
      <p>{t(`referenceStatus.${presented.status}`)}</p>
      <p>
        <span className="font-medium text-soma-ink">
          {t("modelConfidence", { level: t(`confidence.${confidenceLevel}`) })}
        </span>{" "}
        {t(`confidenceMeaning.${confidenceLevel}`)}
      </p>
    </div>
  );
}
