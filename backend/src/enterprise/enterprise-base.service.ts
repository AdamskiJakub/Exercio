import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Base service for enterprise module.
 * Provides shared ownership verification logic to avoid duplication
 * across EnterpriseService, EnterpriseNewsService, etc.
 */
@Injectable()
export class EnterpriseBaseService {
  constructor(protected prisma: PrismaService) {}

  /**
   * Verify that a user owns an enterprise profile.
   * Throws NotFoundException or ForbiddenException if not.
   */
  async verifyOwnership(
    enterpriseId: string,
    userId: string,
    context?: string,
  ): Promise<{ id: string; userId: string }> {
    const profile = await this.prisma.enterpriseProfile.findUnique({
      where: { id: enterpriseId },
      select: { id: true, userId: true },
    });

    if (!profile) {
      throw new NotFoundException('Enterprise profile not found');
    }

    if (profile.userId !== userId) {
      throw new ForbiddenException(
        context
          ? `You can only ${context} for your own enterprise`
          : 'You do not own this enterprise profile',
      );
    }

    return profile;
  }

  /**
   * Find enterprise profile by user ID or throw.
   * Consolidates duplicate logic from EnterpriseService.
   */
  async findByUserIdOrThrow(userId: string) {
    const profile = await this.prisma.enterpriseProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Enterprise profile not found');
    }

    return profile;
  }
}
