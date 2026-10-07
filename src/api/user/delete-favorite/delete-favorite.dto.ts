/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestResponseDto, NotFoundResponseDto, SuccessResponseDto } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsInt, Min } from 'class-validator';

export class UserDeleteFavoriteQueryDto {
  /**
   * The ID of the favorite item to be deleted
   */
  @IsInt({ message: ErrorCodes.INVALID_FAVORITE_ITEM_ID_ERROR })
  @Min(1, { message: ErrorCodes.INVALID_FAVORITE_ITEM_ID_ERROR })
  declare id: number;
}

export class UserDeleteFavoriteResponseDto extends SuccessResponseDto {}

export class UserDeleteFavoriteNotFoundResponseDto extends NotFoundResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.FAVORITE_ITEM_NOT_FOUND_ERROR],
    enumName: 'UserDeleteFavoriteNotFoundErrorMessage',
    default: ErrorCodes.FAVORITE_ITEM_NOT_FOUND_ERROR,
  })
  declare message: ErrorCodes[];
}

export class UserDeleteFavoriteBadRequestResponseDto extends BadRequestResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.INVALID_FAVORITE_ITEM_ID_ERROR],
    enumName: 'UserDeleteFavoriteBadRequestErrorMessage',
    default: ErrorCodes.INVALID_FAVORITE_ITEM_ID_ERROR,
  })
  declare message: ErrorCodes[];
}
