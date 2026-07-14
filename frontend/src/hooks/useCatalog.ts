"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

// ============= MOCK CONFIG IMPORT =============
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_INSTRUCTORS === "true";

// ============= TYPES =============

export interface CatalogDiscipline {
  id: string;
  key: string;
  categoryId: string;
  names: { pl: string; en: string };
  slugs: { pl: string; en: string };
  synonyms: string[];
  seo: {
    titleTemplate: string;
    descriptionTemplate: string;
  };
  popularity: number;
  enabled: boolean;
  indexable: boolean;
  icon?: string;
}

export interface CatalogCategory {
  id: string;
  key: string;
  names: { pl: string; en: string };
  slugs: { pl: string; en: string };
  icon: string;
  order: number;
  enabled: boolean;
}

export interface CatalogTag {
  id: string;
  key: string;
  names: { pl: string; en: string };
  categoryIds: string[];
  enabled: boolean;
}

export interface CatalogGoal {
  id: string;
  key: string;
  names: { pl: string; en: string };
  icon: string;
  enabled: boolean;
}

export interface CatalogResponse {
  disciplines: CatalogDiscipline[];
  categories: CatalogCategory[];
  tags: CatalogTag[];
  goals: CatalogGoal[];
}

// ============= CACHE =============
let disciplinesCache: CatalogDiscipline[] | null = null;
let categoriesCache: CatalogCategory[] | null = null;
let tagsCache: CatalogTag[] | null = null;
let goalsCache: CatalogGoal[] | null = null;

// In-flight promise cache to prevent duplicate fetches
let catalogPromise: Promise<CatalogResponse> | null = null;
let disciplinesPromise: Promise<CatalogDiscipline[]> | null = null;
let categoriesPromise: Promise<CatalogCategory[]> | null = null;
let tagsPromise: Promise<CatalogTag[]> | null = null;
let goalsPromise: Promise<CatalogGoal[]> | null = null;

// ============= FETCH FUNCTIONS =============

function fetchCatalog(): Promise<CatalogResponse> {
  if (disciplinesCache && categoriesCache && tagsCache && goalsCache) {
    return Promise.resolve({
      disciplines: disciplinesCache,
      categories: categoriesCache,
      tags: tagsCache,
      goals: goalsCache,
    });
  }

  if (catalogPromise) {
    return catalogPromise;
  }

  if (USE_MOCK) {
    catalogPromise = import("@/lib/utils/mock-instructors").then((mod) => {
      const response: CatalogResponse = {
        disciplines: [],
        categories: (mod.mockSpecializations || []).map(
          (s: {
            id: string;
            nameEn: string;
            namePl: string;
            icon: string;
            order: number;
          }) => ({
            id: s.id,
            key: s.id,
            names: { pl: s.namePl, en: s.nameEn },
            slugs: { pl: s.id, en: s.id },
            icon: s.icon,
            order: s.order,
            enabled: true,
          }),
        ),
        tags: (mod.mockTags || []).map(
          (t: {
            id: string;
            nameEn: string;
            namePl: string;
            categories?: string[];
          }) => ({
            id: t.id,
            key: t.id,
            names: { pl: t.namePl, en: t.nameEn },
            categoryIds: t.categories || [],
            enabled: true,
          }),
        ),
        goals: (mod.mockGoals || []).map(
          (g: {
            id: string;
            nameEn: string;
            namePl: string;
            icon: string;
          }) => ({
            id: g.id,
            key: g.id,
            names: { pl: g.namePl, en: g.nameEn },
            icon: g.icon,
            enabled: true,
          }),
        ),
      };
      disciplinesCache = response.disciplines;
      categoriesCache = response.categories;
      tagsCache = response.tags;
      goalsCache = response.goals;
      catalogPromise = null;
      return response;
    });
    return catalogPromise;
  }

  catalogPromise = apiClient
    .get<CatalogResponse>("/catalog")
    .then((res) => res.data)
    .then((data: CatalogResponse) => {
      disciplinesCache = data.disciplines;
      categoriesCache = data.categories;
      tagsCache = data.tags;
      goalsCache = data.goals;
      catalogPromise = null;
      return data;
    })
    .catch((err) => {
      catalogPromise = null;
      throw err;
    });

  return catalogPromise;
}

