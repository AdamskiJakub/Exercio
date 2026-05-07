import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { CreateAvailabilityExceptionDto } from './dto/create-availability-exception.dto';
import { UpdateAvailabilityExceptionDto } from './dto/update-availability-exception.dto';

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  // ==================== HELPER METHODS ====================

  /**
   * Find instructor profile by userId
   */
  async findInstructorProfileByUserId(userId: string) {
    const profile = await this.prisma.instructorProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Instructor profile not found');
    }

    return profile;
  }

  /**
   * Bulk set weekly schedule (create or update)
   */
  async setWeeklySchedule(
    userId: string,
    instructorId: string,
    schedule: Array<{
      dayOfWeek: number;
      isAvailable: boolean;
      startTime: string;
      endTime: string;
    }>,
  ) {
    // Verify ownership
    await this.verifyInstructorOwnership(userId, instructorId);

    // Validate all time ranges for available days
    for (const slot of schedule) {
      if (slot.isAvailable) {
        this.validateTimeRange(slot.startTime, slot.endTime);
      }
    }

    // Delete existing schedule
    await this.prisma.availability.deleteMany({
      where: { instructorId },
    });

    // Create new schedule (only for available days)
    const availableSlots = schedule.filter((s) => s.isAvailable);
    
    if (availableSlots.length === 0) {
      return [];
    }

    await this.prisma.availability.createMany({
      data: availableSlots.map((slot) => ({
        instructorId,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isActive: true,
      })),
    });

    // Return updated schedule
    return this.getWeeklyAvailability(instructorId);
  }

  // ==================== WEEKLY AVAILABILITY ====================

  /**
   * Get weekly availability for an instructor
   */
  async getWeeklyAvailability(instructorId: string) {
    return this.prisma.availability.findMany({
      where: { instructorId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  /**
   * Create weekly availability slot
   */
  async createWeeklyAvailability(
    userId: string,
    instructorId: string,
    dto: CreateAvailabilityDto,
  ) {
    // Verify user owns this instructor profile
    await this.verifyInstructorOwnership(userId, instructorId);

    // Check if availability for this day already exists
    const existing = await this.prisma.availability.findUnique({
      where: {
        instructorId_dayOfWeek: {
          instructorId,
          dayOfWeek: dto.dayOfWeek,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Availability for this day of week already exists. Use update endpoint instead.`,
      );
    }

    // Validate time range
    this.validateTimeRange(dto.startTime, dto.endTime);

    return this.prisma.availability.create({
      data: {
        instructorId,
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
        isActive: dto.isActive ?? true,
      },
    });
  }

  /**
   * Update weekly availability slot
   */
  async updateWeeklyAvailability(
    userId: string,
    availabilityId: string,
    dto: UpdateAvailabilityDto,
  ) {
    const availability = await this.prisma.availability.findUnique({
      where: { id: availabilityId },
    });

    if (!availability) {
      throw new NotFoundException('Availability slot not found');
    }

    await this.verifyInstructorOwnership(userId, availability.instructorId);

    // Validate time range if provided
    if (dto.startTime || dto.endTime) {
      const startTime = dto.startTime || availability.startTime;
      const endTime = dto.endTime || availability.endTime;
      this.validateTimeRange(startTime, endTime);
    }

    return this.prisma.availability.update({
      where: { id: availabilityId },
      data: dto,
    });
  }

  /**
   * Delete weekly availability slot
   */
  async deleteWeeklyAvailability(userId: string, availabilityId: string) {
    const availability = await this.prisma.availability.findUnique({
      where: { id: availabilityId },
    });

    if (!availability) {
      throw new NotFoundException('Availability slot not found');
    }

    await this.verifyInstructorOwnership(userId, availability.instructorId);

    return this.prisma.availability.delete({
      where: { id: availabilityId },
    });
  }

  // ==================== AVAILABILITY EXCEPTIONS ====================

  /**
   * Get availability exceptions for an instructor
   */
  async getAvailabilityExceptions(
    instructorId: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const where: any = { instructorId };

    if (startDate && endDate) {
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    return this.prisma.availabilityException.findMany({
      where,
      orderBy: { date: 'asc' },
    });
  }

  /**
   * Create availability exception
   */
  async createAvailabilityException(
    userId: string,
    instructorId: string,
    dto: CreateAvailabilityExceptionDto,
  ) {
    await this.verifyInstructorOwnership(userId, instructorId);

    const date = new Date(dto.date);

    // Check if exception for this date already exists
    const existing = await this.prisma.availabilityException.findUnique({
      where: {
        instructorId_date: {
          instructorId,
          date,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Exception for this date already exists. Use update endpoint instead.`,
      );
    }

    // Validate time range if available
    if (dto.isAvailable && dto.startTime && dto.endTime) {
      this.validateTimeRange(dto.startTime, dto.endTime);
    }

    return this.prisma.availabilityException.create({
      data: {
        instructorId,
        date,
        isAvailable: dto.isAvailable,
        startTime: dto.startTime,
        endTime: dto.endTime,
        reason: dto.reason,
      },
    });
  }

  /**
   * Update availability exception
   */
  async updateAvailabilityException(
    userId: string,
    exceptionId: string,
    dto: UpdateAvailabilityExceptionDto,
  ) {
    const exception = await this.prisma.availabilityException.findUnique({
      where: { id: exceptionId },
    });

    if (!exception) {
      throw new NotFoundException('Availability exception not found');
    }

    await this.verifyInstructorOwnership(userId, exception.instructorId);

    // Validate time range if provided
    if (dto.startTime || dto.endTime) {
      const startTime = dto.startTime || exception.startTime;
      const endTime = dto.endTime || exception.endTime;
      if (startTime && endTime) {
        this.validateTimeRange(startTime, endTime);
      }
    }

    return this.prisma.availabilityException.update({
      where: { id: exceptionId },
      data: dto,
    });
  }

  /**
   * Delete availability exception
   */
  async deleteAvailabilityException(userId: string, exceptionId: string) {
    const exception = await this.prisma.availabilityException.findUnique({
      where: { id: exceptionId },
    });

    if (!exception) {
      throw new NotFoundException('Availability exception not found');
    }

    await this.verifyInstructorOwnership(userId, exception.instructorId);

    return this.prisma.availabilityException.delete({
      where: { id: exceptionId },
    });
  }

  // ==================== HELPER METHODS ====================

  /**
   * Verify that the user owns the instructor profile
   */
  private async verifyInstructorOwnership(userId: string, instructorId: string) {
    const profile = await this.prisma.instructorProfile.findUnique({
      where: { id: instructorId },
    });

    if (!profile) {
      throw new NotFoundException('Instructor profile not found');
    }

    if (profile.userId !== userId) {
      throw new ForbiddenException('You do not own this instructor profile');
    }

    return profile;
  }

  /**
   * Validate time range (start must be before end)
   */
  private validateTimeRange(startTime: string, endTime: string) {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    if (startMinutes >= endMinutes) {
      throw new BadRequestException('Start time must be before end time');
    }
  }
}
