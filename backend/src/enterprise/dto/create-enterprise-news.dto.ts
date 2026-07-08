import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateEnterpriseNewsDto {
  @IsString()
  @IsOptional()
  @IsIn(['link', 'post'])
  type?: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
