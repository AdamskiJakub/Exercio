import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { CreateManualBlockDto } from './dto/create-manual-block.dto';
import { GetAvailableSlotsDto } from './dto/get-available-slots.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  /**
   * GET /bookings/available-slots
   * Get available time slots for an instructor
   */
  @Get('available-slots')
  async getAvailableSlots(@Query() query: GetAvailableSlotsDto) {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    // Validate end date is after start date
    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Validate date range (max 30 days)
    const daysDiff =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 30) {
      throw new BadRequestException('Date range cannot exceed 30 days');
    }

    return this.bookingsService.getAvailableSlots(
      query.instructorId,
      startDate,
      endDate,
    );
  }

  /**
   * POST /bookings
   * Create a new booking (client only)
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async createBooking(@Request() req, @Body() dto: CreateBookingDto) {
    // Enforce CLIENT role only
    if (req.user.role !== 'CLIENT') {
      throw new ForbiddenException('Only clients can create bookings');
    }
    return this.bookingsService.createBooking(req.user.id, dto);
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
  async confirmBooking(@Request() req, @Param('id') id: string) {
    return this.bookingsService.confirmBooking(id, req.user.id);
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
    return this.bookingsService.cancelBooking(id, req.user.id, dto);
  }

  /**
   * POST /bookings/manual-block
   * Create a manual time block (instructor only)
   */
  @UseGuards(JwtAuthGuard)
  @Post('manual-block')
  async createManualBlock(
    @Request() req,
    @Body() body: CreateManualBlockDto,
  ) {
    return this.bookingsService.createManualBlock(
      req.user.id,
      body.instructorId,
      new Date(body.startTime),
      new Date(body.endTime),
      body.notes,
    );
  }
}
