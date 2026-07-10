import {
  IsOptional,
  IsString,
  IsArray,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { EnterpriseCategory } from '@prisma/client';

export class UpdateEnterpriseProfileDto {
  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  coverUrl?: string;

  @IsString()
  @IsOptional()
  aboutImage?: string;

  @IsOptional()
  openingHours?: Record<string, string>;

  @IsOptional()
  highlights?: { label: string; value: string }[];

  @IsString()
  @IsOptional()
  facebookUrl?: string;

  @IsString()
  @IsOptional()
  instagramUrl?: string;

  @IsString()
  @IsOptional()
  youtubeUrl?: string;

  @IsString()
  @IsOptional()
  tiktokUrl?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsEnum(EnterpriseCategory)
  @IsOptional()
  category?: EnterpriseCategory;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  gallery?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  videos?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  partners?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  certificates?: string[];

  @IsString()
  @IsOptional()
  businessType?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetAudience?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  disciplines?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages?: string[];

  @IsBoolean()
  @IsOptional()
  hasParking?: boolean;

  @IsBoolean()
  @IsOptional()
  hasShower?: boolean;

  @IsBoolean()
  @IsOptional()
  hasLockerRoom?: boolean;

  @IsBoolean()
  @IsOptional()
  hasAirConditioning?: boolean;

  @IsBoolean()
  @IsOptional()
  hasDisabledAccess?: boolean;

  @IsBoolean()
  @IsOptional()
  hasFreeTrial?: boolean;

  @IsOptional()
  pricing?: { label: string; price: number }[];

  @IsOptional()
  faq?: { question: string; answer: string }[];
}
