/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { SubsonicResponseDto } from '../subsonic.dto';
import { SubsonicSongDataDto } from './song.dto';
import { Type } from 'class-transformer';

export class SubsonicSimilarSongsQueryDto {
  @IsString()
  declare id: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  declare count?: number;
}

export class SubsonicSimilarSongsResponseDto extends SubsonicResponseDto {
  @ApiProperty({ type: SubsonicSongDataDto })
  declare similarSongs: SubsonicSongDataDto;
}
