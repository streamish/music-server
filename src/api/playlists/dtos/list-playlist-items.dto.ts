/* eslint-disable max-classes-per-file */
import { ErrorCodes } from 'src/constants/error-codes';
import { IsInt, Min } from 'class-validator';
import { PaginationQueryDto } from 'src/api/request.dto';
import { PlaylistItemDto } from 'src/playlists/dtos';
import { createPaginatedArrayResponseDto } from 'src/api/response.dto';

export class ListPlaylistItemsQueryDto extends PaginationQueryDto {
  /**
   * The database ID of the playlist
   */
  @IsInt({ message: ErrorCodes.INVALID_PLAYLIST_ID_ERROR })
  @Min(1, { message: ErrorCodes.INVALID_PLAYLIST_ID_ERROR })
  declare id: number;
}

export class ListPlaylistItemsResponseDto extends createPaginatedArrayResponseDto('playlistItems', PlaylistItemDto) {}
