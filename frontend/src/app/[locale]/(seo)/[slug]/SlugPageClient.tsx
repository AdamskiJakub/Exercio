"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import type { CatalogDiscipline, CatalogCategory } from "@/lib/catalog-types";
import { getLocalizedName } from "@/lib/catalog-types";
import type { DisciplineCity } from "@/lib/seo/fetch-seo-page";
import type { InstructorListing } from "@/types";
import type { EnterpriseListing } from "@/types/enterprise";
import { InstructorCard } from "@/components/instructors/instructor-card";
import { EnterpriseCard } from "@/components/enterprise/EnterpriseCard";
import { StatsCounter } from "@/components/seo/StatsCounter";
import { CtaBanner } from "@/components/seo/CtaBanner";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { MapPinIcon, UsersIcon, ArrowRightIcon } from "lucide-react";

interface SearchResults {
  instructors?: { data: InstructorListing[]; total: number };
  enterprises?: { data: EnterpriseListing[]; total: number };
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

const MAX_VISIBLE = 6;

export function SlugPageClient(props: SlugPageClientProps) {
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

  const instructors = initialResults?.instructors?.data || [];
  const enterprises = initialResults?.enterprises?.data || [];

  const faqItems = [
    {
      key: "cost",
      question: t("faqCost", {
        discipline: name.toLowerCase(),
        defaultValue: "Ile kosztuje {discipline}?",
      }),
      answer: t("faqCostAnswer", {
        discipline: name.toLowerCase(),
        defaultValue:
          "Ceny za {discipline} różnią się w zależności od instruktora, lokalizacji i długości sesji. Na Exercio znajdziesz profile z widocznym cennikiem — możesz porównać oferty i wybrać najlepszą dla siebie.",
      }),
    },
    {
      key: "choose",
      question: t("faqChoose", {
        discipline: name.toLowerCase(),
        defaultValue: "Jak wybrać dobrego instruktora {discipline}?",
      }),
      answer: t("faqChooseAnswer", {
        discipline: name.toLowerCase(),
        defaultValue:
          "Przeglądaj profile instruktorów, sprawdź ich opinie, cennik oraz dostępne terminy. Zwróć uwagę na specjalizację, doświadczenie oraz to, czy oferują treningi online.",
      }),
    },
    {
      key: "online",
      question: t("faqOnline", {
        discipline: name.toLowerCase(),
        defaultValue: "Czy mogę trenować {discipline} online?",
      }),
      answer: t("faqOnlineAnswer", {
        discipline: name.toLowerCase(),
        defaultValue:
          "Tak, wielu instruktorów oferuje treningi online. Na Exercio możesz filtrować wyniki, aby znaleźć specjalistów oferujących zdalne sesje.",
      }),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section — reduced padding */}
      <div className="border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-2 flex items-center gap-3">
                <span className="text-3xl" aria-hidden="true">
                  {discipline.icon}
                </span>
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {name}
                </h1>
              </div>
              <p className="text-base text-slate-400">
                {discipline.seo.descriptionTemplate
                  .replace("{city}", "")
                  .replace(" — ", "")
                  .replace("  ", " ")
                  .trim()}
              </p>
            </div>

            {/* Quick Stats — smaller */}
            <div className="flex shrink-0 gap-3">
              <StatsCounter
                value={totalResults}
                label={t("totalResults", {
                  defaultValue: "Dostępnych wyników",
                })}
              />
              {initialResults?.instructors && (
                <StatsCounter
                  value={initialResults.instructors.total}
                  label={t("instructors", { defaultValue: "Instruktorzy" })}
                />
              )}
              {initialResults?.enterprises && (
                <StatsCounter
                  value={initialResults.enterprises.total}
                  label={t("enterprises", { defaultValue: "Kluby i studia" })}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Results Section */}
        {totalResults > 0 && (
          <div className="mb-12">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {t("results", {
                    defaultValue: `Popularni specjaliści {discipline}`,
                    discipline: name,
                  })}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {t("resultsDescriptionDiscipline", {
                    count: totalResults,
                    discipline: name.toLowerCase(),
                    defaultValue:
                      "Znaleźliśmy {count} specjalistów {discipline}. Wszyscy posiadają publiczne profile oraz możliwość kontaktu.",
                  })}
                </p>
              </div>
              <Link
                href={`/${locale}/instruktorzy?specialization=${discipline.key}`}
                className="flex items-center gap-1 text-sm text-orange-500 transition-colors hover:text-orange-400"
                aria-label={`${t("viewAll", { defaultValue: "Zobacz wszystkich" })} — ${name}`}
              >
                {t("viewAll", { defaultValue: "Zobacz wszystkich" })}
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            {/* Instructors */}
            {instructors.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-300">
                  <UsersIcon
                    className="h-4 w-4 text-orange-500"
                    aria-hidden="true"
                  />
                  {t("instructors", { defaultValue: "Instruktorzy" })}
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {instructors.slice(0, MAX_VISIBLE).map((instructor) => (
                    <InstructorCard
                      key={`inst-${instructor.id}`}
                      instructor={instructor}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Enterprises */}
            {enterprises.length > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-300">
                  <MapPinIcon
                    className="h-4 w-4 text-emerald-500"
                    aria-hidden="true"
                  />
                  {t("enterprises", { defaultValue: "Kluby i studia" })}
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {enterprises.slice(0, MAX_VISIBLE).map((enterprise) => (
                    <EnterpriseCard
                      key={`ent-${enterprise.id}`}
                      enterprise={enterprise}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* FAQ Section — using Radix Accordion */}
        <div className="mb-12">
          <h2 className="mb-6 text-xl font-bold text-white">
            {t("faqTitleDiscipline", {
              defaultValue: `Najczęściej zadawane pytania — {discipline}`,
              discipline: name.toLowerCase(),
            })}
          </h2>
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm p-1">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item) => (
                <AccordionItem key={item.key} value={item.key}>
                  <AccordionTrigger className="px-4">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Synonyms */}
        {discipline.synonyms.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-3 text-base font-semibold text-white">
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

        {/* Popular cities — internal linking */}
        {disciplineCities.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-3 text-base font-semibold text-white">
              {t("popularCities", {
                discipline: name,
                defaultValue: "{discipline} — popularne miasta",
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

        {/* CTA — orange gradient button */}
        <CtaBanner
          title={t("findInCity", {
            defaultValue: `Znajdź {discipline} w swoim mieście`,
            discipline: name,
          })}
          description={t("findInCityDesc", {
            defaultValue:
              "Wybierz miasto, aby znaleźć najlepszych instruktorów i kluby.",
          })}
          href={`/${locale}/instruktorzy?specialization=${discipline.key}`}
          buttonText={t("browseAll", {
            defaultValue: `Przeglądaj wszystkich`,
          })}
        />
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

  const instructors = initialResults?.instructors?.data || [];
  const enterprises = initialResults?.enterprises?.data || [];

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

  // Pick a few disciplines from other categories for "related" section
  const relatedDisciplines = disciplines.filter((d) => d.enabled).slice(0, 8);

  const faqItems = [
    {
      key: "cost",
      question: t("faqCityCost", {
        city: cityName,
        defaultValue: "Ile kosztuje trening personalny w {city}?",
      }),
      answer: t("faqCityCostAnswer", {
        city: cityName,
        defaultValue:
          "Ceny treningu personalnego w {city} różnią się w zależności od instruktora i lokalizacji. Na Exercio znajdziesz profile z widocznym cennikiem — średnio od 80 do 200 zł za sesję.",
      }),
    },
    {
      key: "choose",
      question: t("faqCityChoose", {
        city: cityName,
        defaultValue: "Jak znaleźć dobrego trenera w {city}?",
      }),
      answer: t("faqCityChooseAnswer", {
        city: cityName,
        defaultValue:
          "Przeglądaj profile instruktorów w {city}, sprawdź ich opinie, cennik oraz dostępne terminy. Exercio umożliwia bezpośredni kontakt i rezerwację online.",
      }),
    },
    {
      key: "online",
      question: t("faqCityOnline", {
        city: cityName,
        defaultValue: "Czy w {city} są treningi online?",
      }),
      answer: t("faqCityOnlineAnswer", {
        city: cityName,
        defaultValue:
          "Tak, wielu instruktorów w {city} oferuje treningi online. Na Exercio możesz filtrować wyniki, aby znaleźć specjalistów oferujących zdalne sesje.",
      }),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section — reduced padding */}
      <div className="border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex items-center gap-2 text-sm text-slate-500"
          >
            <Link
              href={`/${locale}`}
              className="transition-colors hover:text-white"
            >
              Exercio
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-white">{cityName}</span>
          </nav>

          <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="mb-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {t("cityTitle", {
                  defaultValue: "Trening i fitness w {city}",
                  city: cityName,
                })}
              </h1>
              <p className="text-base text-slate-400">
                {t("cityDescription", {
                  defaultValue:
                    "Znajdź najlepszych trenerów personalnych, instruktorów i kluby fitness w {city}. Porównaj opinie, cennik i dostępne terminy.",
                  city: cityName,
                })}
              </p>
            </div>

            {/* Quick Stats — smaller */}
            <div className="flex shrink-0 gap-3">
              <StatsCounter
                value={totalResults}
                label={t("totalResults", {
                  defaultValue: "Dostępnych wyników",
                })}
              />
              <StatsCounter
                value={disciplines.length}
                label={t("disciplines", { defaultValue: "Dyscypliny" })}
              />
              <StatsCounter
                value={categories.length}
                label={t("categories", { defaultValue: "Kategorie" })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Results Section */}
        {totalResults > 0 && (
          <div className="mb-12">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {t("cityResults", {
                    defaultValue: `Popularni specjaliści w {city}`,
                    city: cityName,
                  })}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {t("resultsDescriptionCity", {
                    count: totalResults,
                    city: cityName,
                    defaultValue:
                      "Znaleźliśmy {count} specjalistów w {city}. Wszyscy posiadają publiczne profile oraz możliwość kontaktu.",
                  })}
                </p>
              </div>
              <Link
                href={`/${locale}/instruktorzy?city=${encodeURIComponent(cityName)}`}
                className="flex items-center gap-1 text-sm text-orange-500 transition-colors hover:text-orange-400"
                aria-label={`${t("viewAll", { defaultValue: "Zobacz wszystkich" })} — ${cityName}`}
              >
                {t("viewAll", { defaultValue: "Zobacz wszystkich" })}
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            {/* Instructors */}
            {instructors.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-300">
                  <UsersIcon
                    className="h-4 w-4 text-orange-500"
                    aria-hidden="true"
                  />
                  {t("instructors", { defaultValue: "Instruktorzy" })}
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {instructors.slice(0, MAX_VISIBLE).map((instructor) => (
                    <InstructorCard
                      key={`inst-${instructor.id}`}
                      instructor={instructor}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Enterprises */}
            {enterprises.length > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-300">
                  <MapPinIcon
                    className="h-4 w-4 text-emerald-500"
                    aria-hidden="true"
                  />
                  {t("enterprises", { defaultValue: "Kluby i studia" })}
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {enterprises.slice(0, MAX_VISIBLE).map((enterprise) => (
                    <EnterpriseCard
                      key={`ent-${enterprise.id}`}
                      enterprise={enterprise}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* FAQ Section — using Radix Accordion */}
        <div className="mb-12">
          <h2 className="mb-6 text-xl font-bold text-white">
            {t("faqTitleCity", {
              defaultValue: `Najczęściej zadawane pytania — trening w {city}`,
              city: cityName,
            })}
          </h2>
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm p-1">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item) => (
                <AccordionItem key={item.key} value={item.key}>
                  <AccordionTrigger className="px-4">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Related disciplines */}
        {relatedDisciplines.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-3 text-base font-semibold text-white">
              {t("relatedDisciplines", {
                city: cityName,
                defaultValue: "Może zainteresuje Cię również",
              })}
            </h2>
            <div className="flex flex-wrap gap-2">
              {relatedDisciplines.map((d) => (
                <Link
                  key={d.id}
                  href={`/${locale}/${citySlug}/${d.slugs[locale as "pl" | "en"]}`}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
                >
                  <span aria-hidden="true">{d.icon}</span>
                  <span>{getLocalizedName(d.names, locale)}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Disciplines by category */}
        <h2 className="mb-6 text-xl font-bold text-white">
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
                  <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-white">
                    <span aria-hidden="true">{category.icon}</span>
                    <span>{getLocalizedName(category.names, locale)}</span>
                  </h3>
                  <ul className="space-y-2">
                    {discList.map((discipline) => (
                      <li key={discipline.id}>
                        <Link
                          href={`/${locale}/${citySlug}/${discipline.slugs[locale as "pl" | "en"]}`}
                          className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
                        >
                          <span aria-hidden="true">{discipline.icon}</span>
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

        {/* CTA — orange gradient button */}
        <CtaBanner
          title={t("findInstructor", {
            defaultValue: "Nie znalazłeś tego czego szukasz?",
          })}
          description={t("findInstructorDesc", {
            city: cityName,
            defaultValue:
              "Skorzystaj z wyszukiwarki, aby znaleźć instruktora lub klub w {city}.",
          })}
          href={`/${locale}/instruktorzy?city=${encodeURIComponent(cityName)}`}
          buttonText={t("searchInCity", {
            city: cityName,
            defaultValue: "Szukaj w {city}",
          })}
        />
      </div>
    </div>
  );
}
