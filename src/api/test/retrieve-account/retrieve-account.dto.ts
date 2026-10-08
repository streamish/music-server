/* eslint-disable max-classes-per-file */
import { AccountEntity } from 'src/database/entities/account.entity';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { BadRequestResponseDto, NotFoundResponseDtoFactory, SuccessResponseDto } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { UserRoleEnum } from 'src/types/enums';

export class TestRetrieveAccountDto extends PickType(AccountEntity, ['id', 'username'] as const) {
  @ApiProperty({ enum: UserRoleEnum, enumName: 'UserRoleEnum', isArray: true })
  declare roles: UserRoleEnum[];
}

export class TestRetrieveAccountQueryDto {
  /**
   * The username of the account
   */
  @IsString()
  @Length(1, 255, { message: ErrorCodes.INVALID_USERNAME_LENGTH_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_USERNAME_ERROR })
  declare username: string;
}

export class TestRetrieveAccountResponseDto extends SuccessResponseDto {
  @ApiProperty({ type: TestRetrieveAccountDto })
  declare account: TestRetrieveAccountDto;
}

export class TestRetrieveAccountNotFoundResponseDto extends NotFoundResponseDtoFactory('', '', [
  ErrorCodes.ACCOUNT_NOT_FOUND_ERROR,
]) {}

export class TestRetrieveAccountBadRequestResponseDto extends BadRequestResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.INVALID_USERNAME_ERROR, ErrorCodes.INVALID_USERNAME_LENGTH_ERROR],
    enumName: 'TestRetrieveAccountBadRequestErrorMessage',
    default: ErrorCodes.INVALID_USERNAME_ERROR,
  })
  declare message: ErrorCodes[];
}
