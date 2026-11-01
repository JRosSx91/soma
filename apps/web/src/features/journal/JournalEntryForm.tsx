import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  JOURNAL_EMOTION_IDS,
  JOURNAL_TRIGGER_IDS,
  journalOccurredOnMax,
} from "@soma/shared-types";
import { previewFocus } from "../recovery-dashboard/focus.js";
import type { ApiSubstance } from "../../shared/api/types.js";
import {
  JOURNAL_BODY_MAX,
  JOURNAL_SCALE_MAX,
  JOURNAL_SCALE_MIN,
  JOURNAL_TAG_MAX,
  JOURNAL_TITLE_MAX,
  JOURNAL_WELLBEING_SCALE_MAX,
  JOURNAL_WELLBEING_SCALE_MIN,
  localCivilDate,
  type JournalEntry,
  type JournalEntryWrite,
  type JournalFormIssue,
  validateJournalWrite,
} from "./journal-model.js";

interface JournalEntryFormProps {
  entry?: JournalEntry | null;
  substances: readonly ApiSubstance[];
  saving: boolean;
  error: string | null;
  onSubmit: (draft: JournalEntryWrite) => void;
  onCancel: () => void;
  /** GET-only recovery after an unconfirmed write. Never posts again. */
  recoveryLabel?: string;
  onRecovery?: () => void;
}

const FEELING_SCALES = ["mood", "sleep", "energy", "anxiety"] as const;

