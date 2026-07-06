import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { EnterpriseInvitationsService } from './enterprise-invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../types/express';

@Controller('enterprise')
export class EnterpriseInvitationsController {
  constructor(private invitationsService: EnterpriseInvitationsService) {}

  @Post(':id/invitations')
  @UseGuards(JwtAuthGuard)
  async createInvitation(
    @Param('id') id: string,
    @Body() dto: CreateInvitationDto,
    @Req() req: Request,
  ) {
    const user = req.user as AuthenticatedUser;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.invitationsService.create(id, user.id, dto);
  }

  @Get(':id/instructors')
  async getInstructors(@Param('id') id: string) {
    return this.invitationsService.getInstructors(id);
  }

  @Get(':id/search-instructors')
  @UseGuards(JwtAuthGuard)
  async searchInstructors(
    @Param('id') id: string,
    @Query('q') q: string,
    @Req() req: Request,
    @Query('city') city?: string,
  ) {
    const user = req.user as AuthenticatedUser;

    return this.invitationsService.searchInstructors(id, q, city);
  }

  @Delete(':id/instructors/:instructorId')
  @UseGuards(JwtAuthGuard)
  async removeInstructor(
    @Param('id') id: string,
    @Param('instructorId') instructorId: string,
    @Req() req: Request,
  ) {
    const user = req.user as AuthenticatedUser;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.invitationsService.remove(id, user.id, instructorId);
  }
}

@Controller('me')
export class MyEnterpriseInvitationsController {
  constructor(private invitationsService: EnterpriseInvitationsService) {}

  @Get('enterprise-invitations')
  @UseGuards(JwtAuthGuard)
  async getMyInvitations(@Req() req: Request) {
    const user = req.user as AuthenticatedUser;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.invitationsService.findMyInvitations(user.id);
  }

  @Patch('enterprise-invitations/:id/accept')
  @UseGuards(JwtAuthGuard)
  async accept(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.invitationsService.accept(id, user.id);
  }

  @Patch('enterprise-invitations/:id/reject')
  @UseGuards(JwtAuthGuard)
  async reject(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.invitationsService.reject(id, user.id);
  }
}
