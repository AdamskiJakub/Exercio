import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateEnterpriseProfileDto } from './dto/update-enterprise-profile.dto';

@Injectable()
export class EnterpriseService {
  private readonly logger = new Logger(EnterpriseService.name);

  constructor(private prisma: PrismaService) {}

  async findByUserId(userId: string) {
    return this.prisma.enterpriseProfile.findUnique({
      where: { userId },
      include: {
        instructors: {
          where: { status: 'ACCEPTED' },
          include: {
            instructor: {
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
            },
          },
        },
        news: true,
      },
    });
  }

  async findBySlug(slug: string) {
    const profile = await this.prisma.enterpriseProfile.findUnique({
      where: { slug },
      include: {
        instructors: {
          where: { status: 'ACCEPTED' },
          include: {
            instructor: {
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
            },
          },
        },
        news: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Enterprise profile not found');
    }

    return profile;
  }

  async getRating(enterpriseId: string) {
    const instructors = await this.prisma.enterpriseInstructor.findMany({
      where: { enterpriseId, status: 'ACCEPTED' },
      include: {
        instructor: {
          include: {
            user: {
              include: {
                bookingsAsInstructor: {
                  where: {
                    review: { isNot: null },
                  },
                  include: {
                    review: {
                      select: { rating: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const allRatings = instructors.flatMap((ei) =>
      ei.instructor.user.bookingsAsInstructor
        .filter((b) => b.review)
        .map((b) => b.review!.rating),
    );

    if (allRatings.length === 0) {
      return null;
    }

    return {
      average: allRatings.reduce((a, b) => a + b, 0) / allRatings.length,
      total: allRatings.length,
    };
  }

  async update(
    profileId: string,
    userId: string,
    dto: UpdateEnterpriseProfileDto,
  ) {
    const profile = await this.prisma.enterpriseProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException('Enterprise profile not found');
    }

    if (profile.userId !== userId) {
      throw new ForbiddenException(
        'You can only update your own enterprise profile',
      );
    }

    return this.prisma.enterpriseProfile.update({
      where: { id: profileId },
      data: dto,
    });
  }

  async verifyOwnership(userId: string, enterpriseId: string) {
    const profile = await this.prisma.enterpriseProfile.findUnique({
      where: { id: enterpriseId },
    });

    if (!profile) {
      throw new NotFoundException('Enterprise profile not found');
    }

    if (profile.userId !== userId) {
      throw new ForbiddenException('You do not own this enterprise profile');
    }

    return profile;
  }

  async findEnterpriseProfileByUserIdOrThrow(userId: string) {
    const profile = await this.prisma.enterpriseProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Enterprise profile not found');
    }

    return profile;
  }
}
