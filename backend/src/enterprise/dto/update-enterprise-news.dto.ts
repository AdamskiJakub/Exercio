import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateEnterpriseNewsDto {
  @IsString()
  @IsOptional()
  @IsIn(['link', 'post'])
  type?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;
}
