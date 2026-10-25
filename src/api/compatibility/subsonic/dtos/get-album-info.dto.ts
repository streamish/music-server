/* eslint-disable max-classes-per-file */
import { IsInt } from 'class-validator';
import { SubsonicResponseDto, SubsonicResponseObject } from '../subsonic.dto';
import { Type } from 'class-transformer';

export class SubsonicAlbumInfoQueryDto {
  @IsInt()
  @Type(() => Number)
  declare id: number;
}

export class SubsonicAlbumInfoResponseDto extends SubsonicResponseDto {
  declare albumInfo: SubsonicResponseObject;
}
