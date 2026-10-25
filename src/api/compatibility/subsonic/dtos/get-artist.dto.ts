/* eslint-disable max-classes-per-file */
import { IsInt } from 'class-validator';
import { SubsonicResponseDto, SubsonicResponseObject } from '../subsonic.dto';
import { Type } from 'class-transformer';

export class SubsonicArtistQueryDto {
  @IsInt()
  @Type(() => Number)
  declare id: number;
}

export class SubsonicArtistResponseDto extends SubsonicResponseDto {
  declare artist: SubsonicResponseObject;
}
