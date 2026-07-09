import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { InstructorProfilesModule } from './instructor-profiles/instructor-profiles.module';
import { UploadModule } from './upload/upload.module';
import { UsersModule } from './users/users.module';
import { BookingsModule } from './bookings/bookings.module';
import { AvailabilityModule } from './availability/availability.module';
import { StaticConfigModule } from './config/config.module';
import { ContactModule } from './contact/contact.module';
import { ReviewsModule } from './reviews/reviews.module';
import { FavoritesModule } from './favorites/favorites.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ProfileViewsModule } from './profile-views/profile-views.module';
import { EnterpriseModule } from './enterprise/enterprise.module';
import { SearchModule } from './search/search.module';
import { OGPreviewModule } from './og-preview/og-preview.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    // Global rate limit: 100 req/min allows normal browsing/polling
    // Stricter limits on write operations (e.g., booking creation: 3/10min)
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    InstructorProfilesModule,
    UploadModule,
    UsersModule,
    BookingsModule,
    AvailabilityModule,
    StaticConfigModule,
    ContactModule,
    ReviewsModule,
    FavoritesModule,
    NotificationsModule,
    ProfileViewsModule,
    EnterpriseModule,
    SearchModule,
    OGPreviewModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
