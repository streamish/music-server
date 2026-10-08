/* eslint-disable max-classes-per-file */
import { ErrorCodes } from 'src/constants/error-codes';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { SuccessResponseDto } from 'src/api/response.dto';

export class UserUpdatePasswordBodyDto {
  @IsString({ message: ErrorCodes.INVALID_PASSWORD_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_PASSWORD_LENGTH_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_PASSWORD_ERROR })
  declare newPassword: string;
}

export class UserUpdatePasswordResponseDto extends SuccessResponseDto {}
