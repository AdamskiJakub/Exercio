import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/dto/create-notification.dto';
import type { CreateInvitationDto } from './dto/create-invitation.dto';

@Injectable()
export class EnterpriseInvitationsService {
  private readonly logger = new Logger(EnterpriseInvitationsService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(enterpriseId: string, userId: string, dto: CreateInvitationDto) {
    // Verify ownership
    const enterprise = await this.prisma.enterpriseProfile.findUnique({
      where: { id: enterpriseId },
    });

    if (!enterprise) {
      throw new NotFoundException('Enterprise profile not found');
    }

    if (enterprise.userId !== userId) {
      throw new ForbiddenException('You do not own this enterprise profile');
    }

    // Verify instructor exists
    const instructor = await this.prisma.instructorProfile.findUnique({
      where: { id: dto.instructorId },
      include: { user: true },
    });

    if (!instructor) {
      throw new NotFoundException('Instructor profile not found');
    }

    // Check if invitation already exists
    const existing = await this.prisma.enterpriseInstructor.findUnique({
      where: {
        enterpriseId_instructorId: {
          enterpriseId,
          instructorId: dto.instructorId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Invitation already exists with status "${existing.status}"`,
      );
    }

    // Create invitation
    const invitation = await this.prisma.enterpriseInstructor.create({
      data: {
        enterpriseId,
        instructorId: dto.instructorId,
        role: dto.role,
      },
      include: {
        enterprise: {
          select: { companyName: true },
        },
      },
    });

    // Send notification to instructor
    await this.notificationsService.createNotification({
      userId: instructor.userId,
      type: NotificationType.ENTERPRISE_INVITATION,
      title: `Invitation from ${invitation.enterprise.companyName}`,
      message: `You have been invited to join ${invitation.enterprise.companyName} as a partner instructor.`,
      data: {
        enterpriseId,
        invitationId: invitation.id,
      },
    });

    this.logger.log(
      `Invitation created: ${invitation.id} (${enterprise.companyName} → ${instructor.user.email})`,
    );

    return invitation;
  }

  async findMyInvitations(userId: string) {
    const instructor = await this.prisma.instructorProfile.findUnique({
      where: { userId },
    });

    if (!instructor) {
      throw new NotFoundException('Instructor profile not found');
    }

    return this.prisma.enterpriseInstructor.findMany({
      where: {
        instructorId: instructor.id,
        status: 'PENDING',
      },
      include: {
        enterprise: {
          select: {
            id: true,
            companyName: true,
            slug: true,
            logoUrl: true,
            city: true,
            category: true,
          },
        },
      },
      orderBy: { invitedAt: 'desc' },
    });
  }

  async accept(invitationId: string, userId: string) {
    const instructor = await this.prisma.instructorProfile.findUnique({
      where: { userId },
    });

    if (!instructor) {
      throw new NotFoundException('Instructor profile not found');
    }

    const invitation = await this.prisma.enterpriseInstructor.findUnique({
      where: { id: invitationId },
      include: {
        enterprise: {
          select: { companyName: true, userId: true },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.instructorId !== instructor.id) {
      throw new ForbiddenException('This invitation is not for you');
    }

    if (invitation.status !== 'PENDING') {
      throw new BadRequestException(
        `Cannot accept invitation with status "${invitation.status}"`,
      );
    }

    const updated = await this.prisma.enterpriseInstructor.update({
      where: { id: invitationId },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
    });

    // Notify enterprise owner
    await this.notificationsService.createNotification({
      userId: invitation.enterprise.userId,
      type: NotificationType.ENTERPRISE_INVITATION_ACCEPTED,
      title: 'Invitation accepted',
      message: `An instructor has accepted your invitation to join ${invitation.enterprise.companyName}.`,
      data: {
        invitationId,
        enterpriseId: invitation.enterpriseId,
      },
    });

    return updated;
  }

  async reject(invitationId: string, userId: string) {
    const instructor = await this.prisma.instructorProfile.findUnique({
      where: { userId },
    });

    if (!instructor) {
      throw new NotFoundException('Instructor profile not found');
    }

    const invitation = await this.prisma.enterpriseInstructor.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.instructorId !== instructor.id) {
      throw new ForbiddenException('This invitation is not for you');
    }

    if (invitation.status !== 'PENDING') {
      throw new BadRequestException(
        `Cannot reject invitation with status "${invitation.status}"`,
      );
    }

    return this.prisma.enterpriseInstructor.update({
      where: { id: invitationId },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
      },
    });
  }

  async remove(enterpriseId: string, userId: string, instructorId: string) {
    const enterprise = await this.prisma.enterpriseProfile.findUnique({
      where: { id: enterpriseId },
    });

    if (!enterprise) {
      throw new NotFoundException('Enterprise profile not found');
    }

    if (enterprise.userId !== userId) {
      throw new ForbiddenException('You do not own this enterprise profile');
    }

    const invitation = await this.prisma.enterpriseInstructor.findUnique({
      where: {
        enterpriseId_instructorId: {
          enterpriseId,
          instructorId,
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Instructor not found in enterprise');
    }

    return this.prisma.enterpriseInstructor.update({
      where: { id: invitation.id },
      data: {
        status: 'REMOVED',
        removedAt: new Date(),
      },
    });
  }

  async getInstructors(enterpriseId: string) {
    return this.prisma.enterpriseInstructor.findMany({
      where: {
        enterpriseId,
        status: 'ACCEPTED',
      },
      include: {
        instructor: {
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
    });
  }

  async searchInstructors(enterpriseId: string, query: string, city?: string) {
    // Find instructors not already invited/accepted in this enterprise
    const existingIds = (
      await this.prisma.enterpriseInstructor.findMany({
        where: { enterpriseId },
        select: { instructorId: true },
      })
    ).map((e) => e.instructorId);

    const where: Prisma.InstructorProfileWhereInput = {
      id: { notIn: existingIds },
      isDraft: false,
    };

    if (query) {
      where.OR = [
        {
          user: {
            OR: [
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
              { username: { contains: query, mode: 'insensitive' } },
            ],
          },
        },
        { tags: { has: query } },
        { specializations: { has: query } },
      ];
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    return this.prisma.instructorProfile.findMany({
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
      take: 20,
    });
  }
}
