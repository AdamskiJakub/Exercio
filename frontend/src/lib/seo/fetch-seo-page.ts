import { API_BASE_URL } from "@/lib/utils/api-url";
import type { CatalogDiscipline, CatalogCategory } from "@/lib/catalog-types";
import type { InstructorListing } from "@/types";
import type { EnterpriseListing } from "@/types/enterprise";

export interface ResolveSlugResponse {
  type: "discipline" | "city" | "category" | null;
  discipline?: CatalogDiscipline;
  category?: CatalogCategory;
  cityName?: string;
  instructors?: number;
  enterprises?: number;
}

export interface SearchResponse {
  instructors?: { data: InstructorListing[]; total: number };
  enterprises?: { data: EnterpriseListing[]; total: number };
}

/**
 * Raw response from the /search?type=all endpoint — a single mixed feed
 * sorted by createdAt. Matches the backend response shape.
 */
interface FeedSearchResponse {
  items: Array<{
    type: "instructor" | "enterprise";
    createdAt: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
  }>;
  total: number;
  instructorTotal: number;
  enterpriseTotal: number;
  page: number;
  totalPages: number;
}

interface CatalogResponse {
  disciplines: CatalogDiscipline[];
  categories: CatalogCategory[];
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/**
 * Resolve a URL slug to determine if it's a discipline, a city with profiles, or unknown.
 * This is the single source of truth — frontend should NOT guess the type.
 */
export async function resolveSlug(
  slug: string,
  locale: string,
): Promise<ResolveSlugResponse | null> {
  return fetchJson<ResolveSlugResponse>(
    `${API_BASE_URL}/catalog/resolve-slug/${encodeURIComponent(slug)}?locale=${locale}`,
  );
}

export async function fetchCatalog(): Promise<CatalogResponse | null> {
  return fetchJson<CatalogResponse>(`${API_BASE_URL}/catalog`);
}

export async function fetchSearchResults(params: {
  city?: string;
  discipline?: string;
  specialization?: string;
  category?: string;
  page?: number;
  limit?: number;
}): Promise<SearchResponse | null> {
  const searchParams = new URLSearchParams();
  searchParams.set("type", "all");

  if (params.city) searchParams.set("city", params.city);
  // Discipline key doubles as specialization ID for instructor profiles
  // Send it as both `disciplines` (for enterprises) and `specializations` (for instructors)
  if (params.discipline) {
    searchParams.set("disciplines", params.discipline);
    searchParams.set("specializations", params.discipline);
  }
  if (params.specialization)
    searchParams.set("specializations", params.specialization);
  if (params.category) searchParams.set("category", params.category);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const raw = await fetchJson<FeedSearchResponse>(
    `${API_BASE_URL}/search?${searchParams.toString()}`,
  );
  if (!raw) return null;

  // Transform the mixed feed into separate instructor/enterprise buckets
  // matching the shape the SEO components expect.
  const instructors = raw.items
    .filter((item) => item.type === "instructor")
    .map((item) => item.data as InstructorListing);
  const enterprises = raw.items
    .filter((item) => item.type === "enterprise")
    .map((item) => item.data as EnterpriseListing);

  return {
    instructors: { data: instructors, total: raw.instructorTotal },
    enterprises: { data: enterprises, total: raw.enterpriseTotal },
  };
}

export async function fetchDisciplinesByCity(city: string): Promise<{
  disciplines: CatalogDiscipline[];
  categories: CatalogCategory[];
  results: SearchResponse | null;
}> {
  const [catalog, results] = await Promise.all([
    fetchCatalog(),
    fetchSearchResults({ city, limit: 1 }),
  ]);

  return {
    disciplines: catalog?.disciplines || [],
    categories: catalog?.categories || [],
    results,
  };
}

export interface DisciplineCity {
  cityName: string;
  citySlug: string;
  instructors: number;
  enterprises: number;
}

/**
 * Fetch cities where a specific discipline is available.
 * Used for internal linking on discipline landing pages.
 */
export async function fetchDisciplineCities(
  disciplineKey: string,
): Promise<DisciplineCity[]> {
  const data = await fetchJson<DisciplineCity[]>(
    `${API_BASE_URL}/search/disciplines/${encodeURIComponent(disciplineKey)}/cities`,
  );
  return data || [];
}
