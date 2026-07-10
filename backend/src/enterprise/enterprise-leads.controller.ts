import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  Headers,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnterpriseLeadsService } from './enterprise-leads.service';
import { CreateEnterpriseLeadDto } from './dto/create-enterprise-lead.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../types/express';

@Controller('enterprise')
export class EnterpriseLeadsController {
  constructor(
    private leadsService: EnterpriseLeadsService,
    private configService: ConfigService,
  ) {}

  @Post('apply')
  async apply(@Body() dto: CreateEnterpriseLeadDto) {
    return this.leadsService.create(dto);
  }

  @Post('activate')
  async activate(
    @Body('token') token: string,
    @Body('password') password: string,
  ) {
    if (!token || !password) {
      throw new BadRequestException('Token and password are required');
    }
    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }
    return this.leadsService.activateAccount(token, password);
  }

  @Get('leads')
  @UseGuards(JwtAuthGuard)
  async findAll(@Query('status') status?: string, @Req() req?: Request) {
    const user = req!.user as AuthenticatedUser;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can view enterprise leads');
    }

    return this.leadsService.findAll(status);
  }

  /**
   * Approve a lead via JWT auth (admin dashboard).
   */
  @Patch('leads/:id/approve')
  @UseGuards(JwtAuthGuard)
  async approve(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;

    if (!user) {
      throw new UnauthorizedException('Not authenticated');
    }

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can approve enterprise leads');
    }

    return this.leadsService.approve(id);
  }

  /**
   * Approve a lead via CLI (APPROVE_SECRET in Authorization header).
   * Separate endpoint to avoid auth confusion.
   */
  @Patch('leads/:id/approve-cli')
  async approveCli(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string,
  ) {
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    const token = authHeader.slice(7);
    const approveSecret = this.configService.get<string>('APPROVE_SECRET');

    if (!approveSecret || token !== approveSecret) {
      throw new ForbiddenException('Invalid approve secret');
    }

    return this.leadsService.approve(id);
  }

  @Patch('leads/:id/reject')
  @UseGuards(JwtAuthGuard)
  async reject(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can reject enterprise leads');
    }

    return this.leadsService.reject(id);
  }
}
