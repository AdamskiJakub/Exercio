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
    // Check if the viewer is the owner of this profile — skip tracking
    const profile = await this.prisma.instructorProfile.findUnique({
      where: { id: instructorProfileId },
      select: { userId: true },
    });

    if (profile && profile.userId === userId) {
      return;
    }

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
   * Returns up to 10 most recently viewed profiles, excluding the viewer's own profile.
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

    return views
      .filter((view) => view.instructorProfile.userId !== userId)
      .slice(0, limit)
      .map((view) => ({
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
