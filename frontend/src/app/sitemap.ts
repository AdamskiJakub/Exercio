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
  slugs: { pl: string; en: string };
  enabled: boolean;
  indexable: boolean;
  popularity: number;
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let instructorRoutes: MetadataRoute.Sitemap = [];
  let enterpriseRoutes: MetadataRoute.Sitemap = [];
  let disciplineRoutes: MetadataRoute.Sitemap = [];

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
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/en/${discipline.slugs.en}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.7,
      },
    ]);
  }

  return [
    ...staticRoutes,
    ...instructorRoutes,
    ...enterpriseRoutes,
    ...disciplineRoutes,
  ];
}