function fetchDisciplines(): Promise<CatalogDiscipline[]> {
  if (disciplinesCache) {
    return Promise.resolve(disciplinesCache);
  }

  if (disciplinesPromise) {
    return disciplinesPromise;
  }

  if (USE_MOCK) {
    return fetchCatalog().then((r) => r.disciplines);
  }

  disciplinesPromise = apiClient
    .get<CatalogDiscipline[]>("/catalog/disciplines")
    .then((res) => res.data)
    .then((data: CatalogDiscipline[]) => {
      disciplinesCache = data;
      disciplinesPromise = null;
      return data;
    })
    .catch((err) => {
      disciplinesPromise = null;
      throw err;
    });

  return disciplinesPromise;
}

function fetchCategories(): Promise<CatalogCategory[]> {
  if (categoriesCache) {
    return Promise.resolve(categoriesCache);
  }

  if (categoriesPromise) {
    return categoriesPromise;
  }

  if (USE_MOCK) {
    return fetchCatalog().then((r) => r.categories);
  }

  categoriesPromise = apiClient
    .get<CatalogCategory[]>("/catalog/categories")
    .then((res) => res.data)
    .then((data: CatalogCategory[]) => {
      categoriesCache = data;
      categoriesPromise = null;
      return data;
    })
    .catch((err) => {
      categoriesPromise = null;
      throw err;
    });

  return categoriesPromise;
}

function fetchTags(): Promise<CatalogTag[]> {
  if (tagsCache) {
    return Promise.resolve(tagsCache);
  }

  if (tagsPromise) {
    return tagsPromise;
  }

  if (USE_MOCK) {
    return fetchCatalog().then((r) => r.tags);
  }

  tagsPromise = apiClient
    .get<CatalogTag[]>("/catalog/tags")
    .then((res) => res.data)
    .then((data: CatalogTag[]) => {
      tagsCache = data;
      tagsPromise = null;
      return data;
    })
    .catch((err) => {
      tagsPromise = null;
      throw err;
    });

  return tagsPromise;
}

function fetchGoals(): Promise<CatalogGoal[]> {
  if (goalsCache) {
    return Promise.resolve(goalsCache);
  }

  if (goalsPromise) {
    return goalsPromise;
  }

  if (USE_MOCK) {
    return fetchCatalog().then((r) => r.goals);
  }

  goalsPromise = apiClient
    .get<CatalogGoal[]>("/catalog/goals")
    .then((res) => res.data)
    .then((data: CatalogGoal[]) => {
      goalsCache = data;
      goalsPromise = null;
      return data;
    })
    .catch((err) => {
      goalsPromise = null;
      throw err;
    });

  return goalsPromise;
}

// ============= HOOKS =============

