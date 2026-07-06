import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateEnterpriseLeadDto } from './dto/create-enterprise-lead.dto';

@Injectable()
export class EnterpriseLeadsService {
  private readonly logger = new Logger(EnterpriseLeadsService.name);

  constructor(private prisma: PrismaService) {}

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
      },
    });

    this.logger.log(
      `New enterprise lead created: ${lead.id} (${dto.companyName})`,
    );

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

    // Generate a slug from company name with timestamp suffix to avoid collisions
    const slug =
      lead.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') +
      '-' +
      Date.now().toString(36);

    // Generate a username from company name with timestamp suffix to avoid collisions
    const username =
      lead.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '')
        .substring(0, 20) +
      '_' +
      Date.now().toString(36).substring(0, 6);

    // Create User + EnterpriseProfile in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create the user
      const user = await tx.user.create({
        data: {
          email: lead.email,
          username,
          role: 'ENTERPRISE',
          firstName: lead.companyName,
          isEmailVerified: false,
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

    return result;
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
