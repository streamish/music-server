/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { SubsonicResponseDto } from '../subsonic.dto';
import { SubsonicSongDto } from './song.dto';
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

export class SubsonicSearchResultDataDto {
  @ApiProperty({ type: 'integer' })
  declare offset: number;

  @ApiProperty({ type: 'integer' })
  declare totalHits: number;

  @ApiProperty({ type: SubsonicSongDto, isArray: true })
  declare match: SubsonicSongDto[];
}

export class SubsonicSearchResponseDto extends SubsonicResponseDto {
  @ApiProperty({ type: SubsonicSearchResultDataDto })
  declare searchResult: SubsonicSearchResultDataDto;
}
