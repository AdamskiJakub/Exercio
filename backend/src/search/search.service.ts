import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { enterpriseMembershipsInclude } from '../instructor-profiles/instructor-profiles.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  getInstructorOrderBy,
  getEnterpriseOrderBy,
} from '../common/sort-utils';
import { disciplinesData } from '../modules/catalog/disciplines/disciplines.data';
import { slugifyToAscii, removePolishDiacritics } from '../common/slug-utils';
import { categoriesData } from '../modules/catalog/categories/categories.data';
import { buildInstructorSearchOrClause } from '../common/search-utils';
import {
  calculateInstructorScore,
  calculateEnterpriseScore,
} from '../common/quality-score';
import { fetchInstructorReviewStats } from '../common/review-utils';

interface SearchFilters {
  q?: string;
  city?: string;
  tags?: string[];
  specializations?: string[];
  disciplines?: string[];
  category?: string;
  type?: 'all' | 'instructors' | 'enterprises';
  sortBy?: string;
  page?: number;
  limit?: number;
  goals?: string[];
  priceMin?: number;
  priceMax?: number;
}

export interface SearchFeedItem {
  type: 'instructor' | 'enterprise';
  createdAt: Date;
  data: Record<string, unknown>;
  /** Quality score used for sortBy=relevance sorting */
  score?: number;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Resolve a category key to the list of discipline keys belonging to that category.
   */
  private getDisciplinesByCategory(categoryKey: string): string[] {
    const category = categoriesData.find(
      (c) => c.key === categoryKey && c.enabled,
    );
    if (!category) return [];
    // Find all disciplines that belong to this category
    return disciplinesData
      .filter((d) => d.categoryId === category.id && d.enabled)
      .map((d) => d.key);
  }

  /**
   * Resolve category → disciplines mapping and merge with explicit filters.
   * Shared between search() and searchAllFeed() to avoid duplication.
   */
  private resolveCategoryDisciplines(filters: SearchFilters): {
    categoryDisciplines: string[] | undefined;
    allDisciplines: string[] | undefined;
    instructorSpecializations: string[] | undefined;
  } {
    let categoryDisciplines: string[] | undefined;
    if (filters.category) {
      categoryDisciplines = this.getDisciplinesByCategory(filters.category);
    }

    // Merge category disciplines with explicit disciplines filter
    const allDisciplines = filters.disciplines
      ? [...new Set([...filters.disciplines, ...(categoryDisciplines || [])])]
      : categoryDisciplines;

    // For instructors, category disciplines map to specializations
    const instructorSpecializations = filters.specializations
      ? [
          ...new Set([
            ...filters.specializations,
            ...(categoryDisciplines || []),
          ]),
        ]
      : categoryDisciplines;

    return { categoryDisciplines, allDisciplines, instructorSpecializations };
  }

  /**
   * Extract a sortable name from a SearchFeedItem, regardless of type.
   */
  private getItemName(item: SearchFeedItem): string {
    if (item.type === 'instructor') {
      return ((item.data as Record<string, unknown>)?.fullName as string) || '';
    }
    return (
      ((item.data as Record<string, unknown>)?.companyName as string) || ''
    );
  }

