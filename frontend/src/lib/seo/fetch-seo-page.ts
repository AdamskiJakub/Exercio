/**
 * Server-side data fetching helpers for Programmatic SEO pages.
 *
 * These functions are used in Server Components (RSC) to fetch
 * catalog data and search results for SEO landing pages.
 */

import { API_BASE_URL } from "@/lib/utils/api-url";
import type { CatalogDiscipline, CatalogCategory } from "@/hooks/useCatalog";

// ============= API Response Types =============

interface SearchResponse {
  instructors?: { data: any[]; total: number };
  enterprises?: { data: any[]; total: number };
}

interface CatalogResponse {
  disciplines: CatalogDiscipline[];
  categories: CatalogCategory[];
}

// ============= Fetch Helpers =============

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
 * Fetch all catalog data (disciplines + categories) for SEO pages.
 */
export async function fetchCatalog(): Promise<CatalogResponse | null> {
  return fetchJson<CatalogResponse>(`${API_BASE_URL}/catalog`);
}

/**
 * Fetch a single discipline by its slug (locale-aware).
 */
export async function fetchDisciplineBySlug(
  slug: string,
  locale: string,
): Promise<CatalogDiscipline | null> {
  const catalog = await fetchCatalog();
  if (!catalog) return null;

  return (
    catalog.disciplines.find(
      (d) => d.slugs[locale as "pl" | "en"] === slug && d.enabled,
    ) || null
  );
}

/**
 * Fetch search results filtered by city and/or discipline.
 */
export async function fetchSearchResults(params: {
  city?: string;
  discipline?: string;
  specialization?: string;
  page?: number;
  limit?: number;
}): Promise<SearchResponse | null> {
  const searchParams = new URLSearchParams();
  searchParams.set("type", "all");

  if (params.city) searchParams.set("city", params.city);
  if (params.discipline) searchParams.set("disciplines", params.discipline);
  if (params.specialization)
    searchParams.set("specializations", params.specialization);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  return fetchJson<SearchResponse>(
    `${API_BASE_URL}/search?${searchParams.toString()}`,
  );
}

/**
 * Get all disciplines grouped by category for a city page.
 */
export async function fetchDisciplinesByCity(city: string): Promise<{
  disciplines: CatalogDiscipline[];
  categories: CatalogCategory[];
  results: SearchResponse | null;
}> {
  const [catalog, results] = await Promise.all([
    fetchCatalog(),
    fetchSearchResults({ city, limit: 1 }), // Just check if there are results
  ]);

  return {
    disciplines: catalog?.disciplines || [],
    categories: catalog?.categories || [],
    results,
  };
}
