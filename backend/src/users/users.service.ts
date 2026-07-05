import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto, UpdatePasswordDto, BecomeInstructorDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async updateUser(userId: string, dto: UpdateUserDto) {
    // Check if email is being changed and if it's already taken
    if (dto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Email already in use');
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
      },
    });

    return user;
  }

  async updatePassword(userId: string, dto: UpdatePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.password) {
      throw new BadRequestException(
        `Cannot change password for OAuth users. You logged in via ${user.provider || 'social login'}.`,
      );
    }

    const passwordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password updated successfully' };
  }

  async becomeInstructor(userId: string, dto: BecomeInstructorDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'CLIENT') {
      throw new BadRequestException(
        'Only users with CLIENT role can become instructors',
      );
    }

    // Check if instructor profile already exists
    const existingProfile = await this.prisma.instructorProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new ConflictException(
        'Instructor profile already exists for this user',
      );
    }

    // Create InstructorProfile and update role in a transaction
    const [updatedUser] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          role: 'INSTRUCTOR',
          phone: dto.phone,
          instructorProfile: {
            create: {
              bio: null,
              specializations: [],
              tags: [],
              goals: [],
              gallery: [],
              languages: [],
              location: null,
              city: null,
              hourlyRate: null,
              photoUrl: null,
              verified: false,
              yearsExperience: null,
            },
          },
        },
        include: {
          instructorProfile: true,
        },
      }),
    ]);

    return {
      message:
        'You are now an instructor! Complete your profile to get started.',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        role: updatedUser.role,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone,
        avatarUrl: updatedUser.avatarUrl,
        isEmailVerified: updatedUser.isEmailVerified,
      },
      instructorProfile: updatedUser.instructorProfile,
    };
  }

  async deleteAccount(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete user (cascade will handle related data)
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'Account deleted successfully' };
  }
}
