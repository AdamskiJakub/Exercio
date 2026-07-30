import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CancelBookingDto {
  @IsIn(['client', 'instructor'])
  @IsNotEmpty()
  cancelledBy: 'client' | 'instructor';

  @IsString()
  @IsOptional()
  @MaxLength(500)
  cancellationReason?: string;

  @IsIn(['pl', 'en'])
  @IsOptional()
  language?: 'pl' | 'en';
}
