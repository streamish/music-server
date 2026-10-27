/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsInt, Min } from 'class-validator';
import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';

export class RemovePlaylistItemsQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_PLAYLIST_ID_ERROR) {}

export class RemovePlaylistItemsBodyDto {
  /**
   * The IDs of the playlist items to remove.
   */
  @ApiProperty({ type: 'array', items: { type: 'integer' } })
  @IsArray({ message: ErrorCodes.INVALID_PLAYLIST_ITEM_ID_ERROR })
  @ArrayNotEmpty({ message: ErrorCodes.INVALID_PLAYLIST_ITEM_ID_ERROR })
  @ArrayMaxSize(1000, { message: ErrorCodes.INVALID_PLAYLIST_ITEM_ID_ERROR })
  @IsInt({ each: true, message: ErrorCodes.INVALID_PLAYLIST_ITEM_ID_ERROR })
  @Min(1, { each: true, message: ErrorCodes.INVALID_PLAYLIST_ITEM_ID_ERROR })
  declare playlistItemIds: number[];
}
