/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { LibraryTrackDto } from 'src/library/dtos/library.track.dto';

export class PlaylistItemDto {
  /**
   * The ID of the playlist item, used to move or remove it. This is not set for smart playlist tracks.
   */
  @IsInt()
  @IsOptional()
  declare id?: number;

  /**
   * The one-based position of the item in the playlist.
   */
  @IsInt()
  declare position: number;

  /**
   * The library track. This is not set for radio stations.
   */
  @ApiProperty({ type: LibraryTrackDto, required: false })
  @IsOptional()
  declare track?: LibraryTrackDto;

  @IsString()
  @IsOptional()
  declare radioStationTitle?: string;

  @IsString()
  @IsOptional()
  declare radioStationUrl?: string;
}

export class PlaylistItemInputDto {
  @IsOptional()
  declare radioStationTitle?: string | null;

  @IsOptional()
  declare radioStationUrl?: string | null;

  @IsInt()
  @IsOptional()
  declare trackId?: number | null;
}
