/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';
import { SuccessResponseDto } from 'src/api/response.dto';
import { Type } from 'class-transformer';

export class AddPlaylistItemsQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_PLAYLIST_ID_ERROR) {}

export class PlaylistItemBodyDto {
  /**
   * The ID of a library track.  If specified the radio station fields are ignored.
   */
  @IsInt({ message: ErrorCodes.INVALID_TRACK_ID_ERROR })
  @Min(1, { message: ErrorCodes.INVALID_TRACK_ID_ERROR })
  @IsOptional()
  declare trackId?: number;

  /**
   * The title of a radio station, required if there is no track ID.
   */
  @IsString({ message: ErrorCodes.INVALID_SHOUTCAST_STATION_TITLE_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_SHOUTCAST_STATION_TITLE_LENGTH_ERROR })
  @ValidateIf((object) => object.trackId === undefined)
  declare radioStationTitle?: string;

  /**
   * The URL of a radio station, required if there is no track ID.
   */
  @IsUrl({ protocols: ['http', 'https'] }, { message: ErrorCodes.INVALID_SHOUTCAST_STATION_URL_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_SHOUTCAST_STATION_URL_LENGTH_ERROR })
  @ValidateIf((object) => object.trackId === undefined)
  declare radioStationUrl?: string;
}

export class AddPlaylistItemsBodyDto {
  /**
   * The tracks and/or radio stations to add.
   */
  @ApiProperty({ type: [PlaylistItemBodyDto] })
  @IsArray({ message: ErrorCodes.INVALID_PLAYLIST_ITEMS_ERROR })
  @ArrayNotEmpty({ message: ErrorCodes.INVALID_PLAYLIST_ITEMS_ERROR })
  @ArrayMaxSize(1000, { message: ErrorCodes.INVALID_PLAYLIST_ITEMS_ERROR })
  @ValidateNested({ each: true })
  @Type(() => PlaylistItemBodyDto)
  declare items: PlaylistItemBodyDto[];

  /**
   * The zero-based position to insert at.  If omitted or beyond the end the items are appended.
   */
  @ApiProperty({ type: 'integer', required: false })
  @IsInt({ message: ErrorCodes.INVALID_PLAYLIST_ITEM_OFFSET_ERROR })
  @Min(0, { message: ErrorCodes.INVALID_PLAYLIST_ITEM_OFFSET_ERROR })
  @IsOptional()
  declare offset?: number;
}

export class AddPlaylistItemsResponseDto extends SuccessResponseDto {
  /**
   * The IDs of the created playlist items in the order they were supplied.
   */
  @ApiProperty({ type: 'array', items: { type: 'integer' } })
  @IsArray()
  declare playlistItemIds: number[];
}
