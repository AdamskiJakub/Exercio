import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import type { CreateEnterpriseLeadDto } from './dto/create-enterprise-lead.dto';
import type { Language } from '../email/email.types';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '../auth/constants';
import { slugifyToAscii } from '../common/slug-utils';

@Injectable()
export class EnterpriseLeadsService {
  private readonly logger = new Logger(EnterpriseLeadsService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async create(dto: CreateEnterpriseLeadDto) {
    // Check if a lead with this email already exists and is not rejected
    const existingLead = await this.prisma.enterpriseLead.findFirst({
      where: {
        email: dto.email,
        status: { not: 'rejected' },
      },
    });

    if (existingLead) {
      throw new BadRequestException(
        'A lead with this email already exists and is being processed',
      );
    }

    const lead = await this.prisma.enterpriseLead.create({
      data: {
        companyName: dto.companyName,
        city: dto.city,
        email: dto.email,
        phone: dto.phone,
        website: dto.website,
        message: dto.message,
        businessType: dto.businessType,
        instructorCount: dto.instructorCount,
      },
    });

    this.logger.log(
      `New enterprise lead created: ${lead.id} (${dto.companyName})`,
    );

    // Send email notification to admin
    try {
      const adminEmail = this.configService.get<string>(
        'ADMIN_EMAIL',
        'burguntowy@gmail.com',
      );
      const defaultLocale = this.configService.get<string>(
        'DEFAULT_LOCALE',
        'pl',
      ) as Language;
      await this.emailService.sendEnterpriseLeadNotification(
        adminEmail,
        defaultLocale,
        {
          id: lead.id,
          companyName: dto.companyName,
          email: dto.email,
          phone: dto.phone,
          website: dto.website,
          city: dto.city,
          message: dto.message,
        },
      );
      this.logger.log(
        `Admin notification sent for lead ${lead.id} (${dto.companyName})`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send admin notification for lead ${lead.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    return lead;
  }

  async findAll(status?: string) {
    const where = status ? { status } : {};
    return this.prisma.enterpriseLead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async approve(leadId: string) {
    const lead = await this.prisma.enterpriseLead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new NotFoundException('Enterprise lead not found');
    }

    if (lead.status !== 'new' && lead.status !== 'contacted') {
      throw new BadRequestException(
        `Cannot approve lead with status "${lead.status}"`,
      );
    }

    // Check if a user with this email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: lead.email },
    });

    if (existingUser) {
      throw new BadRequestException(
        `A user with email "${lead.email}" already exists. The partner may already have an account.`,
      );
    }

    // Generate a slug from company name with counter-based deduplication
    const baseSlug = slugifyToAscii(lead.companyName);
    let slug = baseSlug;
    let slugCounter = 1;
    while (
      await this.prisma.enterpriseProfile.findUnique({ where: { slug } })
    ) {
      slug = `${baseSlug}-${slugCounter}`;
      slugCounter++;
    }

    // Generate a username from company name with counter-based deduplication
    const baseUsername = slugifyToAscii(lead.companyName)
      .replace(/-/g, '_')
      .substring(0, 20);
    let username = baseUsername;
    let usernameCounter = 1;
    while (await this.prisma.user.findUnique({ where: { username } })) {
      username = `${baseUsername}_${usernameCounter}`;
      usernameCounter++;
    }

    // Generate activation token (48h expiry)
    const activationToken = crypto.randomBytes(32).toString('hex');
    const activationExpires = new Date(Date.now() + 48 * 60 * 60 * 1000);

    // Create User + EnterpriseProfile in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create the user (password = NULL, will be set during activation)
      const user = await tx.user.create({
        data: {
          email: lead.email,
          username,
          role: 'ENTERPRISE',
          firstName: lead.companyName,
          password: null,
          isEmailVerified: false,
          activationToken,
          activationExpires,
        },
      });

      // Create the enterprise profile
      const profile = await tx.enterpriseProfile.create({
        data: {
          userId: user.id,
          companyName: lead.companyName,
          slug,
          email: lead.email,
          phone: lead.phone,
          website: lead.website,
          city: lead.city,
          status: 'ACTIVE',
        },
      });

      // Update lead status
      await tx.enterpriseLead.update({
        where: { id: leadId },
        data: { status: 'approved' },
      });

      return { user, profile };
    });

    this.logger.log(
      `Enterprise lead ${leadId} approved. User created: ${result.user.id}`,
    );

    // Send activation email to the partner with activation link
    try {
      const frontendUrl = this.configService.get<string>(
        'FRONTEND_URL',
        'http://localhost:3000',
      );
      const activationUrl = `${frontendUrl}/activate?token=${activationToken}`;
      const approveLocale = this.configService.get<string>(
        'DEFAULT_LOCALE',
        'pl',
      ) as Language;
      await this.emailService.sendEnterpriseAccountActivation(
        lead.email,
        approveLocale,
        activationUrl,
      );
      this.logger.log(
        `Activation email sent to ${lead.email} for lead ${leadId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send activation email to ${lead.email}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    return result;
  }

  async activateAccount(token: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { activationToken: token },
    });

    if (!user) {
      throw new NotFoundException('Invalid activation token');
    }

    if (user.activationExpires && user.activationExpires < new Date()) {
      throw new BadRequestException('Activation token has expired');
    }

    if (user.password) {
      throw new BadRequestException('Account is already activated');
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        isEmailVerified: true,
        activationToken: null,
        activationExpires: null,
      },
    });

    this.logger.log(`Enterprise account activated for user ${user.id}`);

    return { message: 'Account activated successfully. You can now log in.' };
  }

  async reject(leadId: string) {
    const lead = await this.prisma.enterpriseLead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new NotFoundException('Enterprise lead not found');
    }

    return this.prisma.enterpriseLead.update({
      where: { id: leadId },
      data: { status: 'rejected' },
    });
  }
}