export function useCatalog() {
  const [data, setData] = useState<CatalogResponse>({
    disciplines: disciplinesCache || [],
    categories: categoriesCache || [],
    tags: tagsCache || [],
    goals: goalsCache || [],
  });
  const [loading, setLoading] = useState(
    !disciplinesCache || !categoriesCache || !tagsCache || !goalsCache,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (disciplinesCache && categoriesCache && tagsCache && goalsCache) {
      return;
    }

    fetchCatalog()
      .then((response) => {
        setData(response);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { ...data, loading, error };
}

export function useDisciplines() {
  const [disciplines, setDisciplines] = useState<CatalogDiscipline[]>(
    disciplinesCache || [],
  );
  const [loading, setLoading] = useState(!disciplinesCache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (disciplinesCache) {
      return;
    }

    fetchDisciplines()
      .then((data) => {
        setDisciplines(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { disciplines, loading, error };
}

export function useCategories() {
  const [categories, setCategories] = useState<CatalogCategory[]>(
    categoriesCache || [],
  );
  const [loading, setLoading] = useState(!categoriesCache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (categoriesCache) {
      return;
    }

    fetchCategories()
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { categories, loading, error };
}

export function useCatalogTags() {
  const [tags, setTags] = useState<CatalogTag[]>(tagsCache || []);
  const [loading, setLoading] = useState(!tagsCache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tagsCache) {
      return;
    }

    fetchTags()
      .then((data) => {
        setTags(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { tags, loading, error };
}

export function useCatalogGoals() {
  const [goals, setGoals] = useState<CatalogGoal[]>(goalsCache || []);
  const [loading, setLoading] = useState(!goalsCache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (goalsCache) {
      return;
    }

    fetchGoals()
      .then((data) => {
        setGoals(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { goals, loading, error };
}

// ============= PREFETCH FUNCTIONS =============

export function prefetchCatalog() {
  return fetchCatalog();
}

export function prefetchDisciplines() {
  return fetchDisciplines();
}

export function prefetchCategories() {
  return fetchCategories();
}

export function prefetchCatalogTags() {
  return fetchTags();
}

export function prefetchCatalogGoals() {
  return fetchGoals();
}

// ============= HELPER FUNCTIONS =============

/** Get localized name from a {pl, en} names object */
export function getLocalizedName(
  names: { pl: string; en: string },
  locale: string,
): string {
  return locale === "pl" ? names.pl : names.en;
}

// --- Discipline helpers ---

export function getDisciplineByKey(key: string): CatalogDiscipline | undefined {
  return disciplinesCache?.find((d) => d.key === key);
}

export function getDisciplineById(id: string): CatalogDiscipline | undefined {
  return disciplinesCache?.find((d) => d.id === id);
}

export function getDisciplineName(
  discipline: CatalogDiscipline,
  locale: string,
): string {
  return getLocalizedName(discipline.names, locale);
}

export function getDisciplineNameByKey(key: string, locale: string): string {
  const discipline = getDisciplineByKey(key);
  return discipline ? getDisciplineName(discipline, locale) : key;
}

export function getDisciplineNameById(id: string, locale: string): string {
  const discipline = getDisciplineById(id);
  return discipline ? getDisciplineName(discipline, locale) : id;
}

export function getDisciplinesByCategory(
  categoryId: string,
): CatalogDiscipline[] {
  return (disciplinesCache || []).filter(
    (d) => d.categoryId === categoryId && d.enabled,
  );
}

// --- Category helpers ---

export function getCategoryByKey(key: string): CatalogCategory | undefined {
  return categoriesCache?.find((c) => c.key === key);
}

export function getCategoryById(id: string): CatalogCategory | undefined {
  return categoriesCache?.find((c) => c.id === id);
}

export function getCategoryName(
  category: CatalogCategory,
  locale: string,
): string {
  return getLocalizedName(category.names, locale);
}

export function getCategoryNameByKey(key: string, locale: string): string {
  const category = getCategoryByKey(key);
  return category ? getCategoryName(category, locale) : key;
}

export function getCategoryNameById(id: string, locale: string): string {
  const category = getCategoryById(id);
  return category ? getCategoryName(category, locale) : id;
}

// --- Tag helpers ---

export function getCatalogTagById(id: string): CatalogTag | undefined {
  return tagsCache?.find((t) => t.id === id);
}

export function getCatalogTagName(tag: CatalogTag, locale: string): string {
  return getLocalizedName(tag.names, locale);
}

export function getCatalogTagNameById(id: string, locale: string): string {
  const tag = getCatalogTagById(id);
  return tag ? getCatalogTagName(tag, locale) : id;
}

// --- Goal helpers ---

export function getCatalogGoalById(id: string): CatalogGoal | undefined {
  return goalsCache?.find((g) => g.id === id);
}

export function getCatalogGoalName(goal: CatalogGoal, locale: string): string {
  return getLocalizedName(goal.names, locale);
}

export function getCatalogGoalNameById(id: string, locale: string): string {
  const goal = getCatalogGoalById(id);
  return goal ? getCatalogGoalName(goal, locale) : id;
}

// --- Bulk accessors (for components that need data without hooks) ---

export function getAllDisciplines(): CatalogDiscipline[] {
  return disciplinesCache || [];
}

export function getAllCategories(): CatalogCategory[] {
  return categoriesCache || [];
}

export function getAllCatalogTags(): CatalogTag[] {
  return tagsCache || [];
}

export function getAllCatalogGoals(): CatalogGoal[] {
  return goalsCache || [];
}
