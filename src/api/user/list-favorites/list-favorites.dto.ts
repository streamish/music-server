/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestResponseDto, SuccessResponseDto } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsInt } from 'class-validator';
import { LibraryFavoriteDto } from 'src/library/dtos/library.favorite.dto';
import { PaginationQueryDto } from 'src/api/request.dto';

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

export class UserListFavoritesBadRequestResponseDto extends BadRequestResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.INTERNAL_SERVER_ERROR],
    enumName: 'UserListFavoritesBadRequestErrorMessage',
    default: ErrorCodes.INTERNAL_SERVER_ERROR,
  })
  declare message: ErrorCodes[];
}
