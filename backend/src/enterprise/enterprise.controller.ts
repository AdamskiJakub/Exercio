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
  ForbiddenException,
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

  // ─── Founding Partner Endpoints ────────────────────────────────────

  /**
   * Public: Get current Founding Partner count (for frontend counter).
   */
  @Get('founding-partners/count')
  async getFoundingPartnerCount() {
    return this.enterpriseService.getFoundingPartnerCount();
  }

  /**
   * Admin: Force-grant Founding Partner badge (emergency use).
   */
  @Post(':id/grant-founding-partner')
  @UseGuards(JwtAuthGuard)
  async grantFoundingPartner(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;

    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Only admins can grant Founding Partner badges',
      );
    }

    await this.enterpriseService.grantFoundingPartner(id);
    return { message: 'Founding Partner badge granted' };
  }

  /**
   * Admin: Revoke Founding Partner badge (emergency use).
   */
  @Delete(':id/founding-partner')
  @UseGuards(JwtAuthGuard)
  async revokeFoundingPartner(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;

    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Only admins can revoke Founding Partner badges',
      );
    }

    await this.enterpriseService.revokeFoundingPartner(id);
    return { message: 'Founding Partner badge revoked' };
  }
}
