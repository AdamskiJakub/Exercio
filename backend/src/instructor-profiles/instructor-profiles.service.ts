import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInstructorProfileDto } from './dto/create-instructor-profile.dto';
import { UpdateInstructorProfileDto } from './dto/update-instructor-profile.dto';

interface InstructorFilters {
  city?: string;
  specialization?: string;
  tags?: string[];
  goals?: string[];
  // minRating?: number; // TODO: Implement when reviews/ratings are added
  priceMin?: number;
  priceMax?: number;
}

@Injectable()
export class InstructorProfilesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: InstructorFilters) {
    const where: any = {
      isDraft: false, // Only show published profiles
    };

    if (filters.city) {
      where.city = { 
        contains: filters.city, 
        mode: 'insensitive' 
      };
    }

    if (filters.specialization) {
      where.specializations = { 
        has: filters.specialization 
      };
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = { 
        hasSome: filters.tags 
      };
    }

    if (filters.goals && filters.goals.length > 0) {
      where.goals = { 
        hasSome: filters.goals 
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

    const profiles = await this.prisma.instructorProfile.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return profiles;
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

    // contactMessage is always public if set (shown in contact section)
    return {
      ...profile,
      user: userInfo,
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
        throw new ConflictException('Instructor profile already exists for this user');
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

  async update(profileId: string, userId: string, dto: UpdateInstructorProfileDto) {
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
