import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum BookingStatusEnum {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export class UpdateBookingDto {
  @IsEnum(BookingStatusEnum)
  @IsOptional()
  status?: BookingStatusEnum;

  @IsString()
  @IsOptional()
  notes?: string;
}
