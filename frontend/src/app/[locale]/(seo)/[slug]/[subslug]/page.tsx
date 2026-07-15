import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  resolveSlug,
  fetchSearchResults,
  fetchCatalog,
} from "@/lib/seo/fetch-seo-page";
import { getLocalizedName } from "@/lib/catalog-types";
import { isReservedSlug } from "@/lib/seo/reserved-slugs";
import { deslugifyCity } from "@/lib/seo/slug-utils";
import { SubslugPageClient } from "./SubslugPageClient";
import type { CatalogCategory } from "@/lib/catalog-types";

interface Props {
  params: Promise<{ slug: string; subslug: string; locale: string }>;
}

/**
 * Determine if a subslug page is city+discipline or city+category.
 * Returns { type: "discipline", ... } or { type: "category", ... } or null.
 */
async function resolveSubslug(
  slug: string,
  subslug: string,
  locale: string,
): Promise<
  | {
      type: "discipline";
      discipline: NonNullable<
        import("@/lib/seo/fetch-seo-page").ResolveSlugResponse["discipline"]
      >;
      cityName: string;
    }
  | { type: "category"; category: CatalogCategory; cityName: string }
  | null
> {
  // Helper: get the proper city name from backend, fall back to deslugifyCity
  async function getCityName(citySlug: string): Promise<string> {
    const cityResolved = await resolveSlug(citySlug, locale);
    if (cityResolved?.type === "city" && cityResolved.cityName) {
      return cityResolved.cityName;
    }
    return deslugifyCity(citySlug);
  }

  // Try resolving subslug as a discipline first
  const resolved = await resolveSlug(subslug, locale);
  if (resolved?.type === "discipline") {
    return {
      type: "discipline",
      discipline: resolved.discipline!,
      cityName: await getCityName(slug),
    };
  }

  // Try resolving subslug as a category
  if (resolved?.type === "category") {
    return {
      type: "category",
      category: resolved.category!,
      cityName: await getCityName(slug),
    };
  }

  // Try the reverse: maybe slug is a discipline/category and subslug is a city
  const reverseResolved = await resolveSlug(slug, locale);
  if (reverseResolved?.type === "category") {
    return {
      type: "category",
      category: reverseResolved.category!,
      cityName: await getCityName(subslug),
    };
  }

  // Handle discipline+city: slug is a discipline, subslug is a city
  if (reverseResolved?.type === "discipline") {
    return {
      type: "discipline",
      discipline: reverseResolved.discipline!,
      cityName: await getCityName(subslug),
    };
  }

  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug, subslug: rawSubslug, locale } = await params;

  const slug = decodeURIComponent(rawSlug);
  const subslug = decodeURIComponent(rawSubslug);

  // Block if subslug is a reserved slug (but allow city slugs which are in reserved set)
  if (isReservedSlug(subslug)) {
    // Check if this is a city+category page where subslug might be a city
    const slugResolved = await resolveSlug(slug, locale);
    if (slugResolved?.type !== "category") {
      return { title: "Exercio" };
    }
  }

  const resolved = await resolveSubslug(slug, subslug, locale);
  if (!resolved) {
    return { title: "Not Found" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://exercio.app";

  if (resolved.type === "discipline") {
    const { discipline, cityName } = resolved;
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
        url: `${siteUrl}/${locale}/${slug}/${subslug}`,
        type: "website",
      },
      alternates: {
        canonical: `${siteUrl}/${locale}/${slug}/${subslug}`,
        languages: {
          pl: discipline.slugs.pl
            ? `${siteUrl}/pl/${slug}/${discipline.slugs.pl}`
            : undefined,
          en: discipline.slugs.en
            ? `${siteUrl}/en/${slug}/${discipline.slugs.en}`
            : undefined,
        },
      },
    };
  }

  // Category+city metadata
  const { category, cityName } = resolved;
  const catName = getLocalizedName(category.names, locale);
  const title =
    locale === "pl"
      ? `${catName} w ${cityName} — znajdź instruktorów i kluby | Exercio`
      : `${catName} in ${cityName} — find instructors and clubs | Exercio`;
  const description =
    locale === "pl"
      ? `Znajdź najlepszych instruktorów i kluby ${catName.toLowerCase()} w ${cityName}. Sprawdź opinie, cennik i dostępne terminy.`
      : `Find the best instructors and clubs for ${catName.toLowerCase()} in ${cityName}. Check reviews, prices and availability.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      locale: locale === "pl" ? "pl_PL" : "en_US",
      siteName: "Exercio",
      url: `${siteUrl}/${locale}/${slug}/${subslug}`,
      type: "website",
    },
    alternates: {
      canonical: `${siteUrl}/${locale}/${slug}/${subslug}`,
      languages: {
        pl: category.slugs.pl
          ? `${siteUrl}/pl/${slug}/${category.slugs.pl}`
          : undefined,
        en: category.slugs.en
          ? `${siteUrl}/en/${slug}/${category.slugs.en}`
          : undefined,
      },
    },
  };
}

export default async function SubslugPage({ params }: Props) {
  const { slug: rawSlug, subslug: rawSubslug, locale } = await params;

  const slug = decodeURIComponent(rawSlug);
  const subslug = decodeURIComponent(rawSubslug);

  // Block if subslug is a reserved slug (but allow city slugs which are in reserved set)
  if (isReservedSlug(subslug)) {
    const slugResolved = await resolveSlug(slug, locale);
    if (slugResolved?.type !== "category") {
      notFound();
    }
  }

  const resolved = await resolveSubslug(slug, subslug, locale);
  if (!resolved) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://exercio.app";

  if (resolved.type === "discipline") {
    const { discipline, cityName } = resolved;
    const name = getLocalizedName(discipline.names, locale);

    const results = await fetchSearchResults({
      city: cityName,
      discipline: discipline.key,
      limit: 20,
    });

    // If no results at all → 404 (Google hates empty landing pages)
    const hasResults =
      (results?.instructors?.total || 0) + (results?.enterprises?.total || 0) >
      0;

    if (!hasResults) {
      notFound();
    }

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${name} w ${cityName} — Exercio`,
      description: discipline.seo.descriptionTemplate.replace(
        "{city}",
        cityName,
      ),
      url: `${siteUrl}/${locale}/${slug}/${subslug}`,
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
          type="discipline"
          discipline={discipline}
          cityName={cityName}
          citySlug={slug}
          locale={locale}
          initialResults={results}
        />
      </>
    );
  }

  // Category+city page
  const { category, cityName } = resolved;
  const catName = getLocalizedName(category.names, locale);

  const catalog = await fetchCatalog();
  const categoryDisciplines =
    catalog?.disciplines.filter(
      (d) => d.categoryId === category.id && d.enabled,
    ) || [];

  const results = await fetchSearchResults({
    city: cityName,
    category: category.key,
    limit: 20,
  });

  // If no results at all → 404
  const hasResults =
    (results?.instructors?.total || 0) + (results?.enterprises?.total || 0) > 0;

  if (!hasResults) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${catName} w ${cityName} — Exercio`,
    url: `${siteUrl}/${locale}/${slug}/${subslug}`,
    about: {
      "@type": "Thing",
      name: catName,
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
        type="category"
        category={category}
        disciplines={categoryDisciplines}
        cityName={cityName}
        citySlug={subslug}
        locale={locale}
        initialResults={results}
      />
    </>
  );
}
