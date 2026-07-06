import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInstructorProfileDto } from './dto/create-instructor-profile.dto';
import { UpdateInstructorProfileDto } from './dto/update-instructor-profile.dto';
import { StaticConfigService } from '../config/config.service';
import { getInstructorOrderBy } from '../common/sort-utils';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface InstructorFilters {
  q?: string;
  city?: string;
  specialization?: string;
  tags?: string[];
  goals?: string[];
  minRating?: number;
  priceMin?: number;
  priceMax?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class InstructorProfilesService {
  private readonly logger = new Logger(InstructorProfilesService.name);

  constructor(
    private prisma: PrismaService,
    private configService: StaticConfigService,
  ) {}

  /**
   * Verify that the user owns the instructor profile.
   * Shared across multiple services to avoid duplication.
   */
  async verifyInstructorOwnership(userId: string, instructorId: string) {
    const profile = await this.prisma.instructorProfile.findUnique({
      where: { id: instructorId },
    });

    if (!profile) {
      throw new NotFoundException('Instructor profile not found');
    }

    if (profile.userId !== userId) {
      throw new ForbiddenException('You do not own this instructor profile');
    }

    return profile;
  }

  /**
   * Find instructor profile by userId, throwing if not found.
   * Shared across multiple services to avoid duplication.
   */
  async findInstructorProfileByUserIdOrThrow(userId: string) {
    const profile = await this.prisma.instructorProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Instructor profile not found');
    }

    return profile;
  }

  async findAll(filters: InstructorFilters): Promise<PaginatedResult<any>> {
    const where: any = {
      isDraft: false,
    };

    if (filters.q) {
      where.OR = [
        { user: { firstName: { contains: filters.q, mode: 'insensitive' } } },
        { user: { lastName: { contains: filters.q, mode: 'insensitive' } } },
        { user: { username: { contains: filters.q, mode: 'insensitive' } } },
        { bio: { contains: filters.q, mode: 'insensitive' } },
        { tagline: { contains: filters.q, mode: 'insensitive' } },
        { tags: { has: filters.q } },
        { specializations: { has: filters.q } },
        { city: { contains: filters.q, mode: 'insensitive' } },
      ];
    }

    if (filters.city) {
      where.city = {
        contains: filters.city,
        mode: 'insensitive',
      };
    }

    if (filters.specialization) {
      where.specializations = {
        has: filters.specialization,
      };
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        hasSome: filters.tags,
      };
    }

    if (filters.goals && filters.goals.length > 0) {
      where.goals = {
        hasSome: filters.goals,
      };
    }

    // Price range
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      where.hourlyRate = {};
      if (filters.priceMin !== undefined) {
        where.hourlyRate.gte = filters.priceMin;
      }
      if (filters.priceMax !== undefined) {
        where.hourlyRate.lte = filters.priceMax;
      }
    }

    // Pagination
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    // If minRating filter is set, filter profiles at DB level using review aggregation
    if (filters.minRating !== undefined) {
      // Use raw SQL to find instructor IDs that meet the minRating threshold
      // (at least 5 reviews with average rating >= minRating)
      // NOTE: booking.instructorId = user.id, and profile.userId = user.id,
      // so we filter by profile.userId using the qualifying IDs from the subquery
      const qualifyingInstructorIds = await this.prisma.$queryRaw<
        Array<{ instructor_id: string }>
      >`
        SELECT b."instructorId" AS instructor_id
        FROM "Review" r
        JOIN "Booking" b ON b."id" = r."bookingId"
        GROUP BY b."instructorId"
        HAVING COUNT(*) >= 5 AND AVG(r.rating) >= ${filters.minRating}
      `;

      const qualifyingIds = new Set(
        qualifyingInstructorIds.map((row) => row.instructor_id),
      );

      // Filter profiles to only those that match the instructor IDs from the subquery
      // We need to map profile.userId (which is the instructor's user ID) to the instructorId in Booking
      // Actually, profile.id is the instructorProfile.id, and booking.instructorId is the user ID
      // So we filter by profile.userId (which is the user ID = instructorId in Booking)
      where.userId = { in: Array.from(qualifyingIds) };
    }

    const orderBy = getInstructorOrderBy(filters.sortBy);

    const [profiles, total] = await Promise.all([
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
        orderBy,
      }),
      this.prisma.instructorProfile.count({ where }),
    ]);

    const filteredProfiles = profiles.map((profile) => {
      const validSpecializations = profile.specializations.filter((spec) =>
        this.configService.isValidSpecialization(spec),
      );

      // Ensure at least one valid specialization exists (primary is specializations[0])
      // If all are invalid, log warning but keep profile (UI will handle gracefully)
      if (
        profile.specializations.length > 0 &&
        validSpecializations.length === 0
      ) {
        this.logger.warn(
          `Profile ${profile.id} has no valid specializations. Original: ${profile.specializations.join(', ')}`,
        );
      }

      return {
        ...profile,
        tags: profile.tags.filter((tag) => this.configService.isValidTag(tag)),
        specializations: validSpecializations,
        goals: profile.goals.filter((goal) =>
          this.configService.isValidGoal(goal),
        ),
      };
    });

    return {
      data: filteredProfiles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByUsername(username: string) {
    const profile = await this.prisma.instructorProfile.findFirst({
      where: {
        user: {
          username: username,
        },
        isDraft: false,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            role: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Instructor profile not found');
    }

    // Conditionally include contact info based on settings
    const userInfo: {
      id: string;
      username: string;
      firstName: string | null;
      lastName: string | null;
      role: string;
      email?: string;
      phone?: string | null;
    } = {
      id: profile.user.id,
      username: profile.user.username,
      firstName: profile.user.firstName,
      lastName: profile.user.lastName,
      role: profile.user.role,
    };

    if (profile.showEmail) {
      userInfo.email = profile.user.email;
    }

    if (profile.showPhone && profile.user.phone) {
      userInfo.phone = profile.user.phone;
    }

    // Fetch review stats for this instructor
    // booking.instructorId is the user ID (User.id), so we compare to profile.userId
    const reviewAgg = await this.prisma.review.aggregate({
      where: {
        booking: {
          instructorId: profile.userId,
        },
      },
      _avg: {
        rating: true,
      },
      _count: true,
    });

    const reviewCount = reviewAgg._count;
    const averageRating = reviewAgg._avg.rating;

    // Fetch favorite count
    const favoriteCount = await this.prisma.favorite.count({
      where: { instructorProfileId: profile.id },
    });

    // contactMessage is always public if set (shown in contact section)
    return {
      ...profile,
      tags: profile.tags.filter((tag) => this.configService.isValidTag(tag)),
      specializations: profile.specializations.filter((spec) =>
        this.configService.isValidSpecialization(spec),
      ),
      goals: profile.goals.filter((goal) =>
        this.configService.isValidGoal(goal),
      ),
      user: userInfo,
      averageRating: reviewCount >= 5 ? averageRating : null,
      reviewCount,
      favoriteCount,
    };
  }

  async create(userId: string, dto: CreateInstructorProfileDto) {
    try {
      const profile = await this.prisma.instructorProfile.create({
        data: {
          userId: userId,
          bio: dto.bio,
          specializations: dto.specializations || [],
          city: dto.city,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
      });

      return profile;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Instructor profile already exists for this user',
        );
      }
      throw error;
    }
  }

  async findByUserId(userId: string) {
    return this.prisma.instructorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
          },
        },
      },
    });
  }

  async update(
    profileId: string,
    userId: string,
    dto: UpdateInstructorProfileDto,
  ) {
    const profile = await this.prisma.instructorProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException('Instructor profile not found');
    }

    if (profile.userId !== userId) {
      throw new ForbiddenException('You can only update your own profile');
    }

    return this.prisma.instructorProfile.update({
      where: { id: profileId },
      data: dto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }

  async publish(profileId: string, userId: string) {
    const profile = await this.prisma.instructorProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException('Instructor profile not found');
    }

    if (profile.userId !== userId) {
      throw new ForbiddenException('You can only publish your own profile');
    }

    return this.prisma.instructorProfile.update({
      where: { id: profileId },
      data: { isDraft: false },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }
}