  async search(filters: SearchFilters) {
    const type = filters.type || 'all';

    if (type === 'all') {
      return this.searchAllFeed(filters);
    }

    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(50, Math.max(1, filters.limit || 20));

    const { categoryDisciplines, allDisciplines, instructorSpecializations } =
      this.resolveCategoryDisciplines(filters);

    if (filters.category && categoryDisciplines?.length === 0) {
      return {};
    }

    // For relevance sorting on single-type views, use raw queries + in-memory scoring
    // (same quality-score logic as searchAllFeed)
    if (filters.sortBy === 'relevance') {
      if (type === 'instructors') {
        const raw = await this.searchInstructorsRaw(
          filters.q,
          filters.city,
          filters.tags,
          instructorSpecializations,
          filters.sortBy,
          filters.goals,
          filters.priceMin,
          filters.priceMax,
        );
        const reviewStats = await fetchInstructorReviewStats(this.prisma);
        const scored = raw.map((i) => {
          const stats = reviewStats.get((i as any).userId) || {
            avgRating: 0,
            reviewCount: 0,
          };
          return {
            ...i,
            _score: calculateInstructorScore({
              isDraft: i.isDraft,
              photoUrl: i.photoUrl,
              bio: i.bio,
              specializations: i.specializations,
              availability: i.availability,
              isBookingEnabled: i.isBookingEnabled,
              createdAt: i.createdAt,
              reviewCount: stats.reviewCount,
              averageRating: stats.avgRating,
            }),
          };
        });
        scored.sort((a, b) => b._score - a._score);
        const total = scored.length;
        const start = (page - 1) * limit;
        const paginated = scored.slice(start, start + limit);
        return { instructors: { data: paginated, total } };
      }

      if (type === 'enterprises') {
        const raw = await this.searchEnterprisesRaw(
          filters.q,
          filters.city,
          filters.tags,
          allDisciplines,
          filters.sortBy,
        );
        const scored = raw.map((e) => ({
          ...e,
          _score: calculateEnterpriseScore({
            status: e.status,
            logoUrl: e.logoUrl,
            coverUrl: e.coverUrl,
            description: e.description,
            instructorCount: e.instructorCount,
            gallery: e.gallery,
            openingHours: e.openingHours,
            createdAt: e.createdAt,
          }),
        }));
        scored.sort((a, b) => b._score - a._score);
        const total = scored.length;
        const start = (page - 1) * limit;
        const paginated = scored.slice(start, start + limit);
        return { enterprises: { data: paginated, total } };
      }
    }

    // Standard path for non-relevance sorting (uses Prisma orderBy with skip/take)
    const result: {
      instructors?: { data: any[]; total: number };
      enterprises?: { data: any[]; total: number };
    } = {};

    if (type === 'instructors') {
      result.instructors = await this.searchInstructors(
        filters.q,
        filters.city,
        filters.tags,
        instructorSpecializations,
        page,
        limit,
        filters.sortBy,
        filters.goals,
        filters.priceMin,
        filters.priceMax,
      );
    }

    if (type === 'enterprises') {
      result.enterprises = await this.searchEnterprises(
        filters.q,
        filters.city,
        filters.tags,
        allDisciplines,
        page,
        limit,
        filters.sortBy,
      );
    }

    return result;
  }

  /**
   * Search both instructors and enterprises, returning a single mixed feed
   * with unified pagination. Sorting strategy depends on sortBy:
   * - 'newest' (default): interleave 1:1 (instructor, enterprise, instructor, enterprise...)
   * - 'name-asc' / 'name-desc': global sort by name across both types
   */
  async searchAllFeed(filters: SearchFilters) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(50, Math.max(1, filters.limit || 10));

    const { categoryDisciplines, allDisciplines, instructorSpecializations } =
      this.resolveCategoryDisciplines(filters);

    if (filters.category && categoryDisciplines?.length === 0) {
      return {
        items: [],
        total: 0,
        instructorTotal: 0,
        enterpriseTotal: 0,
        page,
        totalPages: 0,
      };
    }

    // Fetch ALL matching records (no skip/take) — pagination is applied in-memory after sorting
    const [instructors, enterprises] = await Promise.all([
      this.searchInstructorsRaw(
        filters.q,
        filters.city,
        filters.tags,
        instructorSpecializations,
        filters.sortBy,
        filters.goals,
        filters.priceMin,
        filters.priceMax,
      ),
      this.searchEnterprisesRaw(
        filters.q,
        filters.city,
        filters.tags,
        allDisciplines,
        filters.sortBy,
      ),
    ]);

    // Fetch review stats for quality score calculation (only needed for relevance sorting)
    const needsReviewStats = !filters.sortBy || filters.sortBy === 'relevance';
    const reviewStats = needsReviewStats
      ? await fetchInstructorReviewStats(this.prisma)
      : new Map<string, { avgRating: number; reviewCount: number }>();

    // Build typed feed items with quality scores
    const instructorItems: SearchFeedItem[] = instructors.map((i) => {
      const stats = reviewStats.get((i as any).userId) || {
        avgRating: 0,
        reviewCount: 0,
      };
      return {
        type: 'instructor' as const,
        createdAt: i.createdAt,
        data: i,
        score: calculateInstructorScore({
          isDraft: i.isDraft,
          photoUrl: i.photoUrl,
          bio: i.bio,
          specializations: i.specializations,
          availability: i.availability,
          isBookingEnabled: i.isBookingEnabled,
          createdAt: i.createdAt,
          reviewCount: stats.reviewCount,
          averageRating: stats.avgRating,
        }),
      };
    });

