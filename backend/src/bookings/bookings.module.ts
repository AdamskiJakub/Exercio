import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { BookingsCronService } from './bookings-cron.service';
import { SlotGenerationService } from './services/slot-generation.service';
import { BookingCreationService } from './services/booking-creation.service';
import { BookingCancellationService } from './services/booking-cancellation.service';
import { BookingQueryService } from './services/booking-query.service';
import { BookingNotificationHelper } from './helpers/booking-notification.helper';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { ReviewsModule } from '../reviews/reviews.module';

@Module({
  imports: [PrismaModule, EmailModule, ReviewsModule],
  providers: [
    BookingsService,
    BookingsCronService,
    SlotGenerationService,
    BookingCreationService,
    BookingCancellationService,
    BookingQueryService,
    BookingNotificationHelper,
  ],
  controllers: [BookingsController],
  exports: [BookingsService],
})
export class BookingsModule {}
