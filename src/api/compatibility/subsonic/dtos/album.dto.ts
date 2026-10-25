// eslint-disable-next-line max-classes-per-file
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubsonicSongDto } from './song.dto';

export class SubsonicAlbumDto {
  @ApiProperty({ type: String })
  declare artist: string;

  @ApiProperty({ type: String })
  declare artistId: string;

  @ApiProperty({ type: String })
  declare coverArt: string;

  @ApiPropertyOptional({ type: String })
  declare created?: string;

  @ApiProperty({ type: 'number' })
  declare duration: number;

  @ApiPropertyOptional({ type: String })
  declare genre?: string;

  @ApiProperty({ type: String })
  declare id: string;

  @ApiProperty({ type: String })
  declare name: string;

  @ApiPropertyOptional({ type: 'integer' })
  declare playCount?: number;

  @ApiPropertyOptional({ type: SubsonicSongDto, isArray: true })
  declare song?: SubsonicSongDto[];

  @ApiProperty({ type: 'integer' })
  declare songCount: number;

  @ApiPropertyOptional({ type: 'integer' })
  declare year?: number;

  @ApiPropertyOptional({ type: String })
  declare starred?: string;
}
