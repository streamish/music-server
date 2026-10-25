/* eslint-disable max-classes-per-file */
import { IsInt } from 'class-validator';
import { SubsonicResponseDto, SubsonicResponseObject } from '../subsonic.dto';
import { Type } from 'class-transformer';

export class SubsonicAlbumQueryDto {
  @IsInt()
  @Type(() => Number)
  declare id: number;
}

export class SubsonicAlbumResponseDto extends SubsonicResponseDto {
  declare album: SubsonicResponseObject;
}
