"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import type { CatalogDiscipline } from "@/hooks/useCatalog";
import { getLocalizedName } from "@/hooks/useCatalog";

interface SearchResults {
  instructors?: { data: any[]; total: number };
  enterprises?: { data: any[]; total: number };
}

interface SubslugPageClientProps {
  discipline: CatalogDiscipline;
  cityName: string;
  citySlug: string;
  locale: string;
  initialResults: SearchResults | null;
}

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
          <Link
            href={`/${locale}/${citySlug}`}
            className="transition-colors hover:text-white"
          >
            {cityName}
          </Link>
          <span>/</span>
          <span className="text-white">{name}</span>
        </nav>

        {/* H1 */}
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {discipline.seo.titleTemplate.replace("{city}", cityName)}
        </h1>

        {/* Description */}
        <p className="mb-8 max-w-3xl text-lg text-slate-400">
          {discipline.seo.descriptionTemplate.replace("{city}", cityName)}
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

        {/* Results list */}
        {totalResults > 0 && (
          <div className="mb-12">
            <h2 className="mb-4 text-2xl font-bold text-white">
              {t("results", {
                defaultValue: `Dostępni specjaliści`,
              })}
            </h2>

            {initialResults?.instructors &&
              initialResults.instructors.data.length > 0 && (
                <div className="mb-8">
                  <h3 className="mb-3 text-lg font-semibold text-slate-300">
                    {t("instructors", { defaultValue: "Instruktorzy" })}
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {initialResults.instructors.data
                      .slice(0, 6)
                      .map((instructor: any) => (
                        <Link
                          key={instructor.id}
                          href={`/${locale}/instruktorzy/${instructor.user?.username}`}
                          className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition-colors hover:border-slate-700"
                        >
                          <p className="font-semibold text-white">
                            {instructor.fullName}
                          </p>
                          {instructor.tagline && (
                            <p className="mt-1 text-sm text-slate-400">
                              {instructor.tagline}
                            </p>
                          )}
                          {instructor.city && (
                            <p className="mt-1 text-xs text-slate-500">
                              {instructor.city}
                            </p>
                          )}
                        </Link>
                      ))}
                  </div>
                </div>
              )}

            {initialResults?.enterprises &&
              initialResults.enterprises.data.length > 0 && (
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-slate-300">
                    {t("enterprises", { defaultValue: "Kluby i studia" })}
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {initialResults.enterprises.data
                      .slice(0, 6)
                      .map((enterprise: any) => (
                        <Link
                          key={enterprise.id}
                          href={`/${locale}/enterprise/${enterprise.slug}`}
                          className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition-colors hover:border-slate-700"
                        >
                          <p className="font-semibold text-white">
                            {enterprise.companyName}
                          </p>
                          {enterprise.shortDescription && (
                            <p className="mt-1 text-sm text-slate-400">
                              {enterprise.shortDescription}
                            </p>
                          )}
                          {enterprise.city && (
                            <p className="mt-1 text-xs text-slate-500">
                              {enterprise.city}
                            </p>
                          )}
                        </Link>
                      ))}
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Synonyms */}
        {discipline.synonyms.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-3 text-lg font-semibold text-white">
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

        {/* CTA */}
        <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800 p-8">
          <h2 className="mb-2 text-2xl font-bold text-white">
            {t("ctaTitle", {
              defaultValue: `Jesteś instruktorem ${name} w ${cityName}?`,
            })}
          </h2>
          <p className="mb-6 text-slate-400">
            {t("ctaDescription", {
              defaultValue:
                "Dołącz do Exercio i zyskaj nowych klientów. Rejestracja jest bezpłatna.",
            })}
          </p>
          <Link
            href={`/${locale}/register/instructor`}
            className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-200"
          >
            {t("joinNow", { defaultValue: "Dołącz za darmo" })}
          </Link>
        </div>
      </div>
    </div>
  );
}
