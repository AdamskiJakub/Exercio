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
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { EnterpriseLeadsService } from './enterprise-leads.service';
import { CreateEnterpriseLeadDto } from './dto/create-enterprise-lead.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../types/express';

@Controller('enterprise')
export class EnterpriseLeadsController {
  constructor(private leadsService: EnterpriseLeadsService) {}

  @Post('apply')
  async apply(@Body() dto: CreateEnterpriseLeadDto) {
    return this.leadsService.create(dto);
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

  @Patch('leads/:id/approve')
  @UseGuards(JwtAuthGuard)
  async approve(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can approve enterprise leads');
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
