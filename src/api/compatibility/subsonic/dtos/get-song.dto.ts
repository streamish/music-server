/* eslint-disable max-classes-per-file */
import { IsInt } from 'class-validator';
import { SubsonicResponseDto, SubsonicResponseObject } from '../subsonic.dto';
import { Transform } from 'class-transformer';

export class SubsonicSongQueryDto {
  @IsInt()
  @Transform(({ obj }) => Number.parseInt(String(obj.id).substring('song-'.length), 10))
  declare id: number;
}

export class SubsonicSongResponseDto extends SubsonicResponseDto {
  declare song: SubsonicResponseObject;
}
