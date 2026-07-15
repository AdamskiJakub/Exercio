"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import type { CatalogDiscipline, CatalogCategory } from "@/lib/catalog-types";
import { getLocalizedName } from "@/lib/catalog-types";
import type { DisciplineCity } from "@/lib/seo/fetch-seo-page";

interface SearchInstructorItem {
  id: string;
  fullName: string;
  tagline: string | null;
  city: string | null;
  user?: { username: string };
}

interface SearchEnterpriseItem {
  id: string;
  companyName: string;
  shortDescription: string | null;
  city: string | null;
  slug: string;
}

interface SearchResults {
  instructors?: { data: SearchInstructorItem[]; total: number };
  enterprises?: { data: SearchEnterpriseItem[]; total: number };
}

interface DisciplineVariant {
  type: "discipline";
  discipline: CatalogDiscipline;
  locale: string;
  initialResults: SearchResults | null;
  disciplineCities: DisciplineCity[];
}

interface CityVariant {
  type: "city";
  cityName: string;
  citySlug: string;
  locale: string;
  disciplines: CatalogDiscipline[];
  categories: CatalogCategory[];
  initialResults: SearchResults | null;
}

type SlugPageClientProps = DisciplineVariant | CityVariant;

export function SlugPageClient(props: SlugPageClientProps) {
  const t = useTranslations("SEO");

  if (props.type === "discipline") {
    return <DisciplineView {...props} />;
  }

  return <CityView {...props} />;
}

