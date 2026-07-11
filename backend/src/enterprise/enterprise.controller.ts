import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { EnterpriseService } from './enterprise.service';
import { UpdateEnterpriseProfileDto } from './dto/update-enterprise-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../types/express';

@Controller('enterprise')
export class EnterpriseController {
  constructor(private enterpriseService: EnterpriseService) {}

  /**
   * List all active enterprises (minimal data for sitemap).
   */
  @Get()
  async findAllActive() {
    return this.enterpriseService.findAllActive();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyProfile(@Req() req: Request) {
    const user = req.user as AuthenticatedUser;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.enterpriseService.findByUserId(user.id);
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.enterpriseService.findBySlug(slug);
  }

  @Get(':id/rating')
  async getRating(@Param('id') id: string) {
    return this.enterpriseService.getRating(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEnterpriseProfileDto,
    @Req() req: Request,
  ) {
    const user = req.user as AuthenticatedUser;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.enterpriseService.update(id, user.id, dto);
  }
}
