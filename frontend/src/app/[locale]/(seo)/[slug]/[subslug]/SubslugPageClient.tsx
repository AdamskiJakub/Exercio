"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import type { CatalogDiscipline } from "@/lib/catalog-types";
import { getLocalizedName } from "@/lib/catalog-types";
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
import { UsersIcon, MapPinIcon, ArrowRightIcon } from "lucide-react";

interface SearchResults {
  instructors?: { data: InstructorListing[]; total: number };
  enterprises?: { data: EnterpriseListing[]; total: number };
}

interface SubslugPageClientProps {
  discipline: CatalogDiscipline;
  cityName: string;
  citySlug: string;
  locale: string;
  initialResults: SearchResults | null;
}

const MAX_VISIBLE = 6;

export function SubslugPageClient({
  discipline,
  cityName,
  citySlug,
  locale,
  initialResults,
}: SubslugPageClientProps) {
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
        city: cityName,
        defaultValue: "Ile kosztuje {discipline} w {city}?",
      }),
      answer: t("faqCostAnswer", {
        discipline: name.toLowerCase(),
        defaultValue:
          "Ceny za {discipline} różnią się w zależności od instruktora, lokalizacji i długości sesji. Na Exercio znajdziesz profile z widocznym cennikiem — możesz porównać oferty i wybrać najlepszą dla siebie. Średnio ceny wahają się od 80 do 200 zł za sesję.",
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
          "Przeglądaj profile instruktorów, sprawdź ich opinie, cennik oraz dostępne terminy. Zwróć uwagę na specjalizację, doświadczenie oraz to, czy oferują treningi online. Exercio umożliwia bezpośredni kontakt i rezerwację bez wychodzenia z domu.",
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
          "Tak, wielu instruktorów oferuje treningi online. Na Exercio możesz filtrować wyniki, aby znaleźć specjalistów oferujących zdalne sesje. To wygodna opcja, jeśli masz napięty grafik lub wolisz ćwiczyć w domu.",
      }),
    },
    {
      key: "first",
      question: t("faqFirst", {
        discipline: name.toLowerCase(),
        defaultValue: "Jak wygląda pierwsza konsultacja {discipline}?",
      }),
      answer: t("faqFirstAnswer", {
        discipline: name.toLowerCase(),
        defaultValue:
          "Pierwsza konsultacja to zazwyczaj rozmowa o Twoich celach, stanie zdrowia i oczekiwaniach. Instruktor dobiera odpowiedni plan treningowy i pokazuje podstawowe ćwiczenia. Wiele osób oferuje pierwszą sesję w promocyjnej cenie — sprawdź profile na Exercio.",
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
            <Link
              href={`/${locale}/${citySlug}`}
              className="transition-colors hover:text-white"
            >
              {cityName}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-white">{name}</span>
          </nav>

          <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-2 flex items-center gap-3">
                <span className="text-3xl" aria-hidden="true">
                  {discipline.icon}
                </span>
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {discipline.seo.titleTemplate.replace("{city}", cityName)}
                </h1>
              </div>
              <p className="text-base text-slate-400">
                {discipline.seo.descriptionTemplate.replace("{city}", cityName)}
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
                    defaultValue: `Dostępni specjaliści {discipline} w {city}`,
                    discipline: name,
                    city: cityName,
                  })}
                </h2>
                {/* SEO-friendly description before listing */}
                <p className="mt-1 text-sm text-slate-400">
                  {t("resultsDescription", {
                    count: totalResults,
                    discipline: name.toLowerCase(),
                    city: cityName,
                    defaultValue:
                      "Znaleźliśmy {count} specjalistów {discipline} w {city}. Wszyscy posiadają publiczne profile oraz możliwość kontaktu.",
                  })}
                </p>
              </div>
              <Link
                href={`/${locale}/instruktorzy?specialization=${discipline.key}&city=${encodeURIComponent(cityName)}`}
                className="flex items-center gap-1 text-sm text-orange-500 transition-colors hover:text-orange-400"
                aria-label={`${t("viewAll", { defaultValue: "Zobacz wszystkich" })} — ${name} ${cityName}`}
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
            {t("faqTitle", {
              defaultValue: `Najczęściej zadawane pytania — {discipline} w {city}`,
              discipline: name.toLowerCase(),
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

        {/* Synonyms */}
        {discipline.synonyms.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-3 text-base font-semibold text-white">
              {t("alsoKnownAs", {
                defaultValue: "Znane również jako",
              })}
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

        {/* CTA — orange gradient button */}
        <CtaBanner
          title={t("ctaTitleGeneric", {
            defaultValue: "Prowadzisz treningi? Dołącz do Exercio.",
          })}
          description={t("ctaDescriptionGeneric", {
            defaultValue:
              "Dodaj swój profil i zacznij otrzymywać nowych klientów. Rejestracja jest bezpłatna.",
          })}
          href={`/${locale}/register/instructor`}
          buttonText={t("joinNow", { defaultValue: "Dołącz za darmo" })}
        />
      </div>
    </div>
  );
}
