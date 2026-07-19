import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewsService } from '../reviews/reviews.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class BookingsCronService {
  private readonly logger = new Logger(BookingsCronService.name);

  constructor(
    private prisma: PrismaService,
    private reviewsService: ReviewsService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  /**
   * Run every hour to expire pending bookings that haven't been confirmed within 24 hours
   */
  @Cron(CronExpression.EVERY_HOUR)
  async expirePendingBookings() {
    this.logger.log('Running expirePendingBookings cron job...');

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    try {
      const result = await this.prisma.booking.updateMany({
        where: {
          status: 'PENDING',
          createdAt: {
            lt: twentyFourHoursAgo,
          },
        },
        data: {
          status: 'EXPIRED',
        },
      });

      this.logger.log(`Expired ${result.count} pending bookings`);
    } catch (error) {
      this.logger.error('Failed to expire pending bookings', error);
    }
  }

  /**
   * Run every hour to auto-complete confirmed bookings whose endTime + 2h buffer has passed.
   * This handles the case where the instructor forgets to manually complete the session.
   *
   * Also generates review tokens and sends review invitation emails so that
   * clients (registered or guest) can leave a review even when the instructor
   * forgets to manually complete the session.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async autoCompleteBookings() {
    this.logger.log('Running autoCompleteBookings cron job...');

    const cutoffTime = new Date(Date.now() - 2 * 60 * 60 * 1000);

    try {
      // Find all confirmed bookings whose endTime + 2h buffer has passed
      const bookingsToComplete = await this.prisma.booking.findMany({
        where: {
          status: 'CONFIRMED',
          endTime: {
            lt: cutoffTime,
          },
        },
        include: {
          instructorUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          client: {
            select: {
              id: true,
              email: true,
              firstName: true,
            },
          },
        },
      });

      if (bookingsToComplete.length === 0) {
        return;
      }

      this.logger.log(
        `Auto-completing ${bookingsToComplete.length} confirmed bookings`,
      );

      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        'http://localhost:3000';

      for (const booking of bookingsToComplete) {
        try {
          // Mark as completed
          await this.prisma.booking.update({
            where: { id: booking.id },
            data: { status: 'COMPLETED' },
          });

          // Generate review token
          const { token } = await this.reviewsService.generateReviewToken(
            booking.id,
          );

          const reviewUrl = `${frontendUrl}/review?bookingId=${booking.id}&token=${token}`;

          const instructorName = booking.instructorUser?.firstName
            ? `${booking.instructorUser.firstName} ${booking.instructorUser.lastName || ''}`.trim()
            : 'Trainer';

          // Send review invitation to guest email if present
          if (booking.guestEmail) {
            await this.emailService.sendReviewInvitation(
              booking.guestEmail,
              'pl',
              instructorName,
              reviewUrl,
            );
          }

          // Send review invitation to registered client if present
          if (booking.clientId && booking.client?.email) {
            await this.emailService.sendReviewInvitation(
              booking.client.email,
              'pl',
              instructorName,
              reviewUrl,
            );
          }

          this.logger.log(
            `Auto-completed booking ${booking.id} and sent review invitation`,
          );
        } catch (innerError) {
          this.logger.error(
            `Failed to process auto-complete for booking ${booking.id}`,
            innerError,
          );
          // Continue with next booking
        }
      }
    } catch (error) {
      this.logger.error('Failed to auto-complete bookings', error);
    }
  }

  /**
   * Optional: Run daily to clean up very old completed/cancelled bookings
   * This keeps the database lean, but you may want to keep all booking history
   */
  // @Cron(CronExpression.EVERY_DAY_AT_3AM)
  // async cleanupOldBookings() {
  //   this.logger.log('Running cleanupOldBookings cron job...');
  //
  //   const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
  //
  //   try {
  //     const result = await this.prisma.booking.deleteMany({
  //       where: {
  //         status: {
  //           in: ['COMPLETED', 'CANCELLED', 'EXPIRED'],
  //         },
  //         updatedAt: {
  //           lt: sixMonthsAgo,
  //         },
  //       },
  //     });
  //
  //     this.logger.log(`Cleaned up ${result.count} old bookings`);
  //   } catch (error) {
  //     this.logger.error('Failed to cleanup old bookings', error);
  //   }
  // }
}
