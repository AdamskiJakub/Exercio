import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsInt,
  IsBoolean,
  IsIn,
  Min,
  ArrayMaxSize,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { IsValidConfigId } from '../../common/validators/is-valid-config-id.validator';

export class UpdateInstructorProfileDto {
  @IsString()
  @IsOptional()
  bio?: string | null;

  @IsString()
  @IsOptional()
  tagline?: string | null;

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  @IsValidConfigId('specialization')
  @IsOptional()
  specializations?: string[];

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(8)
  @IsValidConfigId('tag')
  @IsOptional()
  tags?: string[];

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(4)
  @IsValidConfigId('goal')
  @IsOptional()
  goals?: string[];

  @IsString()
  @IsOptional()
  location?: string | null;

  @IsString()
  @IsOptional()
  city?: string | null;

  @IsNumber()
  @Min(0)
  @IsOptional()
  hourlyRate?: number | null;

  @IsBoolean()
  @IsOptional()
  hourlyRateHidden?: boolean;

  @IsBoolean()
  @IsOptional()
  packageDealsEnabled?: boolean;

  @IsString()
  @IsOptional()
  packageDealsDescription?: string | null;

  @IsString()
  @IsOptional()
  photoUrl?: string | null;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  gallery?: string[];

  @IsString()
  @IsOptional()
  availability?: string | null;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages?: string[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  yearsExperience?: number | null;

  @IsBoolean()
  @IsOptional()
  showPhone?: boolean;

  @IsBoolean()
  @IsOptional()
  showEmail?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  contactMessage?: string | null;

  // Note: isDraft is allowed here for flexibility (e.g., save as draft flow).
  // The dedicated PATCH /:id/publish endpoint is the primary way to publish,
  // but this field enables direct draft/publish control if needed.
  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;

  // BOOKING SETTINGS
  @IsInt()
  @Min(15)
  @IsOptional()
  sessionDuration?: number; // Duration in minutes (30, 60, 90, 120)

  @ValidateIf((o) => o.sessionPrice !== null)
  @IsNumber()
  @Min(0)
  @IsOptional()
  sessionPrice?: number | null; // Price per session in PLN

  @IsBoolean()
  @IsOptional()
  isBookingEnabled?: boolean; // Whether instructor accepts bookings

  @IsInt()
  @Min(0)
  @IsOptional()
  minNoticeHours?: number; // Minimum hours notice before booking

  // PAYMENT INFORMATION (informational only, no payment processing)
  @IsArray()
  @IsString({ each: true })
  @IsIn(['cash', 'card', 'blik', 'transfer'], { each: true })
  @ArrayMaxSize(10)
  @IsOptional()
  paymentMethods?: string[]; // ["cash", "card", "blik", "transfer"]

  @IsString()
  @MaxLength(500)
  @IsOptional()
  paymentInfo?: string | null; // Additional payment instructions
}
