/* eslint-disable max-classes-per-file */
import { ErrorCodes } from 'src/constants/error-codes';
import { IsString } from 'class-validator';
import { SuccessResponseDto } from 'src/api/response.dto';

export class UserCreateRootPathBodyDto {
  /**
   * The fully-qualified path to set for the root path
   */
  @IsString({ message: ErrorCodes.INVALID_ROOT_PATH_ERROR })
  declare rootPath: string;
}

export class UserCreateRootPathResponseDto extends SuccessResponseDto {}
