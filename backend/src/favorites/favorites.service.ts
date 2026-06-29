import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async addFavorite(userId: string, instructorProfileId: string) {
    // Verify the instructor profile exists
    const profile = await this.prisma.instructorProfile.findUnique({
      where: { id: instructorProfileId },
    });

    if (!profile) {
      throw new NotFoundException('Instructor profile not found');
    }

    // Prevent instructors from favoriting themselves
    if (profile.userId === userId) {
      throw new BadRequestException('Cannot favorite your own profile');
    }

    // Upsert — if already favorited, no-op
    return this.prisma.favorite.upsert({
      where: {
        userId_instructorProfileId: { userId, instructorProfileId },
      },
      create: { userId, instructorProfileId },
      update: {},
    });
  }

  async removeFavorite(userId: string, instructorProfileId: string) {
    try {
      return await this.prisma.favorite.delete({
        where: {
          userId_instructorProfileId: { userId, instructorProfileId },
        },
      });
    } catch {
      throw new NotFoundException('Favorite not found');
    }
  }

  async getMyFavorites(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
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

    return favorites.map((f) => ({
      id: f.instructorProfile.id,
      userId: f.instructorProfile.userId,
      user: f.instructorProfile.user,
      photoUrl: f.instructorProfile.photoUrl,
      tagline: f.instructorProfile.tagline,
      city: f.instructorProfile.city,
      specializations: f.instructorProfile.specializations,
      verified: f.instructorProfile.verified,
      favoritedAt: f.createdAt,
    }));
  }

  async isFavorited(
    userId: string,
    instructorProfileId: string,
  ): Promise<boolean> {
    const fav = await this.prisma.favorite.findUnique({
      where: {
        userId_instructorProfileId: { userId, instructorProfileId },
      },
    });
    return !!fav;
  }

  async getFavoriteCount(instructorProfileId: string): Promise<number> {
    return this.prisma.favorite.count({
      where: { instructorProfileId },
    });
  }
}
