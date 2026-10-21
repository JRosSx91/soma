import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { previewFocus } from "../focus.js";
import { narrativePhases, type NarrativePhase } from "../anatomy/narrative-catalog.js";
import {
  publishedAdviceCatalog,
  type EducationalAdviceItem,
} from "../anatomy/advice-catalog.js";
import { buildAdvicePanelModel } from "../anatomy/advice-panel-model.js";
import { SubstanceIllustration } from "./SubstanceIllustration.js";

/**
 * Consejos tab. Reads only `publishedAdviceCatalog` unless a test injects a catalog.
 * Does not import the editorial sidecar or the unpublished applicability matcher.
 */
export function AdvicePanel({
  organId,
  substanceId,
  phase,
  onSubstance,
  onPhase,
  catalog = publishedAdviceCatalog,
  resolveCopy,
}: {
  organId: string | null;
  substanceId: string | null;
  phase: NarrativePhase;
  onSubstance: (id: string) => void;
  onPhase: (phase: NarrativePhase) => void;
  catalog?: readonly EducationalAdviceItem[];
  resolveCopy?: (key: string) => string | null;
}) {
  const { t } = useTranslation(["anatomy", "substances", "phases"]);
  const model = buildAdvicePanelModel(organId, substanceId, phase, catalog);
  const copy = resolveCopy ?? ((key: string) => lookupPublicAdviceCopy(t, key));

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-soma-ink-muted">{t("anatomy:adviceDisclaimer")}</p>

      {model.showSelectors ? (
        <>
          <fieldset className="min-w-0 border-0 p-0">
            <legend className="sr-only">{t("anatomy:substanceLegend")}</legend>
            <div className="flex flex-wrap gap-1.5">
              {model.substanceOptions.map((id) => {
                const selected = id === substanceId;
                return (
                  <label
                    key={id}
                    className={`${choiceClass(selected)} flex-1 flex-col items-center gap-1 px-1 py-1.5`}
                  >
                    <input
                      type="radio"
                      name="anatomy-advice-substance"
                      value={id}
                      checked={selected}
                      onChange={() => onSubstance(id)}
                      className="sr-only"
                    />
                    <span className="pointer-events-none flex h-8 w-8 items-center justify-center">
                      <SubstanceIllustration name={id} className="h-8 w-8" iconClassName="h-4 w-4" />
                    </span>
                    <span className="max-w-full truncate text-[11px] leading-tight">
                      {t(`substances:${id}.name`, { defaultValue: id })}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="min-w-0 border-0 p-0">
            <legend className="sr-only">{t("anatomy:phaseLegend")}</legend>
            <div className="grid grid-cols-2 gap-1.5">
              {narrativePhases.map((item) => {
                const selected = item === phase;
                return (
                  <label key={item} className={`${choiceClass(selected)} flex-col px-2 py-1.5 text-left`}>
                    <input
                      type="radio"
                      name="anatomy-advice-phase"
                      value={item}
                      checked={selected}
                      onChange={() => onPhase(item)}
                      className="sr-only"
                    />
                    <span className="block text-[11px] leading-tight">{t(`phases:${item}`)}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </>
      ) : null}

      {model.empty ? (
        <p className="rounded-xl border border-dashed border-soma-line px-3 py-4 text-soma-ink-muted">
          {model.emptyReason === "no_published_for_selection" || model.emptyReason === "no_substance"
            ? t("anatomy:adviceEmptySelection")
            : t("anatomy:advicePlaceholder")}
        </p>
      ) : (
        <>
          {model.persistent.length > 0 ? (
            <section className="space-y-2" aria-labelledby="anatomy-advice-persistent">
              <h3 id="anatomy-advice-persistent" className="text-xs font-semibold text-soma-ink">
                {t("anatomy:advicePersistentHeading")}
              </h3>
              <ul className="space-y-2">
                {model.persistent.map((item) => (
                  <AdviceCard key={item.id} item={item} copy={copy} />
                ))}
              </ul>
            </section>
          ) : null}

          {model.contextualGroups.map((group) => (
            <section
              key={group.category}
              className="space-y-2"
              aria-labelledby={`anatomy-advice-${group.category}`}
            >
              <h3
                id={`anatomy-advice-${group.category}`}
                className="text-xs font-semibold text-soma-ink"
              >
                {t(`anatomy:adviceCategory.${group.category}`)}
              </h3>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <AdviceCard key={item.id} item={item} copy={copy} />
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </div>
  );
}

function AdviceCard({
  item,
  copy,
}: {
  item: EducationalAdviceItem;
  copy: (key: string) => string | null;
}) {
  const { t } = useTranslation("anatomy");
  const title = copy(item.titleKey);
  const body = copy(item.bodyKey);
  if (!title && !body) {
    return null;
  }

  const source = item.reference.source.trim();
  const status = item.reference.status;

  return (
    <li className="rounded-xl border border-soma-line bg-soma-canvas/40 px-3 py-2">
      {title ? <p className="text-sm font-medium text-soma-ink">{title}</p> : null}
      {body ? <p className="mt-1.5 text-xs leading-relaxed text-soma-ink-secondary">{body}</p> : null}
      {source || status !== "verified" ? (
        <div className="mt-2 space-y-1 text-[11px] leading-relaxed text-soma-ink-muted">
          {source ? <p>{source}</p> : null}
          {status !== "verified" ? <p>{t(`referenceStatus.${status}`)}</p> : null}
        </div>
      ) : null}
    </li>
  );
}

function lookupPublicAdviceCopy(t: TFunction, key: string): string | null {
  const value = t(key, { defaultValue: "" });
  if (!value.trim() || value === key) return null;
  return value;
}

function choiceClass(selected: boolean): string {
  return `${previewFocus} flex min-w-0 cursor-pointer rounded-xl border has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-soma-focus ${
    selected
      ? "border-soma-action/80 bg-soma-raised/40 text-soma-ink"
      : "border-soma-line bg-soma-canvas/40 text-soma-ink-secondary"
  }`;
}
