import { Module } from '@nestjs/common';
import { EnterpriseController } from './enterprise.controller';
import { EnterpriseService } from './enterprise.service';
import { EnterpriseLeadsController } from './enterprise-leads.controller';
import { EnterpriseLeadsService } from './enterprise-leads.service';
import { EnterpriseInvitationsController } from './enterprise-invitations.controller';
import { EnterpriseInvitationsService } from './enterprise-invitations.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [
    EnterpriseController,
    EnterpriseLeadsController,
    EnterpriseInvitationsController,
  ],
  providers: [
    EnterpriseService,
    EnterpriseLeadsService,
    EnterpriseInvitationsService,
  ],
  exports: [EnterpriseService],
})
export class EnterpriseModule {}
