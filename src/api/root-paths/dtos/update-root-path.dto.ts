/* eslint-disable max-classes-per-file */
import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateRootPathQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_ROOT_PATH_ID_ERROR) {}

export class UpdateRootPathBodyDto {
  /**
   * The new path to set for the root path
   */
  @IsString({ message: ErrorCodes.INVALID_ROOT_PATH_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_ROOT_PATH_ERROR })
  declare newPath: string;
}
