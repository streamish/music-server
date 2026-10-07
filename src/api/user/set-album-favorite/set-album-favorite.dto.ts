/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestResponseDto, NotFoundResponseDto, SuccessResponseDto } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsInt, Min } from 'class-validator';

export class UserSetAlbumFavoriteQueryDto {
  /**
   * The ID of the album
   */
  @IsInt({ message: ErrorCodes.INVALID_ALBUM_ID_ERROR })
  @Min(1, { message: ErrorCodes.INVALID_ALBUM_ID_ERROR })
  declare id: number;
}

export class UserSetAlbumFavoriteResponseDto extends SuccessResponseDto {}

export class UserSetAlbumFavoriteNotFoundResponseDto extends NotFoundResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.ALBUM_NOT_FOUND_ERROR],
    enumName: 'UserSetAlbumFavoriteNotFoundErrorMessage',
    default: ErrorCodes.ALBUM_NOT_FOUND_ERROR,
  })
  declare message: ErrorCodes[];
}

export class UserSetAlbumFavoriteBadRequestResponseDto extends BadRequestResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.INTERNAL_SERVER_ERROR],
    enumName: 'UserSetAlbumFavoriteBadRequestErrorMessage',
    default: ErrorCodes.INTERNAL_SERVER_ERROR,
  })
  declare message: ErrorCodes[];
}
