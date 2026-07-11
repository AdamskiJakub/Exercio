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
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateManualBookingDto } from './dto/create-manual-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { CreateManualBlockDto } from './dto/create-manual-block.dto';
import { GetAvailableSlotsDto } from './dto/get-available-slots.dto';
import { CancelGuestBookingDto } from './dto/cancel-guest-booking.dto';
import type { Language } from '../email/email.types';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  /**
   * GET /bookings/available-slots
   * Get available time slots for an instructor
   */
  @UseGuards(OptionalJwtAuthGuard)
  @Get('available-slots')
  async getAvailableSlots(
    @Query() query: GetAvailableSlotsDto,
    @Request() req,
  ) {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const daysDiff =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 30) {
      throw new BadRequestException('Date range cannot exceed 30 days');
    }

    const timezoneOffset = query.timezoneOffset ?? 0;

    return this.bookingsService.getAvailableSlots(
      query.instructorId,
      startDate,
      endDate,
      req.user?.id,
      timezoneOffset ?? 0,
    );
  }

  /**
   * POST /bookings
   * Create a new booking (authenticated clients or guest users)
   * Rate limited to 3 bookings per 10 minutes for anonymous users
   */
  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  async createBooking(@Request() req, @Body() dto: CreateBookingDto) {
    // Check if user is authenticated
    const isAuthenticated = req.user && req.user.id;

    if (isAuthenticated) {
      // Authenticated user - must be CLIENT or INSTRUCTOR role
      // Instructors can also book sessions with other instructors
      if (req.user.role !== 'CLIENT' && req.user.role !== 'INSTRUCTOR') {
        throw new ForbiddenException('Only clients can create bookings');
      }
      return this.bookingsService.createBooking(req.user.id, dto);
    } else {
      // Guest booking - require guest contact info
      if (!dto.guestName || !dto.guestEmail || !dto.guestPhone) {
        throw new BadRequestException(
          'Guest bookings require name, email, and phone number',
        );
      }
      return this.bookingsService.createGuestBooking(dto);
    }
  }

  /**
   * GET /bookings/guest-cancel/validate
   * Validate a cancellation token without cancelling (no auth required).
   * Used by the frontend cancel-booking page to check token validity on load.
   */
  @Get('guest-cancel/validate')
  async validateCancellationToken(
    @Query('bookingId') bookingId: string,
    @Query('token') token: string,
    @Query('language') language?: string,
  ) {
    const lang: Language = language === 'en' ? 'en' : 'pl';
    return this.bookingsService.validateCancellationToken(
      bookingId,
      token,
      lang,
    );
  }

  /**
   * POST /bookings/guest-cancel
   * Cancel a booking via cancellation token (no auth required)
   */
  @Post('guest-cancel')
  @Throttle({ default: { limit: 5, ttl: 600000 } }) // 5 requests per 10 min
  async guestCancelBooking(@Body() dto: CancelGuestBookingDto) {
    const language = (dto.language === 'en' ? 'en' : 'pl') as 'pl' | 'en';
    return this.bookingsService.cancelGuestBooking(
      dto.bookingId,
      dto.token,
      dto.cancellationReason,
      language,
    );
  }

  /**
   * GET /bookings/my
   * Get my bookings (as client or instructor)
   */
  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyBookings(@Request() req, @Query('role') role?: string) {
    const userRole = role === 'instructor' ? 'instructor' : 'client';
    return this.bookingsService.getMyBookings(req.user.id, userRole);
  }

  /**
   * GET /bookings/:id
   * Get single booking by ID
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getBooking(@Request() req, @Param('id') id: string) {
    return this.bookingsService.getBookingById(id, req.user.id);
  }

  /**
   * PATCH /bookings/:id/confirm
   * Confirm a pending booking (instructor only)
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/confirm')
  async confirmBooking(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { language?: string },
  ) {
    const language = (body?.language === 'en' ? 'en' : 'pl') as 'pl' | 'en';
    return this.bookingsService.confirmBooking(id, req.user.id, language);
  }

  /**
   * PATCH /bookings/:id/complete
   * Mark booking as completed (instructor only)
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/complete')
  async completeBooking(@Request() req, @Param('id') id: string) {
    return this.bookingsService.completeBooking(id, req.user.id);
  }

  /**
   * PATCH /bookings/:id/cancel
   * Cancel a booking
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  async cancelBooking(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: CancelBookingDto,
  ) {
    const language = (dto.language === 'en' ? 'en' : 'pl') as 'pl' | 'en';
    return this.bookingsService.cancelBooking(id, req.user.id, dto, language);
  }

  /**
   * DELETE /bookings/history
   * Clear completed/cancelled bookings for current client
   */
  @UseGuards(JwtAuthGuard)
  @Delete('history')
  async clearHistory(@Request() req) {
    return this.bookingsService.clearUserHistory(req.user.id);
  }

  /**
   * POST /bookings/manual
   * Create a manual booking as instructor (e.g., phone booking)
   */
  @UseGuards(JwtAuthGuard)
  @Post('manual')
  async createManualBooking(
    @Request() req,
    @Body() dto: CreateManualBookingDto,
  ) {
    return this.bookingsService.createManualBooking(req.user.id, dto);
  }

  /**
   * POST /bookings/manual-block
   * Create a manual time block (instructor only)
   */
  @UseGuards(JwtAuthGuard)
  @Post('manual-block')
  async createManualBlock(@Request() req, @Body() body: CreateManualBlockDto) {
    return this.bookingsService.createManualBlock(
      req.user.id,
      body.instructorId,
      new Date(body.startTime),
      new Date(body.endTime),
      body.notes,
    );
  }

  /**
   * PATCH /bookings/:id/notes
   * Update booking notes (instructor only)
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/notes')
  async updateNotes(
    @Request() req,
    @Param('id') bookingId: string,
    @Body('notes') notes: string,
  ) {
    return this.bookingsService.updateBookingNotes(
      req.user.id,
      bookingId,
      notes,
    );
  }

  /**
   * PATCH /bookings/:id/accept-manual
   * Accept a manual booking (client acknowledges an instructor-created booking)
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/accept-manual')
  async acceptManualBooking(
    @Request() req,
    @Param('id') bookingId: string,
    @Body() body: { language?: string },
  ) {
    const lang: Language = body.language === 'en' ? 'en' : 'pl';
    return this.bookingsService.acceptManualBooking(
      bookingId,
      req.user.id,
      lang,
    );
  }

  /**
   * PATCH /bookings/:id/acknowledge
   * Acknowledge a cancelled booking (instructor only)
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/acknowledge')
  async acknowledgeCancellation(
    @Request() req,
    @Param('id') bookingId: string,
  ) {
    return this.bookingsService.acknowledgeCancellation(req.user.id, bookingId);
  }
}
