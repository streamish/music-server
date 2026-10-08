/* eslint-disable max-classes-per-file */
import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';
import { IsString } from 'class-validator';
import { SuccessResponseDto } from 'src/api/response.dto';

export class AdminCreateRootPathQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_ACCOUNT_ID_ERROR) {}

export class AdminCreateRootPathBodyDto {
  /**
   * The fully-qualified path to set for the root path
   */
  @IsString({ message: ErrorCodes.INVALID_ROOT_PATH_ERROR })
  declare rootPath: string;
}

export class AdminCreateRootPathResponseDto extends SuccessResponseDto {}
