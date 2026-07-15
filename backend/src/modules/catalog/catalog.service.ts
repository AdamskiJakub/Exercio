import { Injectable } from '@nestjs/common';
import { disciplinesData } from './disciplines/disciplines.data';
import { categoriesData } from './categories/categories.data';
import { tagsData } from './tags/tags.data';
import { goalsData } from './goals/goals.data';
import { Discipline } from './disciplines/disciplines.types';
import { Category } from './categories/categories.types';
import { Tag } from './tags/tags.types';
import { Goal } from './goals/goals.types';
import { SearchService } from '../../search/search.service';

export interface CatalogResponse {
  disciplines: Discipline[];
  categories: Category[];
  tags: Tag[];
  goals: Goal[];
}

export interface ResolveSlugResult {
  type: 'discipline' | 'city' | 'category' | null;
  discipline?: Discipline;
  category?: Category;
  cityName?: string;
  instructors?: number;
  enterprises?: number;
}

@Injectable()
export class CatalogService {
  constructor(private readonly searchService: SearchService) {}
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

  getCategoryBySlug(slug: string, locale: 'pl' | 'en'): Category | undefined {
    return categoriesData.find((c) => c.slugs[locale] === slug && c.enabled);
  }

  /**
   * Resolve a URL slug to determine if it's a discipline, a category, a city with profiles, or unknown.
   * This is the single source of truth for SEO page routing — frontend should NOT guess.
   */
  async resolveSlug(
    slug: string,
    locale: 'pl' | 'en',
  ): Promise<ResolveSlugResult> {
    // 1. Check if slug matches a discipline
    const discipline = this.getDisciplineBySlug(slug, locale);
    if (discipline) {
      return {
        type: 'discipline',
        discipline,
      };
    }

    // 2. Check if slug matches a category
    const category = this.getCategoryBySlug(slug, locale);
    if (category) {
      return {
        type: 'category',
        category,
      };
    }

    // 3. Check if slug matches a city with profiles in the database
    const city = await this.searchService.findCityBySlug(slug);
    if (city) {
      return {
        type: 'city',
        cityName: city.cityName,
        instructors: city.instructors,
        enterprises: city.enterprises,
      };
    }

    // 4. Not found
    return { type: null };
  }
}
