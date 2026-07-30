import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CancelGuestBookingDto {
  @IsUUID()
  @IsNotEmpty()
  bookingId: string;

  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  cancellationReason?: string;

  @IsIn(['pl', 'en'])
  @IsOptional()
  language?: 'pl' | 'en';
}
