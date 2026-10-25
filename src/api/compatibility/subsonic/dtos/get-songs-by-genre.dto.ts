/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { SubsonicResponseDto } from '../subsonic.dto';
import { SubsonicSongDataDto } from './song.dto';
import { Type } from 'class-transformer';

export class SubsonicSongsByGenreQueryDto {
  @IsString()
  declare genre: string;

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
  declare musicFolderId?: number;
}

export class SubsonicSongsByGenreResponseDto extends SubsonicResponseDto {
  @ApiProperty({ type: SubsonicSongDataDto })
  declare songsByGenre: SubsonicSongDataDto;
}
