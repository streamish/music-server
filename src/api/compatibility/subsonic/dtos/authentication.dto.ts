/* eslint-disable max-classes-per-file */
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SubsonicQueryDto {
  @IsOptional()
  @IsString()
  u?: string;

  // Subsonic clients commonly send either a password (`p`) or a
  // token and salt (`t`, `s`). Authentication is not implemented here.
  @IsOptional()
  @IsString()
  p?: string;

  @IsOptional()
  @IsString()
  t?: string;

  @IsOptional()
  @IsString()
  s?: string;

  @IsOptional()
  @IsString()
  v?: string;

  @IsOptional()
  @IsString()
  c?: string;

  @IsOptional()
  @IsString()
  f?: string;
}

export class Search3QueryDto extends SubsonicQueryDto {
  @IsString()
  query!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  songCount = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  albumCount = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  artistCount = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  songOffset = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  albumOffset = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  artistOffset = 0;
}
