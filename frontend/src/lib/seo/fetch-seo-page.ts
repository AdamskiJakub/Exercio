import { API_BASE_URL } from "@/lib/utils/api-url";
import type { CatalogDiscipline, CatalogCategory } from "@/hooks/useCatalog";

interface SearchResponse {
  instructors?: { data: any[]; total: number };
  enterprises?: { data: any[]; total: number };
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

export async function fetchCatalog(): Promise<CatalogResponse | null> {
  return fetchJson<CatalogResponse>(`${API_BASE_URL}/catalog`);
}

export async function fetchDisciplineBySlug(
  slug: string,
  locale: string,
): Promise<CatalogDiscipline | null> {
  return fetchJson<CatalogDiscipline>(
    `${API_BASE_URL}/catalog/disciplines/by-slug/${encodeURIComponent(slug)}?locale=${locale}`,
  );
}

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
