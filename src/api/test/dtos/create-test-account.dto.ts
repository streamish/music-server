/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { SuccessResponseDto } from 'src/api/response.dto';
import { TestAccountDto } from './test-account.dto';
import { UserRoleEnum } from 'src/types/enums';

export class CreateTestAccountBodyDto {
  /**
   * The username for signing in
   */
  @IsString()
  @Length(1, 255, { message: ErrorCodes.INVALID_USERNAME_LENGTH_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_USERNAME_ERROR })
  declare username: string;

  /**
   * The plain-text password the user will enter to sign in.  It will be hashed and securely-stored in the database.
   */
  @IsString({ message: ErrorCodes.INVALID_PASSWORD_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_PASSWORD_LENGTH_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_PASSWORD_ERROR })
  declare password: string;

  @ApiProperty({
    enum: UserRoleEnum,
    enumName: 'UserRoleEnum',
    isArray: true,
  })
  @IsEnum(UserRoleEnum, { each: true, message: ErrorCodes.INVALID_ROLE_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_USER_ROLE_ERROR })
  declare roles: UserRoleEnum[];
}

export class CreateTestAccountResponseDto extends SuccessResponseDto {
  @ApiProperty({
    type: TestAccountDto,
  })
  declare account: TestAccountDto;
}
