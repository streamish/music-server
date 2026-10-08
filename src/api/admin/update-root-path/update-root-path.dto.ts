/* eslint-disable max-classes-per-file */
import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';
import { IsNotEmpty, IsString } from 'class-validator';
import { SuccessResponseDto } from 'src/api/response.dto';

export class AdminUpdateRootPathQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_ROOT_PATH_ID_ERROR) {}

export class AdminUpdateRootPathBodyDto {
  /**
   * The new path to set for the root path
   */
  @IsString({ message: ErrorCodes.INVALID_ROOT_PATH_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_ROOT_PATH_ERROR })
  declare newPath: string;
}

export class AdminUpdateRootPathResponseDto extends SuccessResponseDto {}
