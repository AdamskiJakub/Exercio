import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SlotGenerationService } from './slot-generation.service';
import { BookingNotificationHelper } from '../helpers/booking-notification.helper';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { CreateManualBookingDto } from '../dto/create-manual-booking.dto';
import { CANCELLATION_TOKEN_EXPIRY_MS } from '../bookings.constants';
import type { Language } from '../../email/email.types';

@Injectable()
export class BookingCreationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly slotGenerationService: SlotGenerationService,
    private readonly notificationHelper: BookingNotificationHelper,
  ) {}

  /**
   * Create a new booking (authenticated client)
   */
  async createBooking(
    userId: string,
    dto: CreateBookingDto,
    language: Language = 'pl',
  ) {
    const profile = await this.validateAndGetProfile(dto.instructorId);

    // Prevent self-booking
    if (profile.userId === userId) {
      throw new BadRequestException('You cannot book a session with yourself');
    }

    const startTime = new Date(dto.startTime);
    const endTime = new Date(
      startTime.getTime() + profile.sessionDuration * 60 * 1000,
    );
    const now = new Date();

    this.throwIfPastTime(startTime, now);
    await this.validateSlotAvailability(
      dto.instructorId,
      startTime,
      endTime,
      dto.timezoneOffset,
      language,
    );
    await this.checkOverlappingBooking(profile.userId, startTime, endTime);

    const isShortNotice = this.isWithinNoticePeriod(
      now,
      startTime,
      profile.minNoticeHours,
    );

    const booking = await this.prisma.booking.create({
      data: {
        clientId: userId,
        instructorId: profile.userId,
        startTime,
        endTime,
        duration: profile.sessionDuration,
        price: profile.sessionPrice,
        isShortNotice,
        notes: dto.notes,
        status: 'PENDING',
      },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        instructorUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            instructorProfile: {
              select: {
                id: true,
                sessionDuration: true,
                sessionPrice: true,
              },
            },
          },
        },
      },
    });

    // Only notify the instructor about the new booking request.
    // The confirmation email to the client is sent when the instructor confirms.
    this.notificationHelper.sendInstructorNewBookingRequestNotification(
      booking,
      language,
    );

    return booking;
  }

  /**
   * Create a guest booking (without authenticated user)
   */
  async createGuestBooking(dto: CreateBookingDto, language: Language = 'pl') {
    const profile = await this.validateAndGetProfile(dto.instructorId);

    const startTime = new Date(dto.startTime);
    const endTime = new Date(
      startTime.getTime() + profile.sessionDuration * 60 * 1000,
    );
    const now = new Date();

    this.throwIfPastTime(startTime, now);
    await this.validateSlotAvailability(
      dto.instructorId,
      startTime,
      endTime,
      dto.timezoneOffset,
      language,
    );
    await this.checkOverlappingBooking(profile.userId, startTime, endTime);

    const isShortNotice = this.isWithinNoticePeriod(
      now,
      startTime,
      profile.minNoticeHours,
    );

    const booking = await this.prisma.booking.create({
      data: {
        clientId: null,
        instructorId: profile.userId,
        startTime,
        endTime,
        duration: profile.sessionDuration,
        price: profile.sessionPrice,
        isShortNotice,
        notes: dto.notes,
        status: 'PENDING',
        guestName: dto.guestName,
        guestEmail: dto.guestEmail,
        guestPhone: dto.guestPhone,
        cancellationToken: crypto.randomUUID(),
        cancellationTokenExpiresAt: new Date(
          Date.now() + CANCELLATION_TOKEN_EXPIRY_MS,
        ),
      },
      include: {
        instructorUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            instructorProfile: {
              select: {
                id: true,
                sessionDuration: true,
                sessionPrice: true,
              },
            },
          },
        },
      },
    });

    this.notificationHelper.sendBookingConfirmationToGuest(booking, language);

    return booking;
  }

  /**
   * Create a manual booking by instructor (e.g., phone booking)
   */
  async createManualBooking(
    userId: string,
    dto: CreateManualBookingDto,
    language: Language = 'pl',
  ) {
    const profile = await this.prisma.instructorProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new ForbiddenException(
        'Only instructors can create manual bookings',
      );
    }

    const startTime = new Date(dto.startTime);
    const endTime = new Date(
      startTime.getTime() + profile.sessionDuration * 60 * 1000,
    );
    const now = new Date();

    if (startTime <= now) {
      console.warn(
        `Instructor ${userId} creating booking in the past: ${startTime}`,
      );
    }

    await this.checkOverlappingBooking(userId, startTime, endTime);

    const isShortNotice = this.isWithinNoticePeriod(
      now,
      startTime,
      profile.minNoticeHours,
    );

    // Check if guest email belongs to a registered client
    let clientId: string | null = null;
    if (dto.guestEmail) {
      const clientUser = await this.prisma.user.findFirst({
        where: { email: dto.guestEmail, role: 'CLIENT' },
      });
      if (clientUser) {
        clientId = clientUser.id;
      }
    }

    const booking = await this.prisma.booking.create({
      data: {
        clientId,
        instructorId: userId,
        startTime,
        endTime,
        duration: profile.sessionDuration,
        price: profile.sessionPrice,
        isShortNotice,
        isManualBooking: true,
        notes: dto.notes,
        status: 'CONFIRMED',
        guestName: dto.guestName,
        guestEmail: dto.guestEmail,
        guestPhone: dto.guestPhone,
        cancellationToken: crypto.randomUUID(),
        cancellationTokenExpiresAt: new Date(
          Date.now() + CANCELLATION_TOKEN_EXPIRY_MS,
        ),
      },
      include: {
        instructorUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            instructorProfile: {
              select: {
                id: true,
                sessionDuration: true,
                sessionPrice: true,
              },
            },
          },
        },
      },
    });

    this.notificationHelper.sendManualBookingCreatedNotification(
      booking,
      language,
      clientId,
    );

    return booking;
  }

  /**
   * Create manual block (instructor only)
   */
  async createManualBlock(
    userId: string,
    instructorProfileId: string,
    startTime: Date,
    endTime: Date,
    notes?: string,
  ) {
    const profile = await this.prisma.instructorProfile.findUnique({
      where: { id: instructorProfileId },
    });

    if (!profile || profile.userId !== userId) {
      throw new ForbiddenException('You are not this instructor');
    }

    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    const duration = Math.floor(
      (endTime.getTime() - startTime.getTime()) / (60 * 1000),
    );

    if (duration <= 0) {
      throw new BadRequestException('Duration must be positive');
    }

    await this.checkOverlappingBooking(profile.userId, startTime, endTime);

    return this.prisma.booking.create({
      data: {
        instructorId: profile.userId,
        clientId: null,
        startTime,
        endTime,
        duration,
        isManualBlock: true,
        notes,
        status: 'CONFIRMED',
      },
    });
  }

  // ------------------------------------------------------------------
  // Shared validation helpers
  // ------------------------------------------------------------------

  private async validateAndGetProfile(instructorProfileId: string) {
    const profile = await this.prisma.instructorProfile.findUnique({
      where: { id: instructorProfileId },
    });

    if (!profile) {
      throw new NotFoundException('Instructor not found');
    }

    if (!profile.isBookingEnabled) {
      throw new BadRequestException('Instructor does not accept bookings');
    }

    return profile;
  }

  private throwIfPastTime(startTime: Date, now: Date): void {
    if (startTime <= now) {
      throw new BadRequestException('Cannot book time slot in the past');
    }
  }

  private async validateSlotAvailability(
    instructorProfileId: string,
    startTime: Date,
    endTime: Date,
    timezoneOffset: number = 0,
    language?: Language,
  ): Promise<void> {
    const availableSlots = await this.slotGenerationService.getAvailableSlots(
      instructorProfileId,
      startTime,
      endTime,
      undefined,
      timezoneOffset,
    );

    const slotExists = availableSlots.some(
      (slot) =>
        slot.startTime.getTime() === startTime.getTime() &&
        slot.endTime.getTime() === endTime.getTime(),
    );

    if (!slotExists) {
      throw new BadRequestException(
        language === 'pl'
          ? 'Termin jest niedostępny. Wybierz z dostępnych slotów.'
          : 'Time slot is not available. Please choose from available slots.',
      );
    }
  }

  private async checkOverlappingBooking(
    instructorUserId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<void> {
    const existingBooking = await this.prisma.booking.findFirst({
      where: {
        instructorId: instructorUserId,
        startTime: { lt: endTime },
        endTime: { gt: startTime },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (existingBooking) {
      throw new BadRequestException('Time slot is already booked');
    }
  }

  /**
   * Accept a manual booking (client acknowledges an instructor-created booking)
   * Sends confirmation email to client and notification to instructor.
   */
  async acceptManualBooking(
    bookingId: string,
    userId: string,
    language: Language = 'pl',
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        instructorUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            instructorProfile: {
              select: {
                id: true,
                sessionDuration: true,
                sessionPrice: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.clientId !== userId) {
      throw new ForbiddenException(
        'Only the assigned client can accept this booking',
      );
    }

    if (!booking.isManualBooking) {
      throw new BadRequestException(
        'Only manual bookings can be accepted this way',
      );
    }

    if (booking.status !== 'CONFIRMED') {
      throw new BadRequestException(
        'Only confirmed manual bookings can be accepted',
      );
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { acknowledgedAt: new Date() },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        instructorUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            instructorProfile: {
              select: {
                id: true,
                sessionDuration: true,
                sessionPrice: true,
              },
            },
          },
        },
      },
    });

    // Send confirmation email to client + notification to instructor
    this.notificationHelper.sendManualBookingAcceptedNotification(
      updated,
      language,
    );

    return updated;
  }

  /**
   * Clear completed/cancelled bookings for the requesting client (soft-delete)
   */
  async clearUserHistory(userId: string) {
    const result = await this.prisma.booking.updateMany({
      where: {
        clientId: userId,
        hiddenFromClient: false,
        status: {
          in: ['COMPLETED', 'CANCELLED'],
        },
      },
      data: {
        hiddenFromClient: true,
      },
    });

    return { deleted: result.count };
  }

  /**
   * Confirm a pending booking (instructor only).
   * Sends confirmation email to the client.
   */
  async confirmBooking(
    bookingId: string,
    userId: string,
    language: Language = 'pl',
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.instructorId !== userId) {
      throw new ForbiddenException('Only the instructor can confirm bookings');
    }

    if (booking.status !== 'PENDING') {
      throw new BadRequestException('Only pending bookings can be confirmed');
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        instructorUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            instructorProfile: {
              select: {
                id: true,
                sessionDuration: true,
                sessionPrice: true,
              },
            },
          },
        },
      },
    });

    // Send confirmation email to the client now that the instructor has confirmed
    if (updated.client) {
      this.notificationHelper.sendBookingConfirmationToClient(
        updated,
        language,
      );
    } else if (updated.guestEmail) {
      this.notificationHelper.sendBookingConfirmationToGuest(updated, language);
    }

    return updated;
  }

  /**
   * Complete a booking (instructor only)
   */
  async completeBooking(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.instructorId !== userId) {
      throw new ForbiddenException('Only the instructor can complete bookings');
    }

    if (booking.status !== 'CONFIRMED') {
      throw new BadRequestException('Only confirmed bookings can be completed');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'COMPLETED' },
    });
  }

  /**
   * Update booking notes (instructor only)
   */
  async updateBookingNotes(userId: string, bookingId: string, notes: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.instructorId !== userId) {
      throw new ForbiddenException('Only the instructor can update notes');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { notes },
    });
  }

  private isWithinNoticePeriod(
    now: Date,
    startTime: Date,
    minNoticeHours: number,
  ): boolean {
    const minNoticeDate = new Date(
      now.getTime() + minNoticeHours * 60 * 60 * 1000,
    );
    return startTime < minNoticeDate;
  }
}
