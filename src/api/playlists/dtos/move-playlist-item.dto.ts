/* eslint-disable max-classes-per-file */
import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';
import { IsInt, Min } from 'class-validator';

export class MovePlaylistItemQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_PLAYLIST_ID_ERROR) {}

export class MovePlaylistItemBodyDto {
  /**
   * The ID of the playlist item to move.
   */
  @IsInt({ message: ErrorCodes.INVALID_PLAYLIST_ITEM_ID_ERROR })
  @Min(1, { message: ErrorCodes.INVALID_PLAYLIST_ITEM_ID_ERROR })
  declare playlistItemId: number;

  /**
   * The zero-based position the item will have after the move.  Values beyond the end move the item to the end.
   */
  @IsInt({ message: ErrorCodes.INVALID_PLAYLIST_ITEM_OFFSET_ERROR })
  @Min(0, { message: ErrorCodes.INVALID_PLAYLIST_ITEM_OFFSET_ERROR })
  declare offset: number;
}
