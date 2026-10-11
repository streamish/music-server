/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { LibraryFavoriteDto } from 'src/library/dtos/library.favorite.dto';
import { PaginatedResponseDataDto } from 'src/api/response.dto';
import { PaginationQueryDto } from 'src/api/request.dto';

export class ListFavoritesQueryDto extends PaginationQueryDto {}

export class ListFavoritesResponseDto extends PaginatedResponseDataDto {
  @ApiProperty({
    type: LibraryFavoriteDto,
    isArray: true,
  })
  declare favorites: LibraryFavoriteDto[];
}
