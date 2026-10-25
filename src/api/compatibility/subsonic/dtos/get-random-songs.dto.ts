/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { SubsonicResponseDto } from '../subsonic.dto';
import { SubsonicSongDataDto } from './song.dto';
import { Type } from 'class-transformer';

export class SubsonicRandomSongsQueryDto {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  declare size?: number;

  @IsString()
  @IsOptional()
  declare genre?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  declare fromYear?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  declare toYear?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  declare musicFolderId?: number;
}

export class SubsonicRandomSongsResponseDto extends SubsonicResponseDto {
  @ApiProperty({ type: SubsonicSongDataDto })
  declare randomSongs: SubsonicSongDataDto;
}
