/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { SubsonicResponseDto } from '../subsonic.dto';
import { SubsonicSongDataDto } from './song.dto';
import { Type } from 'class-transformer';

export class SubsonicTopSongsQueryDto {
  @IsString()
  declare artist: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  declare count?: number;
}

export class SubsonicTopSongsResponseDto extends SubsonicResponseDto {
  @ApiProperty({ type: SubsonicSongDataDto })
  declare topSongs: SubsonicSongDataDto;
}
