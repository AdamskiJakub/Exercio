import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';

export enum NotificationType {
  FAVORITE = 'FAVORITE',
  NEW_BOOKING = 'NEW_BOOKING',
  NEW_REVIEW = 'NEW_REVIEW',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  ENTERPRISE_INVITATION = 'ENTERPRISE_INVITATION',
  ENTERPRISE_INVITATION_ACCEPTED = 'ENTERPRISE_INVITATION_ACCEPTED',
  NEW_FOLLOWER = 'NEW_FOLLOWER',
  ENTERPRISE_NEWS = 'ENTERPRISE_NEWS',
}

export class CreateNotificationDto {
  @IsString()
  userId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;
}