export function JournalEntryForm({
  entry,
  substances,
  saving,
  error,
  onSubmit,
  onCancel,
  recoveryLabel,
  onRecovery,
}: JournalEntryFormProps) {
  const { t } = useTranslation("journal");
  const [occurredOn, setOccurredOn] = useState(entry?.occurredOn ?? localCivilDate());
  const [wellbeingRating, setWellbeingRating] = useState<number | null>(
    entry?.wellbeingRating ?? null,
  );
  const [mood, setMood] = useState<number | null>(entry?.mood ?? null);
  const [sleep, setSleep] = useState<number | null>(entry?.sleep ?? null);
  const [energy, setEnergy] = useState<number | null>(entry?.energy ?? null);
  const [anxiety, setAnxiety] = useState<number | null>(entry?.anxiety ?? null);
  const [cravingIntensity, setCravingIntensity] = useState<number | null>(
    entry?.cravingIntensity ?? null,
  );
  const [cravingSubstanceId, setCravingSubstanceId] = useState<string | null>(
    entry?.cravingSubstanceId ?? null,
  );
  const [emotionIds, setEmotionIds] = useState<string[]>(entry?.emotionIds ?? []);
  const [triggerIds, setTriggerIds] = useState<string[]>(entry?.triggerIds ?? []);
  const [title, setTitle] = useState(entry?.title ?? "");
  const [body, setBody] = useState(entry?.body ?? "");
  const [highlighted, setHighlighted] = useState(entry?.highlighted ?? false);
  const [learning, setLearning] = useState(entry?.learning ?? false);
  const [issue, setIssue] = useState<JournalFormIssue | null>(null);
  const maxDate = useMemo(() => journalOccurredOnMax(), []);

  const scaleSetters = {
    mood: setMood,
    sleep: setSleep,
    energy: setEnergy,
    anxiety: setAnxiety,
  } as const;
  const scaleValues = { mood, sleep, energy, anxiety };

  function toggleTag(
    list: string[],
    setList: (next: string[]) => void,
    id: string,
  ) {
    if (list.includes(id)) {
      setList(list.filter((item) => item !== id));
      return;
    }
    if (list.length >= JOURNAL_TAG_MAX) {
      setIssue("tooManyTags");
      return;
    }
    setIssue(null);
    setList([...list, id]);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const draft: JournalEntryWrite = {
      occurredOn,
      mood,
      sleep,
      energy,
      anxiety,
      cravingIntensity,
      cravingSubstanceId,
      wellbeingRating,
      title: title.trim() ? title : null,
      body: body.trim() ? body : null,
      highlighted,
      learning,
      emotionIds,
      triggerIds,
    };
    const nextIssue = validateJournalWrite(draft);
    if (nextIssue) {
      setIssue(nextIssue);
      return;
    }
    setIssue(null);
    onSubmit(draft);
  }

  const fieldErrorId = "journal-field-error";
  const formErrorId = "journal-form-error";
  const dateInvalid = issue === "invalidDate";
  const titleInvalid = issue === "titleTooLong";
  const bodyInvalid = issue === "bodyTooLong";
  const wellbeingInvalid = issue === "invalidWellbeing";
  const tagsInvalid = issue === "tooManyTags";
  const fieldIssue =
    dateInvalid ||
    titleInvalid ||
    bodyInvalid ||
    wellbeingInvalid ||
    tagsInvalid;

  return (
    <form className="flex flex-col gap-6 pr-1" onSubmit={handleSubmit} noValidate>
      <label htmlFor="journal-occurred-on" className="flex min-w-0 flex-col gap-1 text-sm">
        <span className="text-soma-ink-secondary">{t("form.occurredOn")}</span>
        <input
          id="journal-occurred-on"
          type="date"
          required
          min="1970-01-01"
          max={maxDate}
          value={occurredOn}
          onChange={(event) => setOccurredOn(event.target.value)}
          aria-invalid={dateInvalid ? true : undefined}
          aria-describedby={dateInvalid ? fieldErrorId : undefined}
          className={`${previewFocus} w-full min-w-0 rounded-xl border border-soma-line bg-soma-raised px-3 py-2 text-soma-ink`}
        />
      </label>

      <FormSection title={t("form.sectionFeeling")}>
        <p className="text-xs leading-relaxed text-soma-ink-muted">
          {t("form.wellbeingHint")}
        </p>
        <ScaleRow
          legend={t("form.wellbeing")}
          value={wellbeingRating}
          min={JOURNAL_WELLBEING_SCALE_MIN}
          max={JOURNAL_WELLBEING_SCALE_MAX}
          onChange={setWellbeingRating}
          clearLabel={t("form.clearScale")}
          describedBy={wellbeingInvalid ? fieldErrorId : undefined}
          invalid={wellbeingInvalid}
        />
        {FEELING_SCALES.map((scale) => (
          <ScaleRow
            key={scale}
            legend={t(`form.${scale}`)}
            value={scaleValues[scale]}
            min={JOURNAL_SCALE_MIN}
            max={JOURNAL_SCALE_MAX}
            onChange={scaleSetters[scale]}
            clearLabel={t("form.clearScale")}
          />
        ))}
      </FormSection>

      <FormSection title={t("form.sectionTriggers")}>
        <ScaleRow
          legend={t("form.cravingIntensity")}
          value={cravingIntensity}
          min={JOURNAL_SCALE_MIN}
          max={JOURNAL_SCALE_MAX}
          onChange={setCravingIntensity}
          clearLabel={t("form.clearScale")}
        />
        <label htmlFor="journal-substance" className="flex min-w-0 flex-col gap-1 text-sm">
          <span className="text-soma-ink-secondary">{t("form.substance")}</span>
          <select
            id="journal-substance"
            value={cravingSubstanceId ?? ""}
            onChange={(event) =>
              setCravingSubstanceId(event.target.value === "" ? null : event.target.value)
            }
            className={`${previewFocus} w-full min-w-0 rounded-xl border border-soma-line bg-soma-raised px-3 py-2 text-soma-ink`}
          >
            <option value="">{t("form.substanceNone")}</option>
            {substances.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <fieldset aria-describedby={tagsInvalid ? fieldErrorId : undefined}>
          <legend className="text-sm text-soma-ink-secondary">{t("form.emotions")}</legend>
          <p className="mt-1 text-xs text-soma-ink-muted">{t("form.emotionsHint")}</p>
          <ChipList
            ids={JOURNAL_EMOTION_IDS}
            selected={emotionIds}
            label={(id) => t(`emotions.${id}`)}
            onToggle={(id) => toggleTag(emotionIds, setEmotionIds, id)}
          />
        </fieldset>
        <fieldset aria-describedby={tagsInvalid ? fieldErrorId : undefined}>
          <legend className="text-sm text-soma-ink-secondary">{t("form.triggers")}</legend>
          <p className="mt-1 text-xs text-soma-ink-muted">{t("form.triggersHint")}</p>
          <ChipList
            ids={JOURNAL_TRIGGER_IDS}
            selected={triggerIds}
            label={(id) => t(`triggers.${id}`)}
            onToggle={(id) => toggleTag(triggerIds, setTriggerIds, id)}
          />
        </fieldset>
      </FormSection>

      <FormSection title={t("form.sectionReflection")}>
        <label htmlFor="journal-title" className="flex min-w-0 flex-col gap-1 text-sm">
          <span className="text-soma-ink-secondary">{t("form.title")}</span>
          <input
            id="journal-title"
            type="text"
            maxLength={JOURNAL_TITLE_MAX}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            aria-invalid={titleInvalid ? true : undefined}
            aria-describedby={titleInvalid ? fieldErrorId : undefined}
            className={`${previewFocus} w-full min-w-0 rounded-xl border border-soma-line bg-soma-raised px-3 py-2 text-soma-ink`}
          />
        </label>
        <label htmlFor="journal-body" className="flex min-w-0 flex-col gap-1 text-sm">
          <span className="text-soma-ink-secondary">{t("form.body")}</span>
          <textarea
            id="journal-body"
            rows={6}
            maxLength={JOURNAL_BODY_MAX}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            aria-invalid={bodyInvalid ? true : undefined}
            aria-describedby={bodyInvalid ? fieldErrorId : undefined}
            className={`${previewFocus} w-full min-w-0 resize-y rounded-xl border border-soma-line bg-soma-raised px-3 py-2 text-soma-ink`}
          />
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm text-soma-ink">
          <input
            type="checkbox"
            checked={highlighted}
            onChange={(event) => setHighlighted(event.target.checked)}
          />
          {t("form.highlighted")}
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm text-soma-ink">
          <input
            type="checkbox"
            checked={learning}
            onChange={(event) => setLearning(event.target.checked)}
          />
          {t("form.learning")}
        </label>
      </FormSection>

      {issue ? (
        <p
          id={fieldIssue ? fieldErrorId : formErrorId}
          role="alert"
          className="text-sm text-soma-ink"
        >
          {t(`form.${issue}`)}
        </p>
      ) : null}
      {error ? (
        <p id="journal-save-error" role="alert" className="text-sm text-soma-ink">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2 pb-1">
        <button
          type="submit"
          disabled={saving}
          aria-busy={saving || undefined}
          className={`${previewFocus} min-h-11 rounded-full bg-soma-action px-4 text-sm font-semibold text-[#081018] disabled:opacity-60`}
        >
          {t("form.save")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={`${previewFocus} min-h-11 rounded-full bg-soma-raised px-4 text-sm text-soma-ink-secondary`}
        >
          {t("form.cancel")}
        </button>
        {onRecovery && recoveryLabel ? (
          <button
            type="button"
            onClick={onRecovery}
            className={`${previewFocus} min-h-11 rounded-full bg-soma-raised px-4 text-sm text-soma-ink-secondary`}
          >
            {recoveryLabel}
          </button>
        ) : null}
      </div>
    </form>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-t border-soma-line pt-4">
      <h3 className="text-sm font-semibold tracking-tight text-soma-ink">{title}</h3>
      {children}
    </section>
  );
}

function ScaleRow({
  legend,
  value,
  min,
  max,
  onChange,
  clearLabel,
  describedBy,
  invalid,
}: {
  legend: string;
  value: number | null;
  min: number;
  max: number;
  onChange: (next: number | null) => void;
  clearLabel: string;
  describedBy?: string;
  invalid?: boolean;
}) {
  return (
    <fieldset
      className="min-w-0"
      aria-describedby={describedBy}
      aria-invalid={invalid ? true : undefined}
    >
      <legend className="text-sm text-soma-ink-secondary">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={value == null}
          className={`${previewFocus} min-h-11 rounded-full px-3 text-sm ${
            value == null
              ? "bg-soma-action text-[#081018]"
              : "bg-soma-raised text-soma-ink-secondary"
          }`}
          onClick={() => onChange(null)}
        >
          {clearLabel}
        </button>
        {Array.from({ length: max - min + 1 }, (_, index) => {
          const next = min + index;
          const selected = value === next;
          return (
            <button
              key={next}
              type="button"
              aria-pressed={selected}
              className={`${previewFocus} min-h-11 min-w-11 rounded-full text-sm font-semibold ${
                selected
                  ? "bg-soma-action text-[#081018]"
                  : "bg-soma-raised text-soma-ink-secondary hover:text-soma-ink"
              }`}
              onClick={() => onChange(next)}
            >
              {next}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function ChipList({
  ids,
  selected,
  label,
  onToggle,
}: {
  ids: readonly string[];
  selected: readonly string[];
  label: (id: string) => string;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {ids.map((id) => {
        const on = selected.includes(id);
        return (
          <button
            key={id}
            type="button"
            aria-pressed={on}
            className={`${previewFocus} min-h-11 rounded-full px-3 text-sm ${
              on
                ? "bg-soma-action text-[#081018]"
                : "bg-soma-raised text-soma-ink-secondary"
            }`}
            onClick={() => onToggle(id)}
          >
            {label(id)}
          </button>
        );
      })}
    </div>
  );
}
