/* eslint-disable max-classes-per-file */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubsonicSongDto {
  @ApiProperty({ type: String })
  declare album: string;

  @ApiProperty({ type: String })
  declare albumId: string;

  @ApiProperty({ type: String })
  declare artist: string;

  @ApiProperty({ type: String })
  declare artistId: string;

  @ApiPropertyOptional({ type: 'integer' })
  declare bitRate?: number;

  @ApiProperty({ type: String })
  declare contentType: string;

  @ApiPropertyOptional({ type: String })
  declare created?: string;

  @ApiPropertyOptional({ type: 'integer' })
  declare discNumber?: number;

  @ApiProperty({ type: 'number' })
  declare duration: number;

  @ApiPropertyOptional({ type: String })
  declare genre?: string;

  @ApiProperty({ type: String })
  declare id: string;

  @ApiPropertyOptional({ type: Boolean })
  declare isDir?: boolean;

  @ApiProperty({ type: String })
  declare parent: string;

  @ApiPropertyOptional({ type: String })
  declare path?: string;

  @ApiPropertyOptional({ type: 'integer' })
  declare playCount?: number;

  @ApiPropertyOptional({ type: 'integer' })
  declare size?: number;

  @ApiProperty({ type: String })
  declare suffix: string;

  @ApiProperty({ type: String })
  declare title: string;

  @ApiPropertyOptional({ type: 'integer' })
  declare track?: number;

  @ApiPropertyOptional({ type: String })
  declare type?: string;

  @ApiPropertyOptional({ type: 'integer' })
  declare year?: number;

  @ApiPropertyOptional({ type: String })
  declare starred?: string;
}

export class SubsonicSongDataDto {
  @ApiProperty({ type: SubsonicSongDto, isArray: true })
  declare song: SubsonicSongDto[];
}
