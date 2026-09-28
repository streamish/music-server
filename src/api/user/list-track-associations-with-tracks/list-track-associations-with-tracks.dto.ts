/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { LibraryAssociationWithTracksDto } from 'src/library/dtos';
import { SuccessResponseDto } from 'src/api/response.dto';
import {
  UserListTrackAssociationsBadRequestResponseDto,
  UserListTrackAssociationsQueryDto,
} from '../list-track-associations/list-track-associations.dto';

export class UserListTrackAssociationsWithTracksQueryDto extends UserListTrackAssociationsQueryDto {}

export class UserListTrackAssociationsWithTracksResponseDto extends SuccessResponseDto {
  /**
   * The list of associations that match the query parameters, which may be limited by pagination.
   */
  @ApiProperty({
    type: LibraryAssociationWithTracksDto,
    isArray: true,
  })
  declare items: LibraryAssociationWithTracksDto[];

  /**
   * The offset of the first association in the associations array, which may be greater than 0 if
   * pagination is applied.
   */
  @IsInt()
  declare offset: number;

  /**
   * The total number of associations that match the query parameters, which may be greater
   * than the number of associations returned in the associations array if pagination is applied.
   */
  @IsInt()
  declare total: number;
}

// eslint-disable-next-line max-len
export class UserListTrackAssociationsWithTracksBadRequestResponseDto extends UserListTrackAssociationsBadRequestResponseDto {}
