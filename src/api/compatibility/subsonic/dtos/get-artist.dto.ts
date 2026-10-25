/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { SubsonicArtistDto } from './artist.dto';
import { SubsonicResponseDto } from '../subsonic.dto';
import { Type } from 'class-transformer';

export class SubsonicArtistQueryDto {
  @IsInt()
  @Type(() => Number)
  declare id: number;
}

export class SubsonicArtistResponseDto extends SubsonicResponseDto {
  @ApiProperty({ type: SubsonicArtistDto })
  declare artist: SubsonicArtistDto;
}
