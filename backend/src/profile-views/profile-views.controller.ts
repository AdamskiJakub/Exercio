import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProfileViewsService } from './profile-views.service';

@Controller('profile-views')
export class ProfileViewsController {
  constructor(private readonly profileViewsService: ProfileViewsService) {}

  /**
   * Track that the authenticated user viewed an instructor profile.
   */
  @Post(':instructorProfileId')
  @UseGuards(JwtAuthGuard)
  async trackView(
    @Request() req,
    @Param('instructorProfileId') instructorProfileId: string,
  ) {
    await this.profileViewsService.trackView(req.user.id, instructorProfileId);
    return { success: true };
  }

  /**
   * Get the authenticated user's recently viewed instructor profiles.
   */
  @Get('my-recent')
  @UseGuards(JwtAuthGuard)
  async getMyRecentViews(@Request() req) {
    return this.profileViewsService.getRecentViews(req.user.id);
  }
}
