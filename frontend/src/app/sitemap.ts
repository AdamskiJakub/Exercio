import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://exercio.app";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface InstructorProfile {
  user: { username: string };
  updatedAt: string;
}

interface EnterpriseItem {
  slug: string;
  updatedAt: string;
}

interface CatalogDiscipline {
  key: string;
  slugs: { pl: string; en: string };
  enabled: boolean;
  indexable: boolean;
  popularity: number;
}

interface CatalogCategory {
  key: string;
  slugs: { pl: string; en: string };
  enabled: boolean;
}

interface SitemapCity {
  name: string;
  slug: string;
  instructors: number;
  enterprises: number;
}

interface SitemapCityDisciplinePair {
  cityName: string;
  citySlug: string;
  disciplineKey: string;
  disciplineSlug: string;
}

interface SitemapData {
  cities: SitemapCity[];
  cityDisciplinePairs: SitemapCityDisciplinePair[];
  cityCategoryPairs?: SitemapCityDisciplinePair[];
}

const staticRoutes = [
  // Polish routes
  {
    url: `${BASE_URL}/pl`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 1.0,
  },
  {
    url: `${BASE_URL}/pl/instruktorzy`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/pl/pomoc`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  },
  {
    url: `${BASE_URL}/pl/kontakt`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  },
  {
    url: `${BASE_URL}/pl/bezpieczenstwo`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.4,
  },
  {
    url: `${BASE_URL}/pl/polityka-prywatnosci`,
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.3,
  },
  {
    url: `${BASE_URL}/pl/regulamin`,
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.3,
  },
  {
    url: `${BASE_URL}/pl/polityka-cookies`,
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.3,
  },
  {
    url: `${BASE_URL}/pl/dla-firm`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  },
  {
    url: `${BASE_URL}/pl/dla-firm/aplikuj`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  },
  {
    url: `${BASE_URL}/pl/onboarding/instruktor`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.3,
  },
  // English routes
  {
    url: `${BASE_URL}/en`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/en/instructors`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/en/help`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.4,
  },
  {
    url: `${BASE_URL}/en/contact`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.4,
  },
  {
    url: `${BASE_URL}/en/safety`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.3,
  },
  {
    url: `${BASE_URL}/en/privacy`,
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.3,
  },
  {
    url: `${BASE_URL}/en/terms`,
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.3,
  },
  {
    url: `${BASE_URL}/en/cookies`,
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.3,
  },
  {
    url: `${BASE_URL}/en/partner`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  },
  {
    url: `${BASE_URL}/en/enterprise/apply`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.4,
  },
  {
    url: `${BASE_URL}/en/onboarding/instructor`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.3,
  },
];

/**
 * Fetch catalog disciplines from the backend for SEO landing page sitemaps.
 */
async function fetchDisciplines(): Promise<CatalogDiscipline[]> {
  try {
    const response = await fetch(`${API_URL}/catalog/disciplines`, {
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) {
      return response.json();
    }
  } catch (error) {
    console.error("Failed to fetch disciplines for sitemap:", error);
  }
  return [];
}

/**
 * Fetch catalog categories from the backend for SEO landing page sitemaps.
 */
async function fetchCategories(): Promise<CatalogCategory[]> {
  try {
    const response = await fetch(`${API_URL}/catalog/categories`, {
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) {
      return response.json();
    }
  } catch (error) {
    console.error("Failed to fetch categories for sitemap:", error);
  }
  return [];
}

/**
 * Fetch sitemap data (cities + city-discipline pairs) from SearchService.
 * Only returns combinations that actually exist in the database.
 */
async function fetchSitemapData(): Promise<SitemapData | null> {
  try {
    const response = await fetch(`${API_URL}/search/sitemap`, {
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) {
      return response.json();
    }
  } catch (error) {
    console.error("Failed to fetch sitemap data:", error);
  }
  return null;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let instructorRoutes: MetadataRoute.Sitemap = [];
  let enterpriseRoutes: MetadataRoute.Sitemap = [];
  let disciplineRoutes: MetadataRoute.Sitemap = [];
  let categoryRoutes: MetadataRoute.Sitemap = [];
  let cityRoutes: MetadataRoute.Sitemap = [];
  let cityDisciplineRoutes: MetadataRoute.Sitemap = [];
  let cityCategoryRoutes: MetadataRoute.Sitemap = [];

  // Fetch instructor profiles
  try {
    const response = await fetch(`${API_URL}/instructor-profiles`, {
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const instructors: InstructorProfile[] = await response.json();

      instructorRoutes = instructors.flatMap((instructor) => [
        {
          url: `${BASE_URL}/pl/instruktorzy/${instructor.user.username}`,
          lastModified: new Date(instructor.updatedAt),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        },
        {
          url: `${BASE_URL}/en/instructors/${instructor.user.username}`,
          lastModified: new Date(instructor.updatedAt),
          changeFrequency: "weekly" as const,
          priority: 0.6,
        },
      ]);
    }
  } catch (error) {
    console.error("Failed to fetch instructors for sitemap:", error);
  }

  // Fetch enterprise profiles
  try {
    const response = await fetch(`${API_URL}/enterprise`, {
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const enterprises: EnterpriseItem[] = await response.json();

      enterpriseRoutes = enterprises.flatMap((ent) => [
        {
          url: `${BASE_URL}/pl/enterprise/${ent.slug}`,
          lastModified: new Date(ent.updatedAt),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        },
        {
          url: `${BASE_URL}/en/enterprise/${ent.slug}`,
          lastModified: new Date(ent.updatedAt),
          changeFrequency: "weekly" as const,
          priority: 0.6,
        },
      ]);
    }
  } catch (error) {
    console.error("Failed to fetch enterprises for sitemap:", error);
  }

  // Fetch disciplines for SEO landing pages
  const disciplines = await fetchDisciplines();
  const indexableDisciplines = disciplines.filter(
    (d) => d.enabled && d.indexable,
  );

  if (indexableDisciplines.length > 0) {
    disciplineRoutes = indexableDisciplines.flatMap((discipline) => [
      {
        url: `${BASE_URL}/pl/${discipline.slugs.pl}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.95,
      },
      {
        url: `${BASE_URL}/en/${discipline.slugs.en}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.85,
      },
    ]);
  }

  // Fetch categories for SEO landing pages
  const categories = await fetchCategories();
  const enabledCategories = categories.filter((c) => c.enabled);

  if (enabledCategories.length > 0) {
    categoryRoutes = enabledCategories.flatMap((category) => [
      {
        url: `${BASE_URL}/pl/${category.slugs.pl}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/en/${category.slugs.en}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.8,
      },
    ]);
  }

  // Fetch sitemap data for cities and city+discipline pairs
  const sitemapData = await fetchSitemapData();

  if (sitemapData) {
    // City routes: /pl/{city}, /en/{city}
    cityRoutes = sitemapData.cities.flatMap((city) => [
      {
        url: `${BASE_URL}/pl/${city.slug}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/en/${city.slug}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.8,
      },
    ]);

    // City+discipline routes: /pl/{city}/{discipline}, /en/{city}/{discipline}
    // Only for pairs that actually exist in the database
    cityDisciplineRoutes = sitemapData.cityDisciplinePairs.flatMap((pair) => {
      // Find the English slug for this discipline
      const discipline = indexableDisciplines.find(
        (d) => d.key === pair.disciplineKey,
      );
      const enSlug = discipline?.slugs.en || pair.disciplineSlug;

      return [
        {
          url: `${BASE_URL}/pl/${pair.citySlug}/${pair.disciplineSlug}`,
          lastModified: new Date(),
          changeFrequency: "daily" as const,
          priority: 0.85,
        },
        {
          url: `${BASE_URL}/en/${pair.citySlug}/${enSlug}`,
          lastModified: new Date(),
          changeFrequency: "daily" as const,
          priority: 0.75,
        },
      ];
    });
  }

  // Category+city routes
  if (sitemapData?.cityCategoryPairs) {
    cityCategoryRoutes = sitemapData.cityCategoryPairs.flatMap((pair) => {
      const category = enabledCategories.find(
        (c) => c.key === pair.disciplineKey,
      );
      const enSlug = category?.slugs.en || pair.disciplineSlug;

      return [
        {
          url: `${BASE_URL}/pl/${pair.citySlug}/${pair.disciplineSlug}`,
          lastModified: new Date(),
          changeFrequency: "daily" as const,
          priority: 0.8,
        },
        {
          url: `${BASE_URL}/en/${pair.citySlug}/${enSlug}`,
          lastModified: new Date(),
          changeFrequency: "daily" as const,
          priority: 0.7,
        },
      ];
    });
  }

  return [
    ...staticRoutes,
    ...instructorRoutes,
    ...enterpriseRoutes,
    ...disciplineRoutes,
    ...categoryRoutes,
    ...cityRoutes,
    ...cityDisciplineRoutes,
    ...cityCategoryRoutes,
  ];
}
