import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  resolveSlug,
  fetchCatalog,
  fetchSearchResults,
  fetchDisciplineCities,
} from "@/lib/seo/fetch-seo-page";
import { getLocalizedName } from "@/lib/catalog-types";
import { isReservedSlug } from "@/lib/seo/reserved-slugs";
import { SlugPageClient } from "./SlugPageClient";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug, locale } = await params;

  // Next.js passes URL-encoded params for characters like ł (e.g. "bia%C5%82ystok")
  const slug = decodeURIComponent(rawSlug);

  // Reserved slugs (routes, city names) should not generate SEO for disciplines
  if (isReservedSlug(slug)) {
    return { title: "Exercio" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://exercio.app";

  const resolved = await resolveSlug(slug, locale);
  if (!resolved || resolved.type === null) {
    return { title: "Not Found" };
  }

  if (resolved.type === "discipline") {
    const discipline = resolved.discipline!;
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

  // City page metadata
  const cityName = resolved.cityName!;
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
  const { slug: rawSlug, locale } = await params;

  // Next.js passes URL-encoded params for characters like ł (e.g. "bia%C5%82ystok")
  const slug = decodeURIComponent(rawSlug);

  // Reserved slugs should not be treated as SEO pages
  if (isReservedSlug(slug)) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://exercio.app";

  const resolved = await resolveSlug(slug, locale);
  if (!resolved || resolved.type === null) {
    notFound();
  }

  if (resolved.type === "discipline") {
    const discipline = resolved.discipline!;
    const name = getLocalizedName(discipline.names, locale);
    const results = await fetchSearchResults({
      discipline: discipline.key,
      limit: 20,
    });

    // Fetch cities where this discipline is available (for internal linking)
    const disciplineCities = await fetchDisciplineCities(discipline.key);

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
          disciplineCities={disciplineCities}
        />
      </>
    );
  }

  // City page
  const cityName = resolved.cityName!;
  const catalog = await fetchCatalog();
  if (!catalog) {
    notFound();
  }

  // If city has no profiles at all → 404 (Google hates empty landing pages)
  if ((resolved.instructors || 0) + (resolved.enterprises || 0) === 0) {
    notFound();
  }

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
