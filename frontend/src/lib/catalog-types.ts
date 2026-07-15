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

// ============= HELPER FUNCTIONS =============

/** Get localized name from a {pl, en} names object */
export function getLocalizedName(
  names: { pl: string; en: string },
  locale: string,
): string {
  return locale === "pl" ? names.pl : names.en;
}

// --- Discipline helpers ---

export function getDisciplineName(
  discipline: CatalogDiscipline,
  locale: string,
): string {
  return getLocalizedName(discipline.names, locale);
}

// --- Category helpers ---

export function getCategoryName(
  category: CatalogCategory,
  locale: string,
): string {
  return getLocalizedName(category.names, locale);
}

// --- Tag helpers ---

export function getCatalogTagName(tag: CatalogTag, locale: string): string {
  return getLocalizedName(tag.names, locale);
}

// --- Goal helpers ---

export function getCatalogGoalName(goal: CatalogGoal, locale: string): string {
  return getLocalizedName(goal.names, locale);
}
