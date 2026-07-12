import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { RegisterDto, LoginDto } from './dto';
import { randomInt } from 'crypto';
import * as bcrypt from 'bcrypt';
import { VERIFICATION_CODE_EXPIRY_MS, BCRYPT_SALT_ROUNDS } from './constants';
import type { Language } from '../email/email.types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  private async createUserWithProfile(dto: RegisterDto, language: Language) {
    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const isInstructor = dto.role === 'INSTRUCTOR';

    const data: any = {
      email: dto.email,
      username: dto.username,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      role: isInstructor ? 'INSTRUCTOR' : 'CLIENT',
      isEmailVerified: false,
    };

    // If registering as instructor, also create InstructorProfile
    if (isInstructor) {
      data.instructorProfile = {
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
      };
    }

    try {
      const user = await this.prisma.user.create({
        data,
        include: {
          instructorProfile: isInstructor,
        },
      });

      // Send verification email — swallow errors in dev so registration still works
      try {
        await this.sendVerificationCode(dto.email, language);
      } catch (emailError) {
        console.warn(
          `[AuthService] Failed to send verification email to ${dto.email}:`,
          emailError instanceof Error ? emailError.message : emailError,
        );
      }

      return {
        message:
          language === 'pl'
            ? 'Rejestracja zakończona sukcesem. Sprawdź email, aby zweryfikować konto.'
            : 'Registration successful. Please check your email for verification code.',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          isEmailVerified: user.isEmailVerified,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;

      if (error.code === 'P2002') {
        throw new ConflictException(
          language === 'pl'
            ? 'Użytkownik z tym adresem e-mail lub nazwą użytkownika już istnieje'
            : 'User with this email or username already exists',
        );
      }
      throw error;
    }
  }

  async register(dto: RegisterDto, language: Language = 'pl') {
    return this.createUserWithProfile(dto, language);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.provider !== 'local') {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );
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
        isEmailVerified: user.isEmailVerified,
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
        if (
          user.provider &&
          user.provider !== 'local' &&
          user.provider !== oauthUser.provider
        ) {
          throw new UnauthorizedException(
            `This email is already registered with ${user.provider}. Please use ${user.provider} to login.`,
          );
        }

        if (user.provider === 'local') {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: {
              isEmailVerified: true,
              avatarUrl: user.avatarUrl || oauthUser.avatarUrl,
              firstName: user.firstName || oauthUser.firstName,
              lastName: user.lastName || oauthUser.lastName,
            },
          });
        }
      }
    }

    if (!user) {
      const username = await this.generateUniqueUsername(oauthUser.email);

      try {
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
      } catch (error) {
        if (error.code === 'P2002') {
          const retryUsername = `${username}-${Date.now()}`;
          try {
            user = await this.prisma.user.create({
              data: {
                email: oauthUser.email,
                username: retryUsername,
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
          } catch (retryError) {
            throw new InternalServerErrorException(
              'Unable to create OAuth user. Please try again.',
            );
          }
        } else {
          throw new InternalServerErrorException(
            'An unexpected error occurred during OAuth login.',
          );
        }
      }
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

  private generateVerificationCode(): string {
    return randomInt(0, 1_000_000).toString().padStart(6, '0');
  }

  async sendVerificationCode(email: string, language: Language = 'pl') {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || user.isEmailVerified) {
      return {
        message:
          language === 'pl'
            ? 'Jeśli konto o tym adresie e-mail istnieje, kod weryfikacyjny został wysłany'
            : 'If an account with that email exists, a verification code has been sent',
      };
    }

    const code = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + VERIFICATION_CODE_EXPIRY_MS);

    await this.prisma.$transaction(async (tx) => {
      await tx.verificationCode.deleteMany({
        where: {
          email,
          type: 'email_verification',
          used: false,
        },
      });

      await tx.verificationCode.create({
        data: {
          email,
          code,
          type: 'email_verification',
          expiresAt,
        },
      });
    });

    await this.emailService.sendVerificationCode(email, code, language);

    return { message: 'Verification code sent successfully' };
  }

  async verifyEmail(email: string, code: string, language: Language = 'pl') {
    const verificationCode = await this.prisma.verificationCode.findFirst({
      where: {
        email,
        code,
        type: 'email_verification',
        used: false,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!verificationCode) {
      throw new BadRequestException(
        language === 'pl'
          ? 'Nieprawidłowy lub wygasły kod weryfikacyjny'
          : 'Invalid or expired verification code',
      );
    }

    await this.prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: { used: true },
    });

    const user = await this.prisma.user.update({
      where: { email },
      data: { isEmailVerified: true },
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
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  async requestPasswordReset(email: string, language: Language = 'pl') {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        message:
          language === 'pl'
            ? 'Jeśli konto o tym adresie e-mail istnieje, kod resetujący został wysłany'
            : 'If an account with that email exists, a password reset code has been sent',
      };
    }

    if (user.provider !== 'local') {
      throw new BadRequestException(
        language === 'pl'
          ? 'Reset hasła nie jest dostępny dla kont OAuth'
          : 'Password reset is not available for OAuth accounts',
      );
    }

    const code = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + VERIFICATION_CODE_EXPIRY_MS);

    await this.prisma.$transaction(async (tx) => {
      await tx.verificationCode.deleteMany({
        where: {
          email,
          type: 'password_reset',
          used: false,
        },
      });

      await tx.verificationCode.create({
        data: {
          email,
          code,
          type: 'password_reset',
          expiresAt,
        },
      });
    });

    await this.emailService.sendPasswordResetCode(email, code, language);

    return {
      message:
        language === 'pl'
          ? 'Jeśli konto o tym adresie e-mail istnieje, kod resetujący został wysłany'
          : 'If an account with that email exists, a password reset code has been sent',
    };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const verificationCode = await this.prisma.verificationCode.findFirst({
      where: {
        code,
        email,
        type: 'password_reset',
        used: false,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!verificationCode) {
      throw new BadRequestException('Invalid or expired reset code');
    }

    await this.prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: { used: true },
    });

    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);

    const user = await this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
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
        isEmailVerified: user.isEmailVerified,
      },
    };
  }
}
