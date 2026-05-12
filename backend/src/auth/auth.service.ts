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
          role: 'CLIENT', // Force CLIENT role for public registration
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

    // Validate phone is provided for instructors
    if (!dto.phone) {
      throw new BadRequestException('Phone number is required for instructors');
    }

    try {
      // Create user and instructor profile in a transaction
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          username: dto.username,
          password: hashedPassword,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          role: 'INSTRUCTOR', // Force INSTRUCTOR role
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
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
