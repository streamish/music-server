/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestResponseDto, NotFoundResponseDto, SuccessResponseDto } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsInt, IsString, Length, Min } from 'class-validator';

export class UserSetArtistNameQueryDto {
  /**
   * The ID of the artist
   */
  @IsInt({ message: ErrorCodes.INVALID_ARTIST_ID_ERROR })
  @Min(1, { message: ErrorCodes.INVALID_ARTIST_ID_ERROR })
  declare id: number;
}

export class UserSetArtistNameBodyDto {
  /**
   * Assigns a new value to the artist name.  If an empty string is provided it will erase the
   * custom value.
   */
  @IsString({ message: ErrorCodes.INVALID_NAME_ERROR })
  @Length(1, 1000, { message: ErrorCodes.INVALID_NAME_LENGTH_ERROR })
  declare name: string;
}

export class UserSetArtistNameResponseDto extends SuccessResponseDto {}

export class UserSetArtistNameNotFoundResponseDto extends NotFoundResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.ARTIST_NOT_FOUND_ERROR],
    enumName: 'UserSetArtistNameNotFoundErrorMessage',
    default: ErrorCodes.ARTIST_NOT_FOUND_ERROR,
  })
  declare message: ErrorCodes[];
}

export class UserSetArtistNameBadRequestResponseDto extends BadRequestResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.INVALID_ARTIST_ID_ERROR, ErrorCodes.INVALID_NAME_ERROR, ErrorCodes.INVALID_NAME_LENGTH_ERROR],
    enumName: 'UserSetArtistNameBadRequestErrorMessage',
    default: ErrorCodes.INVALID_ARTIST_ID_ERROR,
  })
  declare message: ErrorCodes[];
}
