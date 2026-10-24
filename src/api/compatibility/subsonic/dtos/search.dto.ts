import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class SubsonicSearchQueryDto {
  @IsString()
  @IsOptional()
  declare artist?: string;

  @IsString()
  @IsOptional()
  declare album?: string;

  @IsString()
  @IsOptional()
  declare title?: string;

  @IsString()
  @IsOptional()
  declare any?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  declare count?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  declare offset?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  declare newerThan?: number;
}
