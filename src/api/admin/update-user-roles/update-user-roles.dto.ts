/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';
import { SuccessResponseDto } from 'src/api/response.dto';
import { UserRoleEnum } from 'src/types/enums';

export class AdminUpdateUserRolesQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_ACCOUNT_ID_ERROR) {}

export class AdminUpdateUserRolesBodyDto {
  /**
   * The administrator's password to authorize the change
   */
  @IsString({ message: ErrorCodes.INVALID_ADMIN_PASSWORD_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_ADMIN_PASSWORD_LENGTH_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_ADMIN_PASSWORD_ERROR })
  declare adminPassword: string;

  @ApiProperty({
    enum: UserRoleEnum,
    enumName: 'UserRoleEnum',
    isArray: true,
  })
  @IsEnum(UserRoleEnum, {
    each: true,
    message: ErrorCodes.INVALID_ROLE_ERROR,
  })
  @ArrayNotEmpty({ message: ErrorCodes.INVALID_USER_ROLE_ERROR })
  declare roles: UserRoleEnum[];
}

export class AdminUpdateUserRolesResponseDto extends SuccessResponseDto {}
