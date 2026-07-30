import {
  Injectable,
  NotFoundException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { EnterpriseStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EnterpriseBaseService } from './enterprise-base.service';
import type { UpdateEnterpriseProfileDto } from './dto/update-enterprise-profile.dto';
import { FOUNDING_PARTNER_CONFIG } from './enterprise.constants';

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
      where: { status: 'ACTIVE', isDraft: false },
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

    // Wrap status update and badge grant in a single transaction
    // to prevent inconsistent state (ACTIVE profile without badge)
    const updated = await this.prisma.$transaction(async (tx) => {
      const profile = await tx.enterpriseProfile.update({
        where: { id: profileId },
        data: dto,
      });

      if (
        dto.status === EnterpriseStatus.ACTIVE &&
        FOUNDING_PARTNER_CONFIG.enabled
      ) {
        await this.executeGrantInTransaction(tx, profileId, false).catch(
          (err) => {
            this.logger.warn(
              `Failed to auto-grant Founding Partner badge: ${err.stack}`,
            );
          },
        );
      }

      return profile;
    });

    return updated;
  }

  async publish(profileId: string, userId: string) {
    const profile = await this.prisma.enterpriseProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException('Enterprise profile not found');
    }

    if (profile.userId !== userId) {
      throw new ForbiddenException('You can only publish your own profile');
    }

    return this.prisma.enterpriseProfile.update({
      where: { id: profileId },
      data: { isDraft: false },
    });
  }

  /**
   * Shared logic: check profile exists, check already has badge, check limit, then grant.
   * Used by both auto-grant (silent) and admin force-grant (throws).
   */
  private async executeGrantInTransaction(
    tx: any,
    enterpriseId: string,
    throwOnConflict: boolean,
  ): Promise<void> {
    const profile = await tx.enterpriseProfile.findUnique({
      where: { id: enterpriseId },
      select: { foundingPartnerGrantedAt: true },
    });

    if (!profile) {
      throw new NotFoundException('Enterprise profile not found');
    }

    if (profile.foundingPartnerGrantedAt) {
      if (throwOnConflict) {
        throw new ForbiddenException(
          'This enterprise already has the Founding Partner badge',
        );
      }
      return;
    }

    const currentCount = await tx.enterpriseProfile.count({
      where: { foundingPartnerGrantedAt: { not: null } },
    });

    if (currentCount >= FOUNDING_PARTNER_CONFIG.limit) {
      if (throwOnConflict) {
        throw new ForbiddenException(
          `Founding Partner limit reached (${currentCount}/${FOUNDING_PARTNER_CONFIG.limit})`,
        );
      }
      this.logger.warn(
        `Founding Partner limit reached (${currentCount}/${FOUNDING_PARTNER_CONFIG.limit}). Cannot grant to ${enterpriseId}.`,
      );
      return;
    }

    await tx.enterpriseProfile.update({
      where: { id: enterpriseId },
      data: { foundingPartnerGrantedAt: new Date() },
    });

    this.logger.log(
      `Founding Partner badge granted to enterprise ${enterpriseId} (slot ${currentCount + 1}/${FOUNDING_PARTNER_CONFIG.limit})`,
    );
  }

  async grantFoundingPartnerIfEligible(enterpriseId: string): Promise<void> {
    if (!FOUNDING_PARTNER_CONFIG.enabled) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      await this.executeGrantInTransaction(tx, enterpriseId, false);
    });
  }

  async grantFoundingPartner(enterpriseId: string): Promise<void> {
    if (!FOUNDING_PARTNER_CONFIG.enabled) {
      throw new ForbiddenException('Founding Partner program is disabled');
    }

    await this.prisma.$transaction(async (tx) => {
      await this.executeGrantInTransaction(tx, enterpriseId, true);
    });
  }

  async revokeFoundingPartner(enterpriseId: string): Promise<void> {
    const profile = await this.prisma.enterpriseProfile.findUnique({
      where: { id: enterpriseId },
      select: { foundingPartnerGrantedAt: true },
    });

    if (!profile) {
      throw new NotFoundException('Enterprise profile not found');
    }

    if (!profile.foundingPartnerGrantedAt) {
      throw new ForbiddenException(
        'This enterprise does not have the Founding Partner badge',
      );
    }

    await this.prisma.enterpriseProfile.update({
      where: { id: enterpriseId },
      data: { foundingPartnerGrantedAt: null },
    });

    this.logger.log(
      `[ADMIN] Founding Partner badge revoked from enterprise ${enterpriseId}`,
    );
  }

  async getFoundingPartnerCount(): Promise<{ count: number; limit: number }> {
    const count = await this.prisma.enterpriseProfile.count({
      where: { foundingPartnerGrantedAt: { not: null } },
    });

    return { count, limit: FOUNDING_PARTNER_CONFIG.limit };
  }
}
