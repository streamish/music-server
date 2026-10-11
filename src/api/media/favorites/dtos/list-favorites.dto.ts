/* eslint-disable max-classes-per-file */
import { LibraryFavoriteDto } from 'src/library/dtos/library.favorite.dto';
import { PaginationQueryDto } from 'src/api/request.dto';
import { createPaginatedArrayResponseDto } from 'src/api/response.dto';

export class ListFavoritesQueryDto extends PaginationQueryDto {}

export class ListFavoritesResponseDto extends createPaginatedArrayResponseDto('favorites', LibraryFavoriteDto) {}
