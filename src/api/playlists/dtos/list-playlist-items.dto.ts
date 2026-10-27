/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { LibraryTrackDto } from 'src/library/dtos/library.track.dto';
import { PaginationQueryDto } from 'src/api/request.dto';
import { createPaginatedArrayResponseDto } from 'src/api/response.dto';

export class ListPlaylistItemsQueryDto extends PaginationQueryDto {
  /**
   * The database ID of the playlist
   */
  @IsInt({ message: ErrorCodes.INVALID_PLAYLIST_ID_ERROR })
  @Min(1, { message: ErrorCodes.INVALID_PLAYLIST_ID_ERROR })
  declare id: number;
}

export class PlaylistItemDto {
  /**
   * The ID of the playlist item, used to move or remove it.  This is not set for the
   * tracks of smart playlists since they are not saved items.
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
   * The library track.  This is not set for radio stations.
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

export class ListPlaylistItemsResponseDto extends createPaginatedArrayResponseDto('playlistItems', PlaylistItemDto) {}
