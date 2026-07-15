import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveSlug, fetchSearchResults } from "@/lib/seo/fetch-seo-page";
import { getLocalizedName } from "@/lib/catalog-types";
import { isReservedSlug } from "@/lib/seo/reserved-slugs";
import { deslugifyCity } from "@/lib/seo/slug-utils";
import { SubslugPageClient } from "./SubslugPageClient";

interface Props {
  params: Promise<{ slug: string; subslug: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawCitySlug, subslug: discSlug, locale } = await params;

  // Next.js passes URL-encoded params for characters like ł (e.g. "bia%C5%82ystok")
  const citySlug = decodeURIComponent(rawCitySlug);

  // Only check the discipline slug against reserved slugs.
  // City slugs are expected to match city names (which are in reserved slugs),
  // so we only block if the discipline slug itself is reserved.
  if (isReservedSlug(discSlug)) {
    return { title: "Exercio" };
  }

  const resolved = await resolveSlug(discSlug, locale);
  if (!resolved || resolved.type !== "discipline") {
    return { title: "Not Found" };
  }

  const discipline = resolved.discipline!;
  const cityName = deslugifyCity(citySlug);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://exercio.app";
  const name = getLocalizedName(discipline.names, locale);
  const title = discipline.seo.titleTemplate.replace("{city}", cityName);
  const description = discipline.seo.descriptionTemplate.replace(
    "{city}",
    cityName,
  );

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      locale: locale === "pl" ? "pl_PL" : "en_US",
      siteName: "Exercio",
      url: `${siteUrl}/${locale}/${citySlug}/${discSlug}`,
      type: "website",
    },
    alternates: {
      canonical: `${siteUrl}/${locale}/${citySlug}/${discSlug}`,
      languages: {
        pl: discipline.slugs.pl
          ? `${siteUrl}/pl/${citySlug}/${discipline.slugs.pl}`
          : undefined,
        en: discipline.slugs.en
          ? `${siteUrl}/en/${citySlug}/${discipline.slugs.en}`
          : undefined,
      },
    },
  };
}

export default async function SubslugPage({ params }: Props) {
  const { slug: rawCitySlug, subslug: discSlug, locale } = await params;

  // Next.js passes URL-encoded params for characters like ł (e.g. "bia%C5%82ystok")
  const citySlug = decodeURIComponent(rawCitySlug);

  // Only check the discipline slug against reserved slugs.
  // City slugs are expected to match city names (which are in reserved slugs),
  // so we only block if the discipline slug itself is reserved.
  if (isReservedSlug(discSlug)) {
    notFound();
  }

  const resolved = await resolveSlug(discSlug, locale);
  if (!resolved || resolved.type !== "discipline") {
    notFound();
  }

  const discipline = resolved.discipline!;
  const cityName = deslugifyCity(citySlug);

  const results = await fetchSearchResults({
    city: cityName,
    discipline: discipline.key,
    limit: 20,
  });

  // If no results at all → 404 (Google hates empty landing pages)
  const hasResults =
    (results?.instructors?.total || 0) + (results?.enterprises?.total || 0) > 0;

  if (!hasResults) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://exercio.app";
  const name = getLocalizedName(discipline.names, locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${name} w ${cityName} — Exercio`,
    description: discipline.seo.descriptionTemplate.replace("{city}", cityName),
    url: `${siteUrl}/${locale}/${citySlug}/${discSlug}`,
    about: {
      "@type": "Thing",
      name,
    },
    contentLocation: {
      "@type": "City",
      name: cityName,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SubslugPageClient
        discipline={discipline}
        cityName={cityName}
        citySlug={citySlug}
        locale={locale}
        initialResults={results}
      />
    </>
  );
}
