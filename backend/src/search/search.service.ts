import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface SearchFilters {
  q?: string;
  city?: string;
  tags?: string[];
  type?: 'all' | 'instructors' | 'enterprises';
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
        page,
        limit,
      );
    }

    if (type === 'all' || type === 'enterprises') {
      result.enterprises = await this.searchEnterprises(
        filters.q,
        filters.city,
        filters.tags,
        page,
        limit,
      );
    }

    return result;
  }

  private async searchInstructors(
    q?: string,
    city?: string,
    tags?: string[],
    page: number = 1,
    limit: number = 20,
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

    const skip = (page - 1) * limit;

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
        },
        orderBy: { createdAt: 'desc' },
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
    page: number = 1,
    limit: number = 20,
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

    const skip = (page - 1) * limit;

    const [enterprises, total] = await Promise.all([
      this.prisma.enterpriseProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
