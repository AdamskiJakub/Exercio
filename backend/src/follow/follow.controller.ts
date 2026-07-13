import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FollowService } from './follow.service';

@Controller('follow')
@UseGuards(JwtAuthGuard)
export class FollowController {
  constructor(private followService: FollowService) {}

  // ========================
  // EnterpriseFollow
  // ========================

  @Post('enterprise/:enterpriseId')
  async followEnterprise(
    @Request() req,
    @Param('enterpriseId') enterpriseId: string,
  ) {
    return this.followService.followEnterprise(req.user.id, enterpriseId);
  }

  @Delete('enterprise/:enterpriseId')
  async unfollowEnterprise(
    @Request() req,
    @Param('enterpriseId') enterpriseId: string,
  ) {
    return this.followService.unfollowEnterprise(req.user.id, enterpriseId);
  }

  @Get('enterprise/my')
  async getMyFollowedEnterprises(@Request() req) {
    return this.followService.getMyFollowedEnterprises(req.user.id);
  }

  @Get('enterprise/check/:enterpriseId')
  async checkFollowingEnterprise(
    @Request() req,
    @Param('enterpriseId') enterpriseId: string,
  ) {
    const isFollowing = await this.followService.isFollowingEnterprise(
      req.user.id,
      enterpriseId,
    );
    return { isFollowing };
  }

  @Get('enterprise/:enterpriseId/count')
  async getEnterpriseFollowerCount(
    @Param('enterpriseId') enterpriseId: string,
  ) {
    const count =
      await this.followService.getEnterpriseFollowerCount(enterpriseId);
    return { count };
  }

  // ========================
  // InstructorFollow
  // ========================

  @Post('instructor/:instructorProfileId')
  async followInstructor(
    @Request() req,
    @Param('instructorProfileId') instructorProfileId: string,
  ) {
    return this.followService.followInstructor(
      req.user.id,
      instructorProfileId,
    );
  }

  @Delete('instructor/:instructorProfileId')
  async unfollowInstructor(
    @Request() req,
    @Param('instructorProfileId') instructorProfileId: string,
  ) {
    return this.followService.unfollowInstructor(
      req.user.id,
      instructorProfileId,
    );
  }

  @Get('instructor/my')
  async getMyFollowedInstructors(@Request() req) {
    return this.followService.getMyFollowedInstructors(req.user.id);
  }

  @Get('instructor/check/:instructorProfileId')
  async checkFollowingInstructor(
    @Request() req,
    @Param('instructorProfileId') instructorProfileId: string,
  ) {
    const isFollowing = await this.followService.isFollowingInstructor(
      req.user.id,
      instructorProfileId,
    );
    return { isFollowing };
  }

  @Get('instructor/:instructorProfileId/count')
  async getInstructorFollowerCount(
    @Param('instructorProfileId') instructorProfileId: string,
  ) {
    const count =
      await this.followService.getInstructorFollowerCount(instructorProfileId);
    return { count };
  }
}
