import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { EnterpriseNewsService } from './enterprise-news.service';
import { CreateEnterpriseNewsDto } from './dto/create-enterprise-news.dto';
import { UpdateEnterpriseNewsDto } from './dto/update-enterprise-news.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../types/express';

@Controller('enterprise/:enterpriseId/news')
@UseGuards(JwtAuthGuard)
export class EnterpriseNewsController {
  constructor(private enterpriseNewsService: EnterpriseNewsService) {}

  @Post()
  async create(
    @Param('enterpriseId') enterpriseId: string,
    @Body() dto: CreateEnterpriseNewsDto,
    @Req() req: Request,
  ) {
    const user = req.user as AuthenticatedUser;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.enterpriseNewsService.create(enterpriseId, user.id, dto);
  }

  @Get()
  async findAll(@Param('enterpriseId') enterpriseId: string) {
    return this.enterpriseNewsService.findAll(enterpriseId);
  }

  @Patch(':newsId')
  async update(
    @Param('enterpriseId') enterpriseId: string,
    @Param('newsId') newsId: string,
    @Body() dto: UpdateEnterpriseNewsDto,
    @Req() req: Request,
  ) {
    const user = req.user as AuthenticatedUser;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.enterpriseNewsService.update(
      enterpriseId,
      newsId,
      user.id,
      dto,
    );
  }

  @Delete(':newsId')
  async remove(
    @Param('enterpriseId') enterpriseId: string,
    @Param('newsId') newsId: string,
    @Req() req: Request,
  ) {
    const user = req.user as AuthenticatedUser;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.enterpriseNewsService.remove(enterpriseId, newsId, user.id);
  }
}
