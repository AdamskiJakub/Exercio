import { IsIn, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CancelGuestBookingDto {
  @IsUUID()
  @IsNotEmpty()
  bookingId: string;

  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsOptional()
  cancellationReason?: string;

  @IsIn(['pl', 'en'])
  @IsOptional()
  language?: 'pl' | 'en';
}