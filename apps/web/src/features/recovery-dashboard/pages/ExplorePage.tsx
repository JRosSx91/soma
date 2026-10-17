import { useMemo, useState } from "react";
import { previewFocus } from "../focus.js";
import {
  exploreCategories,
  exploreSubstances,
  type ExploreCategory,
  type ExploreSubstance,
} from "../pages-data.js";
import { DetailSheet } from "../components/DetailSheet.js";
import { PageHeading } from "../components/PageHeading.js";
import { SubstanceIllustration } from "../components/SubstanceIllustration.js";

export function ExplorePage() {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState(exploreCategories[0]?.id ?? "");
  const [substance, setSubstance] = useState<ExploreSubstance | null>(null);
  const [topic, setTopic] = useState<string | null>(null);

  const needle = query.trim().toLowerCase();
  const substances = useMemo(
    () =>
      exploreSubstances.filter((item) =>
        `${item.name} ${item.blurb}`.toLowerCase().includes(needle),
      ),
    [needle],
  );
  const categories = useMemo(
    () =>
      exploreCategories.filter((item) =>
        `${item.name} ${item.summary} ${item.topics.join(" ")}`.toLowerCase().includes(needle),
      ),
    [needle],
  );
  const active =
    categories.find((item) => item.id === categoryId) ?? categories[0] ?? null;

  return (
    <div className="flex flex-col gap-6 pb-6">
      <PageHeading
        eyebrow="Explorar"
        title="Conocimiento para tu recuperación."
        description="Catálogo de demostración. No enlaza estudios ni sustituye una explicación clínica."
        aside={
          <label className="relative hidden sm:block">
            <span className="sr-only">Buscar en el catálogo de demostración</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar sustancias o temas"
              className={`${previewFocus} w-56 rounded-xl border border-soma-line bg-soma-surface px-3 py-2 text-sm text-soma-ink placeholder:text-soma-ink-muted`}
            />
          </label>
        }
      />
      <label className="sm:hidden">
        <span className="sr-only">Buscar en el catálogo de demostración</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar sustancias o temas"
          className={`${previewFocus} w-full rounded-xl border border-soma-line bg-soma-surface px-3 py-2 text-sm text-soma-ink placeholder:text-soma-ink-muted`}
        />
      </label>

      {substances.length === 0 && categories.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-soma-line px-4 py-8 text-sm text-soma-ink-muted">
          Ningún resultado de demostración para «{query.trim()}».
        </p>
      ) : null}

      {substances.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {substances.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setSubstance(item)}
                className={`${previewFocus} flex h-full w-full flex-col overflow-hidden rounded-2xl border border-soma-line bg-soma-surface text-left hover:border-soma-line-strong`}
              >
                <span className="flex h-36 items-center justify-center bg-[#101820] px-3">
                  <SubstanceIllustration name={item.id} className="h-28 w-full" alt="" />
                </span>
                <span className="flex flex-1 flex-col gap-1 p-3">
                  <span className="font-semibold text-soma-ink">{item.name}</span>
                  <span className="text-xs leading-snug text-soma-ink-muted">Ficha de demostración</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {categories.length > 0 ? (
        <section>
          <h2 className="text-base font-semibold text-soma-ink">Explora por categorías</h2>
          <p className="mt-0.5 text-xs text-soma-ink-muted">
            Elige una categoría para ver los temas de demostración relacionados.
          </p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {categories.map((item) => (
              <li key={item.id}>
                <CategoryCard
                  category={item}
                  selected={item.id === active?.id}
                  onSelect={setCategoryId}
                />
              </li>
            ))}
          </ul>
          {active ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {active.topics.map((name) => (
                <li key={name}>
                  <button
                    type="button"
                    onClick={() => setTopic(name)}
                    className={`${previewFocus} rounded-full border border-soma-line bg-soma-surface px-3 py-1.5 text-sm text-soma-ink-secondary hover:border-soma-line-strong hover:text-soma-ink`}
                  >
                    {name}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {substance ? (
        <DetailSheet title={substance.name} onClose={() => setSubstance(null)}>
          <p>{substance.blurb}</p>
        </DetailSheet>
      ) : null}
      {topic ? (
        <DetailSheet title={topic} onClose={() => setTopic(null)}>
          <p>
            Tema de demostración dentro de {active?.name ?? "Explorar"}. No abre un artículo ni cita una fuente.
          </p>
        </DetailSheet>
      ) : null}
    </div>
  );
}

function CategoryCard({
  category,
  selected,
  onSelect,
}: {
  category: ExploreCategory;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(category.id)}
      aria-pressed={selected}
      className={`${previewFocus} h-full w-full rounded-2xl border p-4 text-left ${
        selected
          ? "border-soma-action/80 bg-soma-raised/40"
          : "border-soma-line bg-soma-surface hover:border-soma-line-strong"
      }`}
    >
      <span className="block font-semibold text-soma-ink">{category.name}</span>
      <span className="mt-1 block text-xs leading-snug text-soma-ink-muted">{category.summary}</span>
    </button>
  );
}
