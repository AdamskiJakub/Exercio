import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';

export enum NotificationType {
  FAVORITE = 'FAVORITE',
  NEW_BOOKING = 'NEW_BOOKING',
  NEW_REVIEW = 'NEW_REVIEW',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
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
