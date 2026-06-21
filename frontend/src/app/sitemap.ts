import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://trainly.pl";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface InstructorProfile {
  user: { username: string };
  updatedAt: string;
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
    url: `${BASE_URL}/pl/jak-to-dziala`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  },
  {
    url: `${BASE_URL}/pl/cennik`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
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
    url: `${BASE_URL}/pl/faq`,
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
    url: `${BASE_URL}/en/how-it-works`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  },
  {
    url: `${BASE_URL}/en/pricing`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
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
    url: `${BASE_URL}/en/faq`,
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
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let instructorRoutes: MetadataRoute.Sitemap = [];

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

  return [...staticRoutes, ...instructorRoutes];
}
