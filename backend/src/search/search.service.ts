import { Injectable, Logger } from '@nestjs/common';
import { enterpriseMembershipsInclude } from '../instructor-profiles/instructor-profiles.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  getInstructorOrderBy,
  getEnterpriseOrderBy,
} from '../common/sort-utils';

interface SearchFilters {
  q?: string;
  city?: string;
  tags?: string[];
  specializations?: string[];
  disciplines?: string[];
  type?: 'all' | 'instructors' | 'enterprises';
  sortBy?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private prisma: PrismaService) {}

  async search(filters: SearchFilters) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(50, Math.max(1, filters.limit || 20));
    const type = filters.type || 'all';

    const result: {
      instructors?: { data: any[]; total: number };
      enterprises?: { data: any[]; total: number };
    } = {};

    if (type === 'all' || type === 'instructors') {
      result.instructors = await this.searchInstructors(
        filters.q,
        filters.city,
        filters.tags,
        filters.specializations,
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
        filters.disciplines,
        page,
        limit,
        filters.sortBy,
      );
    }

    return result;
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
      const specFilter = specializations.map((spec) => ({
        specializations: { has: spec },
      }));
      // Merge with existing AND if present
      if (where.AND) {
        where.AND = [...where.AND, ...specFilter];
      } else {
        where.AND = specFilter;
      }
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
      const discFilter = disciplines.map((disc) => ({
        disciplines: { has: disc },
      }));
      // Merge with existing AND if present
      if (where.AND) {
        where.AND = [...where.AND, ...discFilter];
      } else {
        where.AND = discFilter;
      }
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
