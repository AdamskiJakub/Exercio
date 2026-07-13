import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/dto/create-notification.dto';

@Injectable()
export class FollowService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // ========================
  // EnterpriseFollow
  // ========================

  async followEnterprise(userId: string, enterpriseId: string) {
    const enterprise = await this.prisma.enterpriseProfile.findUnique({
      where: { id: enterpriseId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, username: true },
        },
      },
    });

    if (!enterprise) {
      throw new NotFoundException('Enterprise profile not found');
    }

    if (enterprise.userId === userId) {
      throw new BadRequestException('Cannot follow your own enterprise');
    }

    const existing = await this.prisma.enterpriseFollow.findUnique({
      where: {
        followerId_enterpriseId: { followerId: userId, enterpriseId },
      },
    });

    if (existing) {
      return existing;
    }

    const follow = await this.prisma.enterpriseFollow.create({
      data: { followerId: userId, enterpriseId },
    });

    // Rate limit: check if a NEW_FOLLOWER notification was sent in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentNotifications = await this.prisma.notification.findMany({
      where: {
        userId: enterprise.userId,
        type: 'NEW_FOLLOWER',
        createdAt: { gte: oneHourAgo },
      },
      select: { data: true },
    });

    const hasRecentNotification = recentNotifications.some((n) => {
      const data = n.data as Record<string, unknown> | null;
      return data?.followerId === userId;
    });

    if (!hasRecentNotification) {
      // Get follower info for notification
      const follower = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true, username: true },
      });

      const displayName =
        follower?.firstName && follower?.lastName
          ? `${follower.firstName} ${follower.lastName}`
          : follower?.username || 'Someone';

      await this.notificationsService.createNotification({
        userId: enterprise.userId,
        type: NotificationType.NEW_FOLLOWER,
        title: 'New Follower',
        message: `${displayName} started following your company`,
        data: {
          enterpriseId,
          enterpriseSlug: enterprise.slug,
          followerId: userId,
          followerName: displayName,
          companyName: enterprise.companyName,
        },
      });
    }

    return follow;
  }

  async unfollowEnterprise(userId: string, enterpriseId: string) {
    try {
      return await this.prisma.enterpriseFollow.delete({
        where: {
          followerId_enterpriseId: { followerId: userId, enterpriseId },
        },
      });
    } catch {
      throw new NotFoundException('Follow relationship not found');
    }
  }

  async getMyFollowedEnterprises(userId: string) {
    const follows = await this.prisma.enterpriseFollow.findMany({
      where: { followerId: userId },
      include: {
        enterprise: {
          select: {
            id: true,
            companyName: true,
            slug: true,
            logoUrl: true,
            city: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return follows.map((f) => ({
      id: f.id,
      enterpriseId: f.enterpriseId,
      companyName: f.enterprise.companyName,
      slug: f.enterprise.slug,
      logoUrl: f.enterprise.logoUrl,
      city: f.enterprise.city,
      category: f.enterprise.category,
      followedAt: f.createdAt,
    }));
  }

  async isFollowingEnterprise(
    userId: string,
    enterpriseId: string,
  ): Promise<boolean> {
    const follow = await this.prisma.enterpriseFollow.findUnique({
      where: {
        followerId_enterpriseId: { followerId: userId, enterpriseId },
      },
    });
    return !!follow;
  }

  async getEnterpriseFollowerCount(enterpriseId: string): Promise<number> {
    return this.prisma.enterpriseFollow.count({
      where: { enterpriseId },
    });
  }

  // ========================
  // InstructorFollow
  // ========================

  async followInstructor(userId: string, instructorProfileId: string) {
    // Look up the enterprise profile for this user
    const enterprise = await this.prisma.enterpriseProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        status: true,
        companyName: true,
        slug: true,
      },
    });

    if (!enterprise) {
      throw new NotFoundException('Enterprise profile not found for this user');
    }

    if (enterprise.status !== 'ACTIVE') {
      throw new ForbiddenException(
        'Enterprise must be active to follow instructors',
      );
    }

    // Verify instructor profile exists
    const instructorProfile = await this.prisma.instructorProfile.findUnique({
      where: { id: instructorProfileId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, username: true },
        },
      },
    });

    if (!instructorProfile) {
      throw new NotFoundException('Instructor profile not found');
    }

    const existing = await this.prisma.instructorFollow.findUnique({
      where: {
        enterpriseId_instructorProfileId: {
          enterpriseId: enterprise.id,
          instructorProfileId,
        },
      },
    });

    if (existing) {
      return existing;
    }

    const follow = await this.prisma.instructorFollow.create({
      data: {
        enterpriseId: enterprise.id,
        instructorProfileId,
      },
    });

    // Rate limit: check if a NEW_FOLLOWER notification was sent in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentNotifications = await this.prisma.notification.findMany({
      where: {
        userId: instructorProfile.userId,
        type: 'NEW_FOLLOWER',
        createdAt: { gte: oneHourAgo },
      },
      select: { data: true },
    });

    const hasRecentNotification = recentNotifications.some((n) => {
      const data = n.data as Record<string, unknown> | null;
      return data?.enterpriseId === enterprise.id;
    });

    if (!hasRecentNotification) {
      // Notify the instructor
      await this.notificationsService.createNotification({
        userId: instructorProfile.userId,
        type: NotificationType.NEW_FOLLOWER,
        title: 'New Follower',
        message: `${enterprise.companyName} started following you`,
        data: {
          instructorProfileId,
          enterpriseId: enterprise.id,
          enterpriseSlug: enterprise.slug,
          companyName: enterprise.companyName,
          followerName: enterprise.companyName,
        },
      });
    }

    return follow;
  }

  async unfollowInstructor(userId: string, instructorProfileId: string) {
    const enterprise = await this.prisma.enterpriseProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!enterprise) {
      throw new NotFoundException('Enterprise profile not found for this user');
    }

    try {
      return await this.prisma.instructorFollow.delete({
        where: {
          enterpriseId_instructorProfileId: {
            enterpriseId: enterprise.id,
            instructorProfileId,
          },
        },
      });
    } catch {
      throw new NotFoundException('Follow relationship not found');
    }
  }

  async getMyFollowedInstructors(userId: string) {
    const enterprise = await this.prisma.enterpriseProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!enterprise) {
      return [];
    }

    const follows = await this.prisma.instructorFollow.findMany({
      where: { enterpriseId: enterprise.id },
      include: {
        instructorProfile: {
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
      orderBy: { createdAt: 'desc' },
    });

    return follows.map((f) => ({
      id: f.id,
      instructorProfileId: f.instructorProfileId,
      user: {
        id: f.instructorProfile.user.id,
        username: f.instructorProfile.user.username,
        firstName: f.instructorProfile.user.firstName,
        lastName: f.instructorProfile.user.lastName,
        role: f.instructorProfile.user.role,
      },
      photoUrl: f.instructorProfile.photoUrl,
      tagline: f.instructorProfile.tagline,
      specializations: f.instructorProfile.specializations,
      city: f.instructorProfile.city,
      verified: f.instructorProfile.verified,
      followedAt: f.createdAt,
    }));
  }

  async isFollowingInstructor(
    userId: string,
    instructorProfileId: string,
  ): Promise<boolean> {
    const enterprise = await this.prisma.enterpriseProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!enterprise) {
      return false;
    }

    const follow = await this.prisma.instructorFollow.findUnique({
      where: {
        enterpriseId_instructorProfileId: {
          enterpriseId: enterprise.id,
          instructorProfileId,
        },
      },
    });
    return !!follow;
  }

  async getInstructorFollowerCount(
    instructorProfileId: string,
  ): Promise<number> {
    return this.prisma.instructorFollow.count({
      where: { instructorProfileId },
    });
  }
}
