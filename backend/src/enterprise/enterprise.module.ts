import { Module } from '@nestjs/common';
import { EnterpriseController } from './enterprise.controller';
import { EnterpriseService } from './enterprise.service';
import { EnterpriseLeadsController } from './enterprise-leads.controller';
import { EnterpriseLeadsService } from './enterprise-leads.service';
import {
  EnterpriseInvitationsController,
  MyEnterpriseInvitationsController,
} from './enterprise-invitations.controller';
import { EnterpriseInvitationsService } from './enterprise-invitations.service';
import { EnterpriseNewsController } from './enterprise-news.controller';
import { EnterpriseNewsService } from './enterprise-news.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailModule } from '../email/email.module';
import { StaticConfigModule } from '../config/config.module';

@Module({
  imports: [NotificationsModule, EmailModule, StaticConfigModule],
  controllers: [
    EnterpriseController,
    EnterpriseLeadsController,
    EnterpriseInvitationsController,
    MyEnterpriseInvitationsController,
    EnterpriseNewsController,
  ],
  providers: [
    EnterpriseService,
    EnterpriseLeadsService,
    EnterpriseInvitationsService,
    EnterpriseNewsService,
  ],
  exports: [EnterpriseService],
})
export class EnterpriseModule {}
