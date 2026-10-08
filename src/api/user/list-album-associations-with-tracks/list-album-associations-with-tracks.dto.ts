/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { LibraryAssociationWithTracksDto } from 'src/library/dtos';
import { SuccessResponseDto } from 'src/api/response.dto';
import { UserListAlbumAssociationsQueryDto } from '../list-album-associations/list-album-associations.dto';

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
