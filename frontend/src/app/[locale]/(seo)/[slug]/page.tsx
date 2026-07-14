import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  fetchCatalog,
  fetchDisciplineBySlug,
  fetchSearchResults,
} from "@/lib/seo/fetch-seo-page";
import { getLocalizedName } from "@/hooks/useCatalog";
import { isReservedSlug } from "@/lib/seo/reserved-slugs";
import { SlugPageClient } from "./SlugPageClient";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;

  // Reserved slugs (routes, city names) should not generate SEO for disciplines
  if (isReservedSlug(slug)) {
    return { title: "Exercio" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://exercio.app";

  // First, try to match as a discipline
  const discipline = await fetchDisciplineBySlug(slug, locale);
  if (discipline) {
    const name = getLocalizedName(discipline.names, locale);
    const title = discipline.seo.titleTemplate
      .replace("{city}", "")
      .replace(" w ", "")
      .replace("  ", " ")
      .trim();
    const description = discipline.seo.descriptionTemplate
      .replace("{city}", "")
      .replace(" w ", "")
      .replace("  ", " ")
      .trim();

    return {
      title: `${name} — ${title}`,
      description,
      openGraph: {
        title: `${name} — Exercio`,
        description,
        locale: locale === "pl" ? "pl_PL" : "en_US",
        siteName: "Exercio",
        url: `${siteUrl}/${locale}/${slug}`,
        type: "website",
      },
      alternates: {
        canonical: `${siteUrl}/${locale}/${slug}`,
        languages: {
          pl: discipline.slugs.pl
            ? `${siteUrl}/pl/${discipline.slugs.pl}`
            : undefined,
          en: discipline.slugs.en
            ? `${siteUrl}/en/${discipline.slugs.en}`
            : undefined,
        },
      },
    };
  }

  // If not a discipline, treat as a city page
  const cityName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const title =
    locale === "pl"
      ? `Trenerzy i kluby fitness w ${cityName} | Exercio`
      : `Fitness trainers and clubs in ${cityName} | Exercio`;
  const description =
    locale === "pl"
      ? `Znajdź najlepszych trenerów personalnych, instruktorów i kluby fitness w ${cityName}. Sprawdź opinie, cennik i dostępne terminy.`
      : `Find the best personal trainers, instructors and fitness clubs in ${cityName}. Check reviews, prices and availability.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      locale: locale === "pl" ? "pl_PL" : "en_US",
      siteName: "Exercio",
      url: `${siteUrl}/${locale}/${slug}`,
      type: "website",
    },
    alternates: {
      canonical: `${siteUrl}/${locale}/${slug}`,
    },
  };
}

export default async function SlugPage({ params }: Props) {
  const { slug, locale } = await params;

  // Reserved slugs should not be treated as SEO pages
  if (isReservedSlug(slug)) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://exercio.app";

  // Try to match as a discipline first
  const discipline = await fetchDisciplineBySlug(slug, locale);
  if (discipline) {
    const name = getLocalizedName(discipline.names, locale);
    const results = await fetchSearchResults({
      discipline: discipline.key,
      limit: 20,
    });

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${name} — Exercio`,
      description: discipline.seo.descriptionTemplate
        .replace("{city}", "")
        .replace(" w ", "")
        .replace("  ", " ")
        .trim(),
      url: `${siteUrl}/${locale}/${slug}`,
      about: {
        "@type": "Thing",
        name,
      },
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SlugPageClient
          type="discipline"
          discipline={discipline}
          locale={locale}
          initialResults={results}
        />
      </>
    );
  }

  // Otherwise, treat as a city page
  const catalog = await fetchCatalog();
  if (!catalog) {
    notFound();
  }

  const cityName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const results = await fetchSearchResults({
    city: cityName,
    limit: 20,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name:
      locale === "pl"
        ? `Trenerzy i kluby fitness w ${cityName}`
        : `Fitness trainers and clubs in ${cityName}`,
    url: `${siteUrl}/${locale}/${slug}`,
    about: {
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
      <SlugPageClient
        type="city"
        cityName={cityName}
        citySlug={slug}
        locale={locale}
        disciplines={catalog.disciplines}
        categories={catalog.categories}
        initialResults={results}
      />
    </>
  );
}
