import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          username: dto.username,
          password: hashedPassword,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          role: 'CLIENT',
        },
      });

      const token = await this.generateToken(user.id, user.email, user.role);

      return {
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
        },
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('User with this email already exists');
      }
      throw error;
    }
  }

  async registerInstructor(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    if (!dto.phone) {
      throw new BadRequestException('Phone number is required for instructors');
    }

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          username: dto.username,
          password: hashedPassword,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          role: 'INSTRUCTOR',
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
      });

      const token = await this.generateToken(user.id, user.email, user.role);

      return {
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
        },
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('User with this email or username already exists');
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      throw new UnauthorizedException(
        `This email is registered via ${user.provider}. Please login with ${user.provider}.`,
      );
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.generateToken(user.id, user.email, user.role);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
      },
    };
  }

  async findOrCreateOAuthUser(oauthUser: {
    provider: string;
    providerId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  }) {
    let user = await this.prisma.user.findUnique({
      where: {
        provider_providerId: {
          provider: oauthUser.provider,
          providerId: oauthUser.providerId,
        },
      },
    });

    if (!user) {
      user = await this.prisma.user.findUnique({
        where: { email: oauthUser.email },
      });

      if (user) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            provider: oauthUser.provider,
            providerId: oauthUser.providerId,
            isEmailVerified: true,
            avatarUrl: user.avatarUrl || oauthUser.avatarUrl,
            firstName: user.firstName || oauthUser.firstName,
            lastName: user.lastName || oauthUser.lastName,
          },
        });
      }
    }

    if (!user) {
      const username = await this.generateUniqueUsername(oauthUser.email);
      
      user = await this.prisma.user.create({
        data: {
          email: oauthUser.email,
          username,
          password: null,
          firstName: oauthUser.firstName,
          lastName: oauthUser.lastName,
          provider: oauthUser.provider,
          providerId: oauthUser.providerId,
          isEmailVerified: true,
          avatarUrl: oauthUser.avatarUrl,
          role: 'CLIENT',
        },
      });
    }

    const token = await this.generateToken(user.id, user.email, user.role);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  private async generateUniqueUsername(email: string): Promise<string> {
    const baseUsername = email
      .split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');
    
    let username = baseUsername;
    let counter = 1;

    while (await this.prisma.user.findUnique({ where: { username } })) {
      username = `${baseUsername}-${counter}`;
      counter++;
    }

    return username;
  }

  private async generateToken(userId: string, email: string, role: string) {
    const payload = {
      sub: userId,
      email: email,
      role: role,
    };

    return this.jwtService.sign(payload);
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        provider: true,
        isEmailVerified: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
