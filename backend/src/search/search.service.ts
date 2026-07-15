import { Injectable, Logger } from '@nestjs/common';
import { enterpriseMembershipsInclude } from '../instructor-profiles/instructor-profiles.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  getInstructorOrderBy,
  getEnterpriseOrderBy,
} from '../common/sort-utils';
import { disciplinesData } from '../modules/catalog/disciplines/disciplines.data';
import { slugifyToAscii } from '../common/slug-utils';
import { categoriesData } from '../modules/catalog/categories/categories.data';

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

  async search(filters: SearchFilters) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(50, Math.max(1, filters.limit || 20));
    const type = filters.type || 'all';

    // Resolve category to discipline keys
    let categoryDisciplines: string[] | undefined;
    if (filters.category) {
      categoryDisciplines = this.getDisciplinesByCategory(filters.category);
      if (categoryDisciplines.length === 0) {
        // Category not found or has no disciplines — return empty
        return {};
      }
    }

    // Merge category disciplines with explicit disciplines filter
    const allDisciplines = filters.disciplines
      ? [...new Set([...filters.disciplines, ...(categoryDisciplines || [])])]
      : categoryDisciplines;

    const result: {
      instructors?: { data: any[]; total: number };
      enterprises?: { data: any[]; total: number };
    } = {};

    if (type === 'all' || type === 'instructors') {
      result.instructors = await this.searchInstructors(
        filters.q,
        filters.city,
        filters.tags,
        // For instructors, category disciplines map to specializations
        filters.specializations
          ? [
              ...new Set([
                ...filters.specializations,
                ...(categoryDisciplines || []),
              ]),
            ]
          : categoryDisciplines,
        page,
        limit,
        filters.sortBy,
      );
    }

    if (type === 'all' || type === 'enterprises') {
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
    const cityFilter = q
      ? { city: { contains: q, mode: 'insensitive' as const } }
      : {};

    const [instructorCities, enterpriseCities] = await Promise.all([
      this.prisma.instructorProfile.findMany({
        where: {
          ...cityFilter,
          city: { not: null },
          isDraft: false,
        },
        select: { city: true },
        distinct: ['city'],
        take: 50,
      }),
      this.prisma.enterpriseProfile.findMany({
        where: {
          ...cityFilter,
          city: { not: null },
          status: 'ACTIVE',
        },
        select: { city: true },
        distinct: ['city'],
        take: 50,
      }),
    ]);

    const cities = new Set<string>();
    instructorCities.forEach((c) => c.city && cities.add(c.city));
    enterpriseCities.forEach((c) => c.city && cities.add(c.city));

    return Array.from(cities).sort();
  }

  private async searchInstructors(
    q?: string,
    city?: string,
    tags?: string[],
    specializations?: string[],
    page: number = 1,
    limit: number = 20,
    sortBy?: string,
  ) {
    const where: any = { isDraft: false };

    if (q) {
      where.OR = [
        { user: { firstName: { contains: q, mode: 'insensitive' } } },
        { user: { lastName: { contains: q, mode: 'insensitive' } } },
        { user: { username: { contains: q, mode: 'insensitive' } } },
        { bio: { contains: q, mode: 'insensitive' } },
        { tagline: { contains: q, mode: 'insensitive' } },
        { tags: { has: q } },
        { specializations: { has: q } },
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

    // Filter by specializations (OR logic — any selected specialization matches)
    if (specializations && specializations.length > 0) {
      where.specializations = { hasSome: specializations };
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

    const transformedData = data.map((profile) => ({
      ...profile,
      username: profile.user?.username || '',
      fullName: profile.user
        ? `${profile.user.firstName || ''} ${profile.user.lastName || ''}`.trim()
        : '',
    }));

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
    const where: any = { status: 'ACTIVE' };

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
}
