/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestResponseDto, NotFoundResponseDto, SuccessResponseDto } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsString } from 'class-validator';

export class UserSetFolderFavoriteQueryDto {
  @IsString()
  declare folder: string;
}

export class UserSetFolderFavoriteResponseDto extends SuccessResponseDto {}

export class UserSetFolderFavoriteNotFoundResponseDto extends NotFoundResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.FOLDER_NOT_FOUND_ERROR],
    enumName: 'UserSetFolderFavoriteNotFoundErrorMessage',
    default: ErrorCodes.FOLDER_NOT_FOUND_ERROR,
  })
  declare message: ErrorCodes[];
}

export class UserSetFolderFavoriteBadRequestResponseDto extends BadRequestResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.INTERNAL_SERVER_ERROR],
    enumName: 'UserSetFolderFavoriteBadRequestErrorMessage',
    default: ErrorCodes.INTERNAL_SERVER_ERROR,
  })
  declare message: ErrorCodes[];
}
