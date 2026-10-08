/* eslint-disable max-classes-per-file */
import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';
import { IsString, Length } from 'class-validator';
import { SuccessResponseDto } from 'src/api/response.dto';

export class UserSetComposerNameQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_ASSOCIATION_ID_ERROR) {}

export class UserSetComposerNameBodyDto {
  /**
   * Assigns a new value to the composer name.  If an empty string is provided it will erase the
   * custom value.
   */
  @IsString({ message: ErrorCodes.INVALID_NAME_ERROR })
  @Length(1, 1000, { message: ErrorCodes.INVALID_NAME_LENGTH_ERROR })
  declare name: string;
}

export class UserSetComposerNameResponseDto extends SuccessResponseDto {}
