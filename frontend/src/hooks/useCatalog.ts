"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { apiClient } from "@/lib/api";
import type {
  CatalogDiscipline,
  CatalogCategory,
  CatalogTag,
  CatalogGoal,
  CatalogResponse,
} from "@/lib/catalog-types";
import {
  getLocalizedName,
  getDisciplineName,
  getCategoryName,
  getCatalogTagName,
  getCatalogGoalName,
} from "@/lib/catalog-types";

// Re-export types and helpers for backward compatibility
export type {
  CatalogDiscipline,
  CatalogCategory,
  CatalogTag,
  CatalogGoal,
  CatalogResponse,
};
export {
  getLocalizedName,
  getDisciplineName,
  getCategoryName,
  getCatalogTagName,
  getCatalogGoalName,
};

// ============= MOCK CONFIG IMPORT =============
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_INSTRUCTORS === "true";

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
            key: string;
            names: { pl: string; en: string };
            categoryIds: string[];
            enabled: boolean;
          }) => ({
            id: t.id,
            key: t.key,
            names: t.names,
            categoryIds: t.categoryIds,
            enabled: t.enabled,
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

// ============= HELPER FUNCTIONS (cache-dependent) =============

export function getDisciplineByKey(key: string): CatalogDiscipline | undefined {
  return disciplinesCache?.find((d) => d.key === key);
}

export function getDisciplineById(id: string): CatalogDiscipline | undefined {
  return disciplinesCache?.find((d) => d.id === id);
}

export function getDisciplineNameByKey(key: string, locale: string): string {
  const discipline = getDisciplineByKey(key);
  return discipline ? getDisciplineName(discipline, locale) : key;
}

export function getDisciplineNameById(id: string, locale: string): string {
  const discipline = getDisciplineById(id);
  return discipline ? getDisciplineName(discipline, locale) : id;
}

/**
 * Maps legacy / alternative discipline keys to canonical catalog keys.
 * Covers old preset values (e.g. "Fitness", "Zdrowy kręgosłup") and any
 * future spelling variants, so they resolve to the catalog discipline name.
 */
export const DISCIPLINE_KEY_ALIASES: Record<string, string> = {
  Fitness: "functional-training",
  "Zdrowy kręgosłup": "stretching",
  "Trening medyczny": "physiotherapy",
};

/**
 * Pure resolver for discipline display names.
 * 1. Resolves aliases to canonical catalog keys.
 * 2. Looks up the catalog.
 * 3. Falls back to the original key when nothing matches.
 */
export function resolveDisciplineName(key: string, locale: string): string {
  const canonicalKey = DISCIPLINE_KEY_ALIASES[key] ?? key;
  const discipline = getDisciplineByKey(canonicalKey);
  return discipline ? getDisciplineName(discipline, locale) : key;
}

/**
 * Hook-based resolver that also handles legacy `disciplinesPresets` i18n keys
 * (e.g. "strengthTraining", "cardio") which are not part of the catalog.
 * Components should use this instead of duplicating translation logic.
 */
export function useResolveDisciplineName(): (key: string) => string {
  const locale = useLocale();
  const t = useTranslations("Dashboard.enterprise");

  return useCallback(
    (key: string): string => {
      const name = resolveDisciplineName(key, locale);
      if (name !== key) return name;

      const presetKey = `disciplinesPresets.${key}`;
      if (t.has(presetKey)) {
        const legacyName = t(presetKey);
        if (legacyName && !legacyName.startsWith("disciplinesPresets.")) {
          return legacyName;
        }
      }

      return key;
    },
    [locale, t],
  );
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

export function getCatalogTagNameById(id: string, locale: string): string {
  const tag = getCatalogTagById(id);
  return tag ? getCatalogTagName(tag, locale) : id;
}

// --- Goal helpers ---

export function getCatalogGoalById(id: string): CatalogGoal | undefined {
  return goalsCache?.find((g) => g.id === id);
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
