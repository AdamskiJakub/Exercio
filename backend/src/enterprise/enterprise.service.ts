import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EnterpriseBaseService } from './enterprise-base.service';
import type { UpdateEnterpriseProfileDto } from './dto/update-enterprise-profile.dto';

@Injectable()
export class EnterpriseService extends EnterpriseBaseService {
  private readonly logger = new Logger(EnterpriseService.name);

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  /**
   * Return minimal data for all active enterprises (used for sitemap).
   */
  async findAllActive(): Promise<{ slug: string; updatedAt: Date }[]> {
    return this.prisma.enterpriseProfile.findMany({
      where: { status: 'ACTIVE' },
      select: { slug: true, updatedAt: true },
    });
  }

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
    await this.verifyOwnership(profileId, userId, 'update the profile');

    return this.prisma.enterpriseProfile.update({
      where: { id: profileId },
      data: dto,
    });
  }
}
