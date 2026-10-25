/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { SubsonicResponseDto } from '../subsonic.dto';
import { SubsonicSongDto } from './song.dto';
import { Transform } from 'class-transformer';

export class SubsonicSongQueryDto {
  @IsInt()
  @Transform(({ obj }) => Number.parseInt(String(obj.id).substring('song-'.length), 10))
  declare id: number;
}

export class SubsonicSongResponseDto extends SubsonicResponseDto {
  @ApiProperty({ type: SubsonicSongDto })
  declare song: SubsonicSongDto;
}
