import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EnterpriseBaseService } from './enterprise-base.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/dto/create-notification.dto';
import type { CreateEnterpriseNewsDto } from './dto/create-enterprise-news.dto';
import type { UpdateEnterpriseNewsDto } from './dto/update-enterprise-news.dto';

@Injectable()
export class EnterpriseNewsService extends EnterpriseBaseService {
  constructor(
    prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {
    super(prisma);
  }

  async create(
    enterpriseId: string,
    userId: string,
    dto: CreateEnterpriseNewsDto,
  ) {
    await this.verifyOwnership(enterpriseId, userId, 'manage news');

    const type = dto.type || 'link';

    // Validate: LINK type requires a URL
    if (type === 'link' && !dto.url) {
      throw new BadRequestException('URL is required for link-type news');
    }

    const news = await this.prisma.enterpriseNews.create({
      data: {
        enterpriseId,
        type,
        title: dto.title,
        url: dto.url ?? '',
        description: dto.description ?? null,
        thumbnailUrl: dto.thumbnailUrl ?? null,
      },
    });

    // Fetch enterprise profile info for the notification
    const enterprise = await this.prisma.enterpriseProfile.findUnique({
      where: { id: enterpriseId },
      select: {
        companyName: true,
        slug: true,
      },
    });

    if (enterprise) {
      // Fetch all followers of this enterprise
      const followers = await this.prisma.enterpriseFollow.findMany({
        where: { enterpriseId },
        select: { followerId: true },
      });

      // Create a notification for each follower
      const notificationPromises = followers.map((follower) =>
        this.notificationsService.createNotification({
          userId: follower.followerId,
          type: NotificationType.ENTERPRISE_NEWS,
          title: enterprise.companyName,
          message: dto.title,
          data: {
            enterpriseId,
            enterpriseSlug: enterprise.slug,
            newsId: news.id,
            newsType: type,
            newsTitle: dto.title,
            newsUrl: dto.url ?? '',
            companyName: enterprise.companyName,
          },
        }),
      );

      await Promise.all(notificationPromises);
    }

    return news;
  }

  async findAll(enterpriseId: string) {
    return this.prisma.enterpriseNews.findMany({
      where: { enterpriseId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(
    enterpriseId: string,
    newsId: string,
    userId: string,
    dto: UpdateEnterpriseNewsDto,
  ) {
    await this.verifyOwnership(enterpriseId, userId, 'manage news');

    const news = await this.prisma.enterpriseNews.findUnique({
      where: { id: newsId },
    });

    if (!news || news.enterpriseId !== enterpriseId) {
      throw new NotFoundException('News not found');
    }

    // Validate: if type is being changed to LINK, URL is required
    const targetType = dto.type ?? news.type;
    const targetUrl = dto.url ?? news.url;
    if (targetType === 'link' && !targetUrl) {
      throw new BadRequestException('URL is required for link-type news');
    }

    return this.prisma.enterpriseNews.update({
      where: { id: newsId },
      data: dto,
    });
  }

  async remove(enterpriseId: string, newsId: string, userId: string) {
    await this.verifyOwnership(enterpriseId, userId, 'manage news');

    const news = await this.prisma.enterpriseNews.findUnique({
      where: { id: newsId },
    });

    if (!news || news.enterpriseId !== enterpriseId) {
      throw new NotFoundException('News not found');
    }

    return this.prisma.enterpriseNews.delete({
      where: { id: newsId },
    });
  }
}
