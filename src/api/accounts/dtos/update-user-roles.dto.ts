/* eslint-disable max-classes-per-file */
import { AdminAuthorizationBodyDto, IdQueryDtoFactory } from 'src/api/request.dto';
import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsEnum } from 'class-validator';
import { ErrorCodes } from 'src/constants/error-codes';
import { UserRoleEnum } from 'src/types/enums';

export class UpdateUserRolesQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_ACCOUNT_ID_ERROR) {}

export class UpdateUserRolesBodyDto extends AdminAuthorizationBodyDto {
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
