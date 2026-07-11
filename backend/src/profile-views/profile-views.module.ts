import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProfileViewsController } from './profile-views.controller';
import { ProfileViewsService } from './profile-views.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProfileViewsController],
  providers: [ProfileViewsService],
})
export class ProfileViewsModule {}
