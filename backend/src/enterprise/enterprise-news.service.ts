import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EnterpriseBaseService } from './enterprise-base.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/dto/create-notification.dto';
import { UploadService } from '../upload/upload.service';
import type { CreateEnterpriseNewsDto } from './dto/create-enterprise-news.dto';
import type { UpdateEnterpriseNewsDto } from './dto/update-enterprise-news.dto';

@Injectable()
export class EnterpriseNewsService extends EnterpriseBaseService {
  // Maximum number of news items a partner can keep. Adding a 4th deletes the oldest.
  private static readonly MAX_NEWS = 3;

  constructor(
    prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly uploadService: UploadService,
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

    // Validate: title is required for notifications
    if (!dto.title?.trim()) {
      throw new BadRequestException('Title is required');
    }

    // Use $transaction to ensure atomicity: news creation + notifications
    // R2 deletions are deferred until AFTER the transaction commits so the DB
    // transaction is not held open during network I/O to R2.
    const excessThumbnails: string[] = [];
    const result = await this.prisma.$transaction(async (tx) => {
      const news = await tx.enterpriseNews.create({
        data: {
          enterpriseId,
          type,
          title: dto.title,
          url: dto.url ?? '',
          description: dto.description ?? null,
          thumbnailUrl: dto.thumbnailUrl ?? null,
        },
      });

      const excess = await tx.enterpriseNews.findMany({
        where: { enterpriseId },
        orderBy: { createdAt: 'desc' },
        select: { id: true, thumbnailUrl: true },
        skip: EnterpriseNewsService.MAX_NEWS,
      });

      if (excess.length > 0) {
        await tx.enterpriseNews.deleteMany({
          where: { id: { in: excess.map((n) => n.id) } },
        });
        // Collect thumbnails to delete from R2 after the transaction commits
        for (const removed of excess) {
          if (removed.thumbnailUrl) {
            excessThumbnails.push(removed.thumbnailUrl);
          }
        }
      }

      // Fetch enterprise profile info for the notification
      const enterprise = await tx.enterpriseProfile.findUnique({
        where: { id: enterpriseId },
        select: {
          companyName: true,
          slug: true,
        },
      });

      if (enterprise) {
        // Fetch all followers of this enterprise
        const followers = await tx.enterpriseFollow.findMany({
          where: { enterpriseId },
          select: { followerId: true },
        });

        if (followers.length > 0) {
          // Create a notification for each follower
          await Promise.all(
            followers.map((follower) =>
              this.notificationsService.createNotification({
                userId: follower.followerId,
                type: NotificationType.ENTERPRISE_NEWS,
                title: enterprise.companyName,
                message: dto.title,
                data: {
                  enterpriseId,
                  enterpriseSlug: enterprise.slug,
                  newsId: news.id,
                  newsType: type as NotificationType,
                  newsTitle: dto.title,
                  newsUrl: dto.url ?? '',
                  companyName: enterprise.companyName,
                },
              }),
            ),
          );
        }
      }

      return news;
    });

    // Delete thumbnails of removed news from R2 AFTER the transaction commits
    // (fire-and-forget; deleteFile swallows errors internally).
    for (const thumbnail of excessThumbnails) {
      void this.uploadService.deleteFile(thumbnail);
    }

    return result;
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

    const updated = await this.prisma.enterpriseNews.update({
      where: { id: newsId },
      data: dto,
    });

    // If the thumbnail was replaced or removed, delete the old one from R2.
    if (news.thumbnailUrl && news.thumbnailUrl !== updated.thumbnailUrl) {
      await this.uploadService.deleteFile(news.thumbnailUrl);
    }

    return updated;
  }

  async remove(enterpriseId: string, newsId: string, userId: string) {
    await this.verifyOwnership(enterpriseId, userId, 'manage news');

    const news = await this.prisma.enterpriseNews.findUnique({
      where: { id: newsId },
    });

    if (!news || news.enterpriseId !== enterpriseId) {
      throw new NotFoundException('News not found');
    }

    const deleted = await this.prisma.enterpriseNews.delete({
      where: { id: newsId },
    });

    // Delete the thumbnail from R2 when the news is removed.
    if (deleted.thumbnailUrl) {
      await this.uploadService.deleteFile(deleted.thumbnailUrl);
    }

    return deleted;
  }
}
