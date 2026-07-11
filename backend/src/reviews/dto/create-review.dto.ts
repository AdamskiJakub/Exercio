import {
  IsInt,
  IsString,
  IsOptional,
  Min,
  Max,
  IsIn,
  IsUUID,
} from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  bookingId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsIn(['no-show', 'unprofessional', 'not-as-described', 'other'])
  lowRatingReason?: string;
}

export class CreateGuestReviewDto {
  @IsUUID()
  bookingId: string;

  @IsString()
  token: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsIn(['no-show', 'unprofessional', 'not-as-described', 'other'])
  lowRatingReason?: string;
}
