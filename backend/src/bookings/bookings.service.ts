import { Injectable } from '@nestjs/common';
import { SlotGenerationService } from './services/slot-generation.service';
import { BookingCreationService } from './services/booking-creation.service';
import { BookingCancellationService } from './services/booking-cancellation.service';
import { BookingQueryService } from './services/booking-query.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateManualBookingDto } from './dto/create-manual-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import type { Language } from '../email/email.types';

/**
 * Facade — delegates all booking operations to dedicated sub-services.
 *
 * This class preserves the original public API so that the controller and
 * any other consumers require zero changes. Each method simply forwards
 * to the corresponding method on the appropriate sub-service.
 */
@Injectable()
export class BookingsService {
  constructor(
    private readonly slotGenerationService: SlotGenerationService,
    private readonly bookingCreationService: BookingCreationService,
    private readonly bookingCancellationService: BookingCancellationService,
    private readonly bookingQueryService: BookingQueryService,
  ) {}

  // ------------------------------------------------------------------
  // Slot generation
  // ------------------------------------------------------------------

  async getAvailableSlots(
    instructorProfileId: string,
    startDate: Date,
    endDate: Date,
    requestingUserId?: string,
    timezoneOffset: number = 0,
  ) {
    return this.slotGenerationService.getAvailableSlots(
      instructorProfileId,
      startDate,
      endDate,
      requestingUserId,
      timezoneOffset,
    );
  }

  // ------------------------------------------------------------------
  // Booking creation
  // ------------------------------------------------------------------

  async createBooking(
    userId: string,
    dto: CreateBookingDto,
    language: Language = 'pl',
  ) {
    return this.bookingCreationService.createBooking(userId, dto, language);
  }

  async createGuestBooking(dto: CreateBookingDto, language: Language = 'pl') {
    return this.bookingCreationService.createGuestBooking(dto, language);
  }

  async createManualBooking(
    userId: string,
    dto: CreateManualBookingDto,
    language: Language = 'pl',
  ) {
    return this.bookingCreationService.createManualBooking(
      userId,
      dto,
      language,
    );
  }

  async createManualBlock(
    userId: string,
    instructorProfileId: string,
    startTime: Date,
    endTime: Date,
    notes?: string,
  ) {
    return this.bookingCreationService.createManualBlock(
      userId,
      instructorProfileId,
      startTime,
      endTime,
      notes,
    );
  }

  // ------------------------------------------------------------------
  // Booking queries
  // ------------------------------------------------------------------

  async getMyBookings(userId: string, role: 'client' | 'instructor') {
    return this.bookingQueryService.getMyBookings(userId, role);
  }

  async getBookingById(bookingId: string, userId: string) {
    return this.bookingQueryService.getBookingById(bookingId, userId);
  }

  async confirmBooking(
    bookingId: string,
    userId: string,
    language: Language = 'pl',
  ) {
    return this.bookingQueryService.confirmBooking(bookingId, userId, language);
  }

  async completeBooking(bookingId: string, userId: string) {
    return this.bookingQueryService.completeBooking(bookingId, userId);
  }

  async updateBookingNotes(userId: string, bookingId: string, notes: string) {
    return this.bookingQueryService.updateBookingNotes(
      userId,
      bookingId,
      notes,
    );
  }

  async acceptManualBooking(
    bookingId: string,
    userId: string,
    language: Language = 'pl',
  ) {
    return this.bookingCreationService.acceptManualBooking(
      bookingId,
      userId,
      language,
    );
  }

  async clearUserHistory(userId: string) {
    return this.bookingCreationService.clearUserHistory(userId);
  }

  // ------------------------------------------------------------------
  // Booking cancellation
  // ------------------------------------------------------------------

  async cancelBooking(
    bookingId: string,
    userId: string,
    dto: CancelBookingDto,
    language: Language = 'pl',
  ) {
    return this.bookingCancellationService.cancelBooking(
      bookingId,
      userId,
      dto,
      language,
    );
  }

  async cancelGuestBooking(
    bookingId: string,
    token: string,
    cancellationReason?: string,
    language: Language = 'pl',
  ) {
    return this.bookingCancellationService.cancelGuestBooking(
      bookingId,
      token,
      cancellationReason,
      language,
    );
  }

  async validateCancellationToken(
    bookingId: string,
    token: string,
    language: Language = 'pl',
  ) {
    return this.bookingCancellationService.validateCancellationToken(
      bookingId,
      token,
      language,
    );
  }

  async acknowledgeCancellation(userId: string, bookingId: string) {
    return this.bookingCancellationService.acknowledgeCancellation(
      userId,
      bookingId,
    );
  }

  async cleanupExpiredCancellationTokens() {
    return this.bookingCancellationService.cleanupExpiredCancellationTokens();
  }
}
