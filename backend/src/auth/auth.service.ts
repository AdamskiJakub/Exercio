import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { RegisterDto, LoginDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
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
          isEmailVerified: false, // New users are not verified
        },
      });

      // Send verification code instead of returning token
      await this.sendVerificationCode(dto.email, 'en'); // Default to English, frontend will handle language

      return {
        message: 'Registration successful. Please check your email for verification code.',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          emailVerified: user.isEmailVerified,
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
          isEmailVerified: false, // New users are not verified
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

      // Send verification code instead of returning token
      await this.sendVerificationCode(dto.email, 'en');

      return {
        message: 'Registration successful. Please check your email for verification code.',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          emailVerified: user.isEmailVerified,
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

    // Prevent OAuth users from logging in with password
    // Users with provider other than 'local' must use OAuth
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
        // Prevent provider flipping - enforce single provider per account
        if (user.provider && user.provider !== 'local' && user.provider !== oauthUser.provider) {
          throw new UnauthorizedException(
            `This email is already registered with ${user.provider}. Please use ${user.provider} to login.`,
          );
        }

        // For local accounts: just update profile data, keep provider='local'
        // For OAuth accounts: this shouldn't happen (caught by compound unique above)
        // This allows users with local accounts to also login via OAuth
        if (user.provider === 'local') {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: {
              // DO NOT change provider - keep 'local'
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
        } else {
          throw error;
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

  // ============================================
  // EMAIL VERIFICATION & PASSWORD RESET METHODS
  // ============================================

  /**
   * Generate a 6-digit verification code
   */
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send verification code after registration
   */
  async sendVerificationCode(email: string, language: 'pl' | 'en' = 'pl') {
    const code = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing unused codes for this email
    await this.prisma.verificationCode.deleteMany({
      where: {
        email,
        type: 'email_verification',
        used: false,
      },
    });

    // Create new verification code
    await this.prisma.verificationCode.create({
      data: {
        email,
        code,
        type: 'email_verification',
        expiresAt,
      },
    });

    // Send email
    await this.emailService.sendVerificationCode(email, code, language);

    return { message: 'Verification code sent successfully' };
  }

  /**
   * Verify email with 6-digit code
   */
  async verifyEmail(email: string, code: string) {
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
      throw new BadRequestException('Invalid or expired verification code');
    }

    // Mark code as used
    await this.prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: { used: true },
    });

    // Update user's email verification status
    const user = await this.prisma.user.update({
      where: { email },
      data: { isEmailVerified: true },
    });

    // Generate token for auto-login
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

  /**
   * Request password reset - send 6-digit code
   */
  async requestPasswordReset(email: string, language: 'pl' | 'en' = 'pl') {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal if user exists or not (security)
    if (!user) {
      return { message: 'If an account with that email exists, a password reset code has been sent' };
    }

    // OAuth users can't reset password
    if (user.provider !== 'local') {
      throw new BadRequestException('Password reset is not available for OAuth accounts');
    }

    const code = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing unused codes for this email
    await this.prisma.verificationCode.deleteMany({
      where: {
        email,
        type: 'password_reset',
        used: false,
      },
    });

    // Create new reset code
    await this.prisma.verificationCode.create({
      data: {
        email,
        code,
        type: 'password_reset',
        expiresAt,
      },
    });

    // Send email
    await this.emailService.sendPasswordResetCode(email, code, language);

    return { message: 'If an account with that email exists, a password reset code has been sent' };
  }

  /**
   * Reset password with 6-digit code
   * Email is extracted from the code - no need to pass it separately
   */
  async resetPassword(code: string, newPassword: string) {
    // Find the verification code - email is stored in the code record
    const verificationCode = await this.prisma.verificationCode.findFirst({
      where: {
        code,
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

    // Extract email from the verification code
    const email = verificationCode.email;

    // Mark code as used
    await this.prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: { used: true },
    });

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    const user = await this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Generate token for auto-login
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
}
