/* eslint-disable max-classes-per-file */
import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { SuccessResponseDto } from 'src/api/response.dto';

export class AdminDeleteAccountQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_ACCOUNT_ID_ERROR) {}

export class AdminDeleteAccountBodyDto {
  /**
   * The administrator's password to authorize the change
   */
  @IsString({ message: ErrorCodes.INVALID_ADMIN_PASSWORD_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_ADMIN_PASSWORD_LENGTH_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_ADMIN_PASSWORD_ERROR })
  declare adminPassword: string;
}

export class AdminDeleteAccountResponseDto extends SuccessResponseDto {}
