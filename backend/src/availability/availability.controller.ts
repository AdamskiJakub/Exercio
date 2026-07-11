import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AvailabilityService } from './availability.service';
import { InstructorProfilesService } from '../instructor-profiles/instructor-profiles.service';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { CreateAvailabilityExceptionDto } from './dto/create-availability-exception.dto';
import { UpdateAvailabilityExceptionDto } from './dto/update-availability-exception.dto';
import { SetWeeklyAvailabilityDto } from './dto/set-weekly-availability.dto';

@Controller('availability')
export class AvailabilityController {
  constructor(
    private readonly availabilityService: AvailabilityService,
    private readonly instructorProfilesService: InstructorProfilesService,
  ) {}

  // ==================== WEEKLY AVAILABILITY ====================

  /**
   * GET /availability/weekly
   * Get weekly availability for logged-in instructor
   */
  @UseGuards(JwtAuthGuard)
  @Get('weekly')
  async getMyWeeklyAvailability(@Request() req) {
    try {
      // Find instructor profile by userId
      const profile =
        await this.instructorProfilesService.findInstructorProfileByUserIdOrThrow(
          req.user.id,
        );
      return this.availabilityService.getWeeklyAvailability(profile.id);
    } catch (error) {
      // If profile not found, return empty array
      if (error instanceof NotFoundException) {
        return [];
      }
      throw error;
    }
  }

  /**
   * GET /availability/weekly/:instructorId
   * Get weekly availability for a specific instructor (public)
   */
  @Get('weekly/:instructorId')
  async getWeeklyAvailability(@Param('instructorId') instructorId: string) {
    return this.availabilityService.getWeeklyAvailability(instructorId);
  }

  /**
   * POST /availability/weekly
   * Bulk create/update weekly availability (instructor only)
   */
  @UseGuards(JwtAuthGuard)
  @Post('weekly')
  async setWeeklyAvailability(
    @Request() req,
    @Body() body: SetWeeklyAvailabilityDto,
  ) {
    // Find instructor profile by userId
    const profile =
      await this.instructorProfilesService.findInstructorProfileByUserIdOrThrow(
        req.user.id,
      );
    return this.availabilityService.setWeeklySchedule(
      req.user.id,
      profile.id,
      body.schedule,
    );
  }

  /**
   * PATCH /availability/weekly/:id
   * Update weekly availability slot (instructor only)
   */
  @UseGuards(JwtAuthGuard)
  @Patch('weekly/:id')
  async updateWeeklyAvailability(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateAvailabilityDto,
  ) {
    return this.availabilityService.updateWeeklyAvailability(
      req.user.id,
      id,
      dto,
    );
  }

  /**
   * DELETE /availability/weekly/:id
   * Delete weekly availability slot (instructor only)
   */
  @UseGuards(JwtAuthGuard)
  @Delete('weekly/:id')
  async deleteWeeklyAvailability(@Request() req, @Param('id') id: string) {
    return this.availabilityService.deleteWeeklyAvailability(req.user.id, id);
  }

  // ==================== AVAILABILITY EXCEPTIONS ====================

  /**
   * GET /availability/exceptions
   * Get availability exceptions for logged-in instructor
   */
  @UseGuards(JwtAuthGuard)
  @Get('exceptions')
  async getMyAvailabilityExceptions(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const profile =
        await this.instructorProfilesService.findInstructorProfileByUserIdOrThrow(
          req.user.id,
        );
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;

      return this.availabilityService.getAvailabilityExceptions(
        profile.id,
        start,
        end,
      );
    } catch (error) {
      // If profile not found, return empty array
      if (error instanceof NotFoundException) {
        return [];
      }
      throw error;
    }
  }

  /**
   * GET /availability/exceptions/:instructorId
   * Get availability exceptions for a specific instructor (public)
   */
  @Get('exceptions/:instructorId')
  async getAvailabilityExceptions(
    @Param('instructorId') instructorId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.availabilityService.getAvailabilityExceptions(
      instructorId,
      start,
      end,
    );
  }

  /**
   * POST /availability/exceptions
   * Create availability exception (instructor only)
   */
  @UseGuards(JwtAuthGuard)
  @Post('exceptions')
  async createAvailabilityException(
    @Request() req,
    @Body() dto: CreateAvailabilityExceptionDto,
  ) {
    const profile =
      await this.instructorProfilesService.findInstructorProfileByUserIdOrThrow(
        req.user.id,
      );
    return this.availabilityService.createAvailabilityException(
      req.user.id,
      profile.id,
      dto,
    );
  }

  /**
   * PATCH /availability/exceptions/:id
   * Update availability exception (instructor only)
   */
  @UseGuards(JwtAuthGuard)
  @Patch('exceptions/:id')
  async updateAvailabilityException(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateAvailabilityExceptionDto,
  ) {
    return this.availabilityService.updateAvailabilityException(
      req.user.id,
      id,
      dto,
    );
  }

  /**
   * DELETE /availability/exceptions/:id
   * Delete availability exception (instructor only)
   */
  @UseGuards(JwtAuthGuard)
  @Delete('exceptions/:id')
  async deleteAvailabilityException(@Request() req, @Param('id') id: string) {
    return this.availabilityService.deleteAvailabilityException(
      req.user.id,
      id,
    );
  }
}
