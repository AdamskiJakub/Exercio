import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  fetchDisciplineBySlug,
  fetchSearchResults,
} from "@/lib/seo/fetch-seo-page";
import { getLocalizedName } from "@/hooks/useCatalog";
import { isReservedSlug } from "@/lib/seo/reserved-slugs";
import { SubslugPageClient } from "./SubslugPageClient";

interface Props {
  params: Promise<{ slug: string; subslug: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: citySlug, subslug: discSlug, locale } = await params;

  // If either segment is a reserved slug, don't generate SEO
  if (isReservedSlug(citySlug) || isReservedSlug(discSlug)) {
    return { title: "Exercio" };
  }

  const discipline = await fetchDisciplineBySlug(discSlug, locale);
  if (!discipline) {
    return { title: "Not Found" };
  }

  const cityName = citySlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

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
  const { slug: citySlug, subslug: discSlug, locale } = await params;

  // Reserved slugs should not be treated as SEO pages
  if (isReservedSlug(citySlug) || isReservedSlug(discSlug)) {
    notFound();
  }

  const discipline = await fetchDisciplineBySlug(discSlug, locale);
  if (!discipline) {
    notFound();
  }

  const cityName = citySlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const results = await fetchSearchResults({
    city: cityName,
    discipline: discipline.key,
    limit: 20,
  });

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
    mentions: {
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
