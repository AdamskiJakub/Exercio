import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingsCronService {
  private readonly logger = new Logger(BookingsCronService.name);

  constructor(private prisma: PrismaService) {}

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
   */
  @Cron(CronExpression.EVERY_HOUR)
  async autoCompleteBookings() {
    this.logger.log('Running autoCompleteBookings cron job...');

    const cutoffTime = new Date(Date.now() - 2 * 60 * 60 * 1000);

    try {
      const result = await this.prisma.booking.updateMany({
        where: {
          status: 'CONFIRMED',
          endTime: {
            lt: cutoffTime,
          },
        },
        data: {
          status: 'COMPLETED',
        },
      });

      if (result.count > 0) {
        this.logger.log(`Auto-completed ${result.count} confirmed bookings`);
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
