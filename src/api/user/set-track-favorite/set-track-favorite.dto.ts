/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestResponseDto, NotFoundResponseDto, SuccessResponseDto } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsInt } from 'class-validator';

export class UserSetTrackFavoriteQueryDto {
  /**
   * The ID of the track to mark as favorite
   */
  @IsInt({ message: ErrorCodes.INVALID_TRACK_ID_ERROR })
  declare id: number;
}

export class UserSetTrackFavoriteResponseDto extends SuccessResponseDto {}

export class UserSetTrackFavoriteNotFoundResponseDto extends NotFoundResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.TRACK_NOT_FOUND_ERROR],
    enumName: 'UserSetTrackFavoriteNotFoundErrorMessage',
    default: ErrorCodes.TRACK_NOT_FOUND_ERROR,
  })
  declare message: ErrorCodes[];
}

export class UserSetTrackFavoriteBadRequestResponseDto extends BadRequestResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.INTERNAL_SERVER_ERROR],
    enumName: 'UserSetTrackFavoriteBadRequestErrorMessage',
    default: ErrorCodes.INTERNAL_SERVER_ERROR,
  })
  declare message: ErrorCodes[];
}
