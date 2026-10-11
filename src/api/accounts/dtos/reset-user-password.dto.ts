/* eslint-disable max-classes-per-file */
import { AdminAuthorizationBodyDto, IdQueryDtoFactory } from 'src/api/request.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ResetUserPasswordQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_ACCOUNT_ID_ERROR) {}

export class ResetUserPasswordBodyDto extends AdminAuthorizationBodyDto {
  @IsString({ message: ErrorCodes.INVALID_NEW_PASSWORD_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_NEW_PASSWORD_LENGTH_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_NEW_PASSWORD_ERROR })
  declare newPassword: string;
}
