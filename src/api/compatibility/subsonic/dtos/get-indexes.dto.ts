/* eslint-disable max-classes-per-file */
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';
import { SubsonicArtistDto } from './artist.dto';
import { SubsonicResponseDto } from '../subsonic.dto';

export class SubsonicIndexesQueryDto {
  /**
   * Unix timestamp in milliseconds for the last modification time of the items.  This
   * value is currently ignored.
   */
  @IsInt()
  @IsOptional()
  ifModifiedSince?: number;

  /**
   * Optionally limit artist list to a single root path
   */
  @IsInt()
  @IsOptional()
  declare musicFolderId?: number;
}

@ApiExtraModels(SubsonicArtistDto)
export class SubsonicIndexesResponseDto extends SubsonicResponseDto {
  @ApiProperty({
    type: 'object',
    additionalProperties: {
      type: 'array',
      items: { $ref: getSchemaPath(SubsonicArtistDto) },
    },
  })
  declare indexes: Record<string, SubsonicArtistDto[]>;
}