function DisciplineView({
  discipline,
  locale,
  initialResults,
  disciplineCities,
}: DisciplineVariant) {
  const t = useTranslations("SEO");
  const name = getLocalizedName(discipline.names, locale);
  const totalResults =
    (initialResults?.instructors?.total || 0) +
    (initialResults?.enterprises?.total || 0);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* H1 */}
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {name}
        </h1>

        {/* Description */}
        <p className="mb-8 max-w-3xl text-lg text-slate-400">
          {discipline.seo.descriptionTemplate
            .replace("{city}", "")
            .replace(" w ", "")
            .replace("  ", " ")
            .trim()}
        </p>

        {/* Stats */}
        <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <p className="text-3xl font-bold text-white">{totalResults}</p>
            <p className="text-sm text-slate-400">
              {t("totalResults", { defaultValue: "Dostępnych wyników" })}
            </p>
          </div>
          {initialResults?.instructors && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <p className="text-3xl font-bold text-white">
                {initialResults.instructors.total}
              </p>
              <p className="text-sm text-slate-400">
                {t("instructors", { defaultValue: "Instruktorzy" })}
              </p>
            </div>
          )}
          {initialResults?.enterprises && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <p className="text-3xl font-bold text-white">
                {initialResults.enterprises.total}
              </p>
              <p className="text-sm text-slate-400">
                {t("enterprises", { defaultValue: "Kluby i studia" })}
              </p>
            </div>
          )}
        </div>

        {/* Synonyms */}
        {discipline.synonyms.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-3 text-lg font-semibold text-white">
              {t("alsoKnownAs", { defaultValue: "Znane również jako" })}
            </h2>
            <div className="flex flex-wrap gap-2">
              {discipline.synonyms.map((synonym: string) => (
                <span
                  key={synonym}
                  className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300"
                >
                  {synonym}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Cities where this discipline is available — internal linking */}
        {disciplineCities.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-3 text-lg font-semibold text-white">
              {t("availableInCities", {
                defaultValue: "Dostępny w miastach",
              })}
            </h2>
            <div className="flex flex-wrap gap-2">
              {disciplineCities.map((city) => (
                <Link
                  key={city.citySlug}
                  href={`/${locale}/${city.citySlug}/${discipline.slugs[locale as "pl" | "en"]}`}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
                >
                  {city.cityName}
                  <span className="text-xs text-slate-500">
                    ({city.instructors + city.enterprises})
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800 p-8">
          <h2 className="mb-2 text-2xl font-bold text-white">
            {t("findInCity", {
              defaultValue: `Znajdź {discipline} w swoim mieście`,
              discipline: name,
            })}
          </h2>
          <p className="mb-6 text-slate-400">
            {t("findInCityDesc", {
              defaultValue:
                "Wybierz miasto, aby znaleźć najlepszych instruktorów i kluby.",
            })}
          </p>
          <Link
            href={`/${locale}/instruktorzy?specialization=${discipline.key}`}
            className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-200"
          >
            {t("browseAll", {
              defaultValue: `Przeglądaj wszystkich`,
            })}
          </Link>
        </div>
      </div>
    </div>
  );
}

function CityView({
  cityName,
  citySlug,
  locale,
  disciplines,
  categories,
  initialResults,
}: CityVariant) {
  const t = useTranslations("SEO");
  const totalResults =
    (initialResults?.instructors?.total || 0) +
    (initialResults?.enterprises?.total || 0);

  // Group disciplines by category
  const categoryMap = new Map<string, CatalogCategory>();
  categories.forEach((cat) => categoryMap.set(cat.id, cat));

  const disciplinesByCategory = new Map<string, CatalogDiscipline[]>();
  disciplines
    .filter((d) => d.enabled)
    .forEach((d) => {
      const list = disciplinesByCategory.get(d.categoryId) || [];
      list.push(d);
      disciplinesByCategory.set(d.categoryId, list);
    });

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-slate-500">
          <Link
            href={`/${locale}`}
            className="transition-colors hover:text-white"
          >
            Exercio
          </Link>
          <span>/</span>
          <span className="text-white">{cityName}</span>
        </nav>

        {/* H1 */}
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {t("cityTitle", {
            defaultValue: "Trening i fitness w {city}",
            city: cityName,
          })}
        </h1>

        <p className="mb-8 max-w-3xl text-lg text-slate-400">
          {t("cityDescription", {
            defaultValue:
              "Znajdź najlepszych trenerów personalnych, instruktorów i kluby fitness w {city}. Porównaj opinie, cennik i dostępne terminy.",
            city: cityName,
          })}
        </p>

        {/* Stats */}
        <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <p className="text-3xl font-bold text-white">{totalResults}</p>
            <p className="text-sm text-slate-400">
              {t("totalResults", { defaultValue: "Dostępnych wyników" })}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <p className="text-3xl font-bold text-white">
              {disciplines.length}
            </p>
            <p className="text-sm text-slate-400">
              {t("disciplines", { defaultValue: "Dyscypliny" })}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <p className="text-3xl font-bold text-white">{categories.length}</p>
            <p className="text-sm text-slate-400">
              {t("categories", { defaultValue: "Kategorie" })}
            </p>
          </div>
        </div>

        {/* Disciplines by category */}
        <h2 className="mb-6 text-2xl font-bold text-white">
          {t("browseByCategory", {
            defaultValue: "Przeglądaj według kategorii",
          })}
        </h2>

        <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from(disciplinesByCategory.entries()).map(
            ([categoryId, discList]) => {
              const category = categoryMap.get(categoryId);
              if (!category || discList.length === 0) return null;

              return (
                <div
                  key={categoryId}
                  className="rounded-xl border border-slate-800 bg-slate-900/50 p-6"
                >
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
                    <span>{category.icon}</span>
                    <span>{getLocalizedName(category.names, locale)}</span>
                  </h3>
                  <ul className="space-y-2">
                    {discList.map((discipline) => (
                      <li key={discipline.id}>
                        <Link
                          href={`/${locale}/${citySlug}/${discipline.slugs[locale as "pl" | "en"]}`}
                          className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
                        >
                          <span>{discipline.icon}</span>
                          <span>
                            {getLocalizedName(discipline.names, locale)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            },
          )}
        </div>

        {/* CTA */}
        <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800 p-8">
          <h2 className="mb-2 text-2xl font-bold text-white">
            {t("findInstructor", {
              defaultValue: "Nie znalazłeś tego czego szukasz?",
            })}
          </h2>
          <p className="mb-6 text-slate-400">
            {t("findInstructorDesc", {
              city: cityName,
              defaultValue:
                "Skorzystaj z wyszukiwarki, aby znaleźć instruktora lub klub w {city}.",
            })}
          </p>
          <Link
            href={`/${locale}/instruktorzy?city=${encodeURIComponent(cityName)}`}
            className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-200"
          >
            {t("searchInCity", {
              city: cityName,
              defaultValue: "Szukaj w {city}",
            })}
          </Link>
        </div>
      </div>
    </div>
  );
}
