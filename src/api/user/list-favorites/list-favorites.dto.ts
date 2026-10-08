/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { LibraryFavoriteDto } from 'src/library/dtos/library.favorite.dto';
import { PaginationQueryDto } from 'src/api/request.dto';
import { SuccessResponseDto } from 'src/api/response.dto';

export class UserListFavoritesQueryDto extends PaginationQueryDto {}

export class UserListFavoritesResponseDto extends SuccessResponseDto {
  /**
   * The list of favorites that match the query parameters, which may be limited by pagination.
   */
  @ApiProperty({
    type: LibraryFavoriteDto,
    isArray: true,
  })
  declare favorites: LibraryFavoriteDto[];

  /**
   * The offset of the first favorite in the favorites array, which may be greater than 0 if
   * pagination is applied.
   */
  @IsInt()
  declare offset: number;

  /**
   * The total number of favorites that match the query parameters, which may be greater
   * than the number of favorites returned in the favorites array if pagination is applied.
   */
  @IsInt()
  declare total: number;
}