    const enterpriseItems: SearchFeedItem[] = enterprises.map((e) => ({
      type: 'enterprise' as const,
      createdAt: e.createdAt,
      data: e,
      score: calculateEnterpriseScore({
        status: e.status,
        logoUrl: e.logoUrl,
        coverUrl: e.coverUrl,
        description: e.description,
        instructorCount: e.instructorCount,
        gallery: e.gallery,
        openingHours: e.openingHours,
        createdAt: e.createdAt,
      }),
    }));

    // Apply sorting strategy based on sortBy
    const sortBy = filters.sortBy || 'relevance';
    let items: SearchFeedItem[];

    if (sortBy === 'relevance') {
      // Sort by quality score descending (highest quality profiles first)
      const allItems = [...instructorItems, ...enterpriseItems];
      allItems.sort((a, b) => (b.score || 0) - (a.score || 0));
      items = allItems;
    } else if (sortBy === 'name-asc' || sortBy === 'name-desc') {
      // Global sort by name across both types
      const allItems = [...instructorItems, ...enterpriseItems];
      allItems.sort((a, b) => {
        const aName = this.getItemName(a);
        const bName = this.getItemName(b);
        const cmp = aName.localeCompare(bName, 'pl');
        return sortBy === 'name-asc' ? cmp : -cmp;
      });
      items = allItems;
    } else {
      // Default (newest): interleave 1:1 — instructor, enterprise, instructor, enterprise...
      // Each group is already sorted by createdAt desc from the raw queries
      const feed: SearchFeedItem[] = [];
      let i = 0;
      let e = 0;
      while (i < instructorItems.length || e < enterpriseItems.length) {
        if (i < instructorItems.length) {
          feed.push(instructorItems[i++]);
        }
        if (e < enterpriseItems.length) {
          feed.push(enterpriseItems[e++]);
        }
      }
      items = feed;
    }

    const total = items.length;
    const instructorTotal = instructors.length;
    const enterpriseTotal = enterprises.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedItems = items.slice(start, start + limit);

