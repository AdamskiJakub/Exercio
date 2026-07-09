import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EnterpriseBaseService } from './enterprise-base.service';
import type { CreateEnterpriseNewsDto } from './dto/create-enterprise-news.dto';
import type { UpdateEnterpriseNewsDto } from './dto/update-enterprise-news.dto';

@Injectable()
export class EnterpriseNewsService extends EnterpriseBaseService {
  constructor(prisma: PrismaService) {
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

    return this.prisma.enterpriseNews.create({
      data: {
        enterpriseId,
        type,
        title: dto.title,
        url: dto.url ?? '',
        description: dto.description ?? null,
        thumbnailUrl: dto.thumbnailUrl ?? null,
      },
    });
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
