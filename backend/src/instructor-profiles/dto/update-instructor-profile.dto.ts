import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsBoolean,
  Min,
  ArrayMaxSize,
  MaxLength,
  ValidateIf,
} from 'class-validator';

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
  @IsOptional()
  specializations?: string[];

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(8)
  @IsOptional()
  tags?: string[];

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(4)
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
  @IsNumber()
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

  @IsNumber()
  @Min(0)
  @IsOptional()
  minNoticeHours?: number; // Minimum hours notice before booking
}