    return {
      items: paginatedItems,
      total,
      instructorTotal,
      enterpriseTotal,
      page,
      totalPages,
    };
  }

  /**
   * Find a city by its URL slug and return profile counts.
   * Used by resolveSlug() to determine if a slug corresponds to a real city with profiles.
   */
  async findCityBySlug(slug: string): Promise<{
    cityName: string;
    instructors: number;
    enterprises: number;
  } | null> {
    const normalizedSlug = slug.toLowerCase().trim();

    // Get all distinct cities from both tables
    const [instructorCities, enterpriseCities] = await Promise.all([
      this.prisma.instructorProfile.findMany({
        where: { city: { not: null }, isDraft: false },
        select: { city: true },
        distinct: ['city'],
      }),
      this.prisma.enterpriseProfile.findMany({
        where: { city: { not: null }, status: 'ACTIVE' },
        select: { city: true },
        distinct: ['city'],
      }),
    ]);

    // Find the actual city name by matching normalized slug against stored city names
    const matchingInstructorCities = instructorCities
      .filter((c) => c.city && slugifyToAscii(c.city) === normalizedSlug)
      .map((c) => c.city!);

    const matchingEnterpriseCities = enterpriseCities
      .filter((c) => c.city && slugifyToAscii(c.city) === normalizedSlug)
      .map((c) => c.city!);

    if (
      matchingInstructorCities.length === 0 &&
      matchingEnterpriseCities.length === 0
    ) {
      return null;
    }

    // Use the actual city name from the database (preserves diacritics: "Łódź", "Białystok", etc.)
    const cityName = matchingInstructorCities[0] || matchingEnterpriseCities[0];

    // Count actual profiles in matching cities
    const [instructorCount, enterpriseCount] = await Promise.all([
      matchingInstructorCities.length > 0
        ? this.prisma.instructorProfile.count({
            where: { city: { in: matchingInstructorCities }, isDraft: false },
          })
        : Promise.resolve(0),
      matchingEnterpriseCities.length > 0
        ? this.prisma.enterpriseProfile.count({
            where: { city: { in: matchingEnterpriseCities }, status: 'ACTIVE' },
          })
        : Promise.resolve(0),
    ]);

    return {
      cityName,
      instructors: instructorCount,
      enterprises: enterpriseCount,
    };
  }

  /**
   * Get sitemap data: cities with profile counts and existing city+discipline pairs.
   * Only returns data for combinations that actually exist in the database.
   * Used by the sitemap generator to avoid empty landing pages in search indexes.
   */
  async getSitemapData(): Promise<{
    cities: Array<{
      name: string;
      slug: string;
      instructors: number;
      enterprises: number;
    }>;
    cityDisciplinePairs: Array<{
      cityName: string;
      citySlug: string;
      disciplineKey: string;
      disciplineSlug: string;
    }>;
    cityCategoryPairs: Array<{
      cityName: string;
      citySlug: string;
      disciplineKey: string;
      disciplineSlug: string;
    }>;
  }> {
    const [instructorCities, enterpriseCities] = await Promise.all([
      this.prisma.instructorProfile.groupBy({
        by: ['city'],
        where: { city: { not: null }, isDraft: false },
        _count: { id: true },
      }),
      this.prisma.enterpriseProfile.groupBy({
        by: ['city'],
        where: { city: { not: null }, status: 'ACTIVE' },
        _count: { id: true },
      }),
    ]);

    // Build city map: cityName → { instructors, enterprises }
    const cityMap = new Map<
      string,
      { instructors: number; enterprises: number }
    >();

    instructorCities.forEach((c) => {
      if (c.city) {
        const existing = cityMap.get(c.city) || {
          instructors: 0,
          enterprises: 0,
        };
        existing.instructors += c._count.id;
        cityMap.set(c.city, existing);
      }
    });

    enterpriseCities.forEach((c) => {
      if (c.city) {
        const existing = cityMap.get(c.city) || {
          instructors: 0,
          enterprises: 0,
        };
        existing.enterprises += c._count.id;
        cityMap.set(c.city, existing);
      }
    });

    const cities = Array.from(cityMap.entries())
      .filter(([_, counts]) => counts.instructors + counts.enterprises > 0)
      .map(([name, counts]) => ({
        name,
        slug: slugifyToAscii(name),
        instructors: counts.instructors,
        enterprises: counts.enterprises,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Get existing city+discipline pairs from instructor specializations
    const instructorsWithSpecs = await this.prisma.instructorProfile.findMany({
      where: {
        city: { not: null },
        isDraft: false,
        specializations: { isEmpty: false },
      },
      select: {
        city: true,
        specializations: true,
      },
    });

    // Get existing city+discipline pairs from enterprise disciplines
    const enterprisesWithDiscs = await this.prisma.enterpriseProfile.findMany({
      where: {
        city: { not: null },
        status: 'ACTIVE',
        disciplines: { isEmpty: false },
      },
      select: {
        city: true,
        disciplines: true,
      },
    });

    // Build set of unique (city, disciplineKey) pairs
    const pairSet = new Set<string>();

    instructorsWithSpecs.forEach((p) => {
      if (p.city && p.specializations) {
        p.specializations.forEach((spec) => {
          pairSet.add(`${p.city!.toLowerCase().trim()}::${spec}`);
        });
      }
    });

    enterprisesWithDiscs.forEach((p) => {
      if (p.city && p.disciplines) {
        p.disciplines.forEach((disc) => {
          pairSet.add(`${p.city!.toLowerCase().trim()}::${disc}`);
        });
      }
    });

    // Resolve discipline slugs for the pairs using imported disciplinesData
    const disciplineSlugMap = new Map<string, { pl: string; en: string }>();
    disciplinesData
      .filter((d) => d.enabled)
      .forEach((d) => {
        disciplineSlugMap.set(d.key, d.slugs);
      });

    const cityDisciplinePairs = Array.from(pairSet)
      .map((pair) => {
        const [cityKey, discKey] = pair.split('::');
        const slugs = disciplineSlugMap.get(discKey);
        if (!slugs) return null;

        // Find the original city name from cityMap
        const originalCity = Array.from(cityMap.keys()).find(
          (name) => name.toLowerCase().trim() === cityKey,
        );
        if (!originalCity) return null;

        return {
          cityName: originalCity,
          citySlug: slugifyToAscii(originalCity),
          disciplineKey: discKey,
          disciplineSlug: slugs.pl, // Use PL slug for sitemap; EN will be generated by frontend
        };
      })
      .filter((pair): pair is NonNullable<typeof pair> => pair !== null)
      .sort(
        (a, b) =>
          a.cityName.localeCompare(b.cityName) ||
          a.disciplineKey.localeCompare(b.disciplineKey),
      );

    // Build city+category pairs from the same city+discipline pairs
    // Map each discipline key to its category, then group by category
    const disciplineToCategory = new Map<string, string>();
    const categorySlugMap = new Map<string, { pl: string; en: string }>();
    categoriesData
      .filter((c) => c.enabled)
      .forEach((c) => {
        categorySlugMap.set(c.key, c.slugs);
      });
    disciplinesData
      .filter((d) => d.enabled)
      .forEach((d) => {
        if (d.categoryId) {
          const cat = categoriesData.find((c) => c.id === d.categoryId);
          if (cat) {
            disciplineToCategory.set(d.key, cat.key);
          }
        }
      });

    // Build unique (city, categoryKey) pairs from existing city+discipline pairs
    const cityCategorySet = new Set<string>();
    cityDisciplinePairs.forEach((pair) => {
      const catKey = disciplineToCategory.get(pair.disciplineKey);
      if (catKey) {
        cityCategorySet.add(`${pair.cityName.toLowerCase().trim()}::${catKey}`);
      }
    });

    const cityCategoryPairs = Array.from(cityCategorySet)
      .map((pair) => {
        const [cityKey, catKey] = pair.split('::');
        const slugs = categorySlugMap.get(catKey);
        if (!slugs) return null;

        // Find the original city name from cityMap
        const originalCity = Array.from(cityMap.keys()).find(
          (name) => name.toLowerCase().trim() === cityKey,
        );
        if (!originalCity) return null;

        return {
          cityName: originalCity,
          citySlug: slugifyToAscii(originalCity),
          disciplineKey: catKey,
          disciplineSlug: slugs.pl,
        };
      })
      .filter((pair): pair is NonNullable<typeof pair> => pair !== null)
      .sort(
        (a, b) =>
          a.cityName.localeCompare(b.cityName) ||
          a.disciplineKey.localeCompare(b.disciplineKey),
      );

    return { cities, cityDisciplinePairs, cityCategoryPairs };
  }

  /**
   * Get cities where a specific discipline is available (has instructors or enterprises).
   * Used for internal linking on discipline landing pages.
   * @param disciplineKey - the discipline key (e.g. "boxing")
   * @returns array of { cityName, citySlug, instructors, enterprises }
   */
  async getDisciplineCities(disciplineKey: string): Promise<
    {
      cityName: string;
      citySlug: string;
      instructors: number;
      enterprises: number;
    }[]
  > {
    // Find instructors with this specialization
    const instructorsWithSpec = await this.prisma.instructorProfile.findMany({
      where: {
        specializations: { has: disciplineKey },
        city: { not: null },
        isDraft: false,
      },
      select: { city: true },
    });

    // Find enterprises with this discipline
    const enterprisesWithDisc = await this.prisma.enterpriseProfile.findMany({
      where: {
        disciplines: { has: disciplineKey },
        city: { not: null },
        status: 'ACTIVE',
      },
      select: { city: true },
    });

    // Aggregate counts by city
    const cityCounts = new Map<
      string,
      { instructors: number; enterprises: number }
    >();

    instructorsWithSpec.forEach((p) => {
      if (p.city) {
        const existing = cityCounts.get(p.city) || {
          instructors: 0,
          enterprises: 0,
        };
        existing.instructors++;
        cityCounts.set(p.city, existing);
      }
    });

    enterprisesWithDisc.forEach((p) => {
      if (p.city) {
        const existing = cityCounts.get(p.city) || {
          instructors: 0,
          enterprises: 0,
        };
        existing.enterprises++;
        cityCounts.set(p.city, existing);
      }
    });

    return Array.from(cityCounts.entries())
      .filter(([_, counts]) => counts.instructors + counts.enterprises > 0)
      .map(([name, counts]) => ({
        cityName: name,
        citySlug: slugifyToAscii(name),
        instructors: counts.instructors,
        enterprises: counts.enterprises,
      }))
      .sort((a, b) => a.cityName.localeCompare(b.cityName));
  }

  /**
   * Get unique cities from instructor and enterprise profiles.
   * Supports prefix search for autocomplete.
   */
  async getCities(q?: string): Promise<string[]> {
    const normalizedQuery = q ? removePolishDiacritics(q.toLowerCase()) : '';

    const [instructorCities, enterpriseCities] = await Promise.all([
      this.prisma.instructorProfile.findMany({
        where: {
          city: { not: null },
          isDraft: false,
        },
        select: { city: true },
        distinct: ['city'],
        take: 200,
      }),
      this.prisma.enterpriseProfile.findMany({
        where: {
          city: { not: null },
          status: 'ACTIVE',
        },
        select: { city: true },
        distinct: ['city'],
        take: 200,
      }),
    ]);

    const cities = new Set<string>();
    instructorCities.forEach((c) => c.city && cities.add(c.city));
    enterpriseCities.forEach((c) => c.city && cities.add(c.city));

    const filtered = Array.from(cities).filter((city) => {
      if (!normalizedQuery) return true;
      const normalizedCity = removePolishDiacritics(city.toLowerCase());
      return normalizedCity.includes(normalizedQuery);
    });

    return filtered.sort();
  }

  private buildInstructorWhere(
    q?: string,
    city?: string,
    tags?: string[],
    specializations?: string[],
    goals?: string[],
    priceMin?: number,
    priceMax?: number,
  ): Prisma.InstructorProfileWhereInput {
    const where: Prisma.InstructorProfileWhereInput = { isDraft: false };

    if (q) {
      const orClause = buildInstructorSearchOrClause(q);
      if (orClause) {
        where.OR = orClause;
      }
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    // Filter by tags (AND logic — all selected tags must be present)
    if (tags && tags.length > 0) {
      where.AND = tags.map((tag) => ({ tags: { has: tag } }));
    }

    // Filter by specializations (OR logic — any selected specialization matches)
    if (specializations && specializations.length > 0) {
      where.specializations = { hasSome: specializations };
    }

    // Filter by goals (OR logic — any selected goal matches)
    if (goals && goals.length > 0) {
      where.goals = { hasSome: goals };
    }

    // Filter by price range
    if (priceMin !== undefined || priceMax !== undefined) {
      where.hourlyRate = {};
      if (priceMin !== undefined) {
        where.hourlyRate.gte = priceMin;
      }
      if (priceMax !== undefined) {
        where.hourlyRate.lte = priceMax;
      }
    }

    return where;
  }

  private buildEnterpriseWhere(
    q?: string,
    city?: string,
    tags?: string[],
    disciplines?: string[],
  ): Prisma.EnterpriseProfileWhereInput {
    const where: Prisma.EnterpriseProfileWhereInput = { status: 'ACTIVE' };

    if (q) {
      where.OR = [
        { companyName: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { shortDescription: { contains: q, mode: 'insensitive' } },
        { tags: { has: q } },
        { city: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    // Filter by tags (AND logic — all selected tags must be present)
    if (tags && tags.length > 0) {
      where.AND = tags.map((tag) => ({ tags: { has: tag } }));
    }

    // Filter by disciplines (OR logic — any selected discipline matches)
    if (disciplines && disciplines.length > 0) {
      where.disciplines = { hasSome: disciplines };
    }

    return where;
  }

  /**
   * Fetch all matching instructor profiles without pagination (used by searchAllFeed).
   * Returns records with fullName/username flattened from user relation.
   */
  private async searchInstructorsRaw(
    q?: string,
    city?: string,
    tags?: string[],
    specializations?: string[],
    sortBy?: string,
    goals?: string[],
    priceMin?: number,
    priceMax?: number,
  ) {
    const where = this.buildInstructorWhere(
      q,
      city,
      tags,
      specializations,
      goals,
      priceMin,
      priceMax,
    );

    // For rating and most-reviewed, we need in-memory sorting with review aggregation
    if (sortBy === 'rating' || sortBy === 'most-reviewed') {
      const data = await this.prisma.instructorProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          ...enterpriseMembershipsInclude,
        },
      });

      const reviewStats = await fetchInstructorReviewStats(this.prisma);
      const enriched = this.enrichWithReviewStats(data, reviewStats);

      if (sortBy === 'rating') {
        enriched.sort((a, b) => b._avgRating - a._avgRating);
      } else {
        enriched.sort((a, b) => b._reviewCount - a._reviewCount);
      }

      return enriched;
    }

    const orderBy = getInstructorOrderBy(sortBy);

    const data = await this.prisma.instructorProfile.findMany({
      where,
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        ...enterpriseMembershipsInclude,
      },
    });

    return data.map((profile) => this.flattenUserFields(profile));
  }

  /**
   * Fetch all matching enterprise profiles without pagination (used by searchAllFeed).
   * Returns records with instructorCount flattened from _count.
   */
  private async searchEnterprisesRaw(
    q?: string,
    city?: string,
    tags?: string[],
    disciplines?: string[],
    sortBy?: string,
  ) {
    const where = this.buildEnterpriseWhere(q, city, tags, disciplines);
    const orderBy = getEnterpriseOrderBy(sortBy);

    const enterprises = await this.prisma.enterpriseProfile.findMany({
      where,
      orderBy,
      include: {
        _count: {
          select: {
            instructors: {
              where: { status: 'ACCEPTED' },
            },
          },
        },
      },
    });

    // Transform to match the shape expected by frontend EnterpriseListing
    return enterprises.map(({ _count, ...rest }) => ({
      ...rest,
      instructorCount: _count.instructors,
    }));
  }

  private async searchInstructors(
    q?: string,
    city?: string,
    tags?: string[],
    specializations?: string[],
    page: number = 1,
    limit: number = 20,
    sortBy?: string,
    goals?: string[],
    priceMin?: number,
    priceMax?: number,
  ) {
    const where = this.buildInstructorWhere(
      q,
      city,
      tags,
      specializations,
      goals,
      priceMin,
      priceMax,
    );

    // For rating and most-reviewed, fetch all matching profiles, sort in-memory, then paginate
    if (sortBy === 'rating' || sortBy === 'most-reviewed') {
      const [allData, total] = await Promise.all([
        this.prisma.instructorProfile.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
            ...enterpriseMembershipsInclude,
          },
        }),
        this.prisma.instructorProfile.count({ where }),
      ]);

      const reviewStats = await fetchInstructorReviewStats(this.prisma);
      const enriched = this.enrichWithReviewStats(allData, reviewStats);

      if (sortBy === 'rating') {
        enriched.sort((a, b) => b._avgRating - a._avgRating);
      } else {
        enriched.sort((a, b) => b._reviewCount - a._reviewCount);
      }

      const skip = (page - 1) * limit;
      const paginated = enriched.slice(skip, skip + limit);
      return { data: paginated, total };
    }

    const skip = (page - 1) * limit;
    const orderBy = getInstructorOrderBy(sortBy);

    const [data, total] = await Promise.all([
      this.prisma.instructorProfile.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          ...enterpriseMembershipsInclude,
        },
        orderBy,
      }),
      this.prisma.instructorProfile.count({ where }),
    ]);

    const transformedData = data.map((profile) =>
      this.flattenUserFields(profile),
    );

    return { data: transformedData, total };
  }

  private async searchEnterprises(
    q?: string,
    city?: string,
    tags?: string[],
    disciplines?: string[],
    page: number = 1,
    limit: number = 20,
    sortBy?: string,
  ) {
    const where = this.buildEnterpriseWhere(q, city, tags, disciplines);
    const skip = (page - 1) * limit;
    const orderBy = getEnterpriseOrderBy(sortBy);

    const [enterprises, total] = await Promise.all([
      this.prisma.enterpriseProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: {
              instructors: {
                where: { status: 'ACCEPTED' },
              },
            },
          },
        },
      }),
      this.prisma.enterpriseProfile.count({ where }),
    ]);

    const data = enterprises.map(({ _count, ...rest }) => ({
      ...rest,
      instructorCount: _count.instructors,
    }));

    return { data, total };
  }

  /**
   * Enrich instructor profiles with review stats (avgRating, reviewCount) and flatten user fields.
   * Used by both searchInstructorsRaw and searchInstructors for rating/most-reviewed sorting.
   */
  private enrichWithReviewStats(
    profiles: any[],
    reviewStats: Map<string, { avgRating: number; reviewCount: number }>,
  ): any[] {
    return profiles.map((profile) => {
      const stats = reviewStats.get(profile.userId) || {
        avgRating: 0,
        reviewCount: 0,
      };
      return {
        ...profile,
        username: profile.user?.username || '',
        fullName: profile.user
          ? `${profile.user.firstName || ''} ${profile.user.lastName || ''}`.trim()
          : '',
        _avgRating: stats.avgRating,
        _reviewCount: stats.reviewCount,
      };
    });
  }

  /**
   * Flatten user relation fields (username, fullName) from instructor profile query results.
   */
  private flattenUserFields(profile: any): any {
    return {
      ...profile,
      username: profile.user?.username || '',
      fullName: profile.user
        ? `${profile.user.firstName || ''} ${profile.user.lastName || ''}`.trim()
        : '',
    };
  }
}
