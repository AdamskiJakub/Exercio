import { Injectable } from '@nestjs/common';
import { disciplinesData } from './disciplines/disciplines.data';
import { categoriesData } from './categories/categories.data';
import { tagsData } from './tags/tags.data';
import { goalsData } from './goals/goals.data';
import { Discipline } from './disciplines/disciplines.types';
import { Category } from './categories/categories.types';
import { Tag } from './tags/tags.types';
import { Goal } from './goals/goals.types';

export interface CatalogResponse {
  disciplines: Discipline[];
  categories: Category[];
  tags: Tag[];
  goals: Goal[];
}

@Injectable()
export class CatalogService {
  getAll(): CatalogResponse {
    return {
      disciplines: disciplinesData.filter((d) => d.enabled),
      categories: categoriesData.filter((c) => c.enabled),
      tags: tagsData.filter((t) => t.enabled),
      goals: goalsData.filter((g) => g.enabled),
    };
  }

  getDisciplines(): Discipline[] {
    return disciplinesData.filter((d) => d.enabled);
  }

  getCategories(): Category[] {
    return categoriesData.filter((c) => c.enabled);
  }

  getTags(): Tag[] {
    return tagsData.filter((t) => t.enabled);
  }

  getGoals(): Goal[] {
    return goalsData.filter((g) => g.enabled);
  }

  getDisciplineByKey(key: string): Discipline | undefined {
    return disciplinesData.find((d) => d.key === key && d.enabled);
  }

  getDisciplineBySlug(
    slug: string,
    locale: 'pl' | 'en',
  ): Discipline | undefined {
    return disciplinesData.find((d) => d.slugs[locale] === slug && d.enabled);
  }

  getCategoryByKey(key: string): Category | undefined {
    return categoriesData.find((c) => c.key === key && c.enabled);
  }
}
