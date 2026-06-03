import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CancelBookingDto {
  @IsIn(['client', 'instructor'])
  @IsNotEmpty()
  cancelledBy: 'client' | 'instructor';

  @IsString()
  @IsOptional()
  cancellationReason?: string;

  @IsIn(['pl', 'en'])
  @IsOptional()
  language?: 'pl' | 'en';
}
