import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileViewsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Track a profile view by a user.
   * Uses upsert so viewing the same profile again just updates the timestamp.
   */
  async trackView(userId: string, instructorProfileId: string) {
    return this.prisma.profileView.upsert({
      where: {
        userId_instructorProfileId: {
          userId,
          instructorProfileId,
        },
      },
      update: {
        viewedAt: new Date(),
      },
      create: {
        userId,
        instructorProfileId,
      },
    });
  }

  /**
   * Get recently viewed instructor profiles for a user.
   * Returns up to 10 most recently viewed profiles.
   */
  async getRecentViews(userId: string, limit: number = 10) {
    const views = await this.prisma.profileView.findMany({
      where: { userId },
      orderBy: { viewedAt: 'desc' },
      take: limit,
      include: {
        instructorProfile: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return views.map((view) => ({
      id: view.instructorProfile.id,
      userId: view.instructorProfile.userId,
      username: view.instructorProfile.user.username,
      firstName: view.instructorProfile.user.firstName,
      lastName: view.instructorProfile.user.lastName,
      avatarUrl: view.instructorProfile.user.avatarUrl,
      photoUrl: view.instructorProfile.photoUrl,
      tagline: view.instructorProfile.tagline,
      city: view.instructorProfile.city,
      specializations: view.instructorProfile.specializations,
      viewedAt: view.viewedAt,
    }));
  }
}
