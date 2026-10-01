/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { LibraryAssociationWithTracksDto } from 'src/library/dtos';
import { SuccessResponseDto } from 'src/api/response.dto';
import {
  UserListAlbumAssociationsBadRequestResponseDto,
  UserListAlbumAssociationsQueryDto,
} from '../list-album-associations/list-album-associations.dto';

export class UserListAlbumAssociationsWithTracksQueryDto extends UserListAlbumAssociationsQueryDto {}

export class UserListAlbumAssociationsWithTracksResponseDto extends SuccessResponseDto {
  /**
   * The list of albums that match the query parameters, which may be limited by pagination.
   */
  @ApiProperty({
    type: LibraryAssociationWithTracksDto,
    isArray: true,
  })
  declare associations: LibraryAssociationWithTracksDto[];

  /**
   * The offset of the first album in the albums array, which may be greater than 0 if
   * pagination is applied.
   */
  @IsInt()
  declare offset: number;

  /**
   * The total number of albums that match the query parameters, which may be greater
   * than the number of albums returned in the albums array if pagination is applied.
   */
  @IsInt()
  declare total: number;
}

// eslint-disable-next-line max-len
export class UserListAlbumAssociationsWithTracksBadRequestResponseDto extends UserListAlbumAssociationsBadRequestResponseDto {}
