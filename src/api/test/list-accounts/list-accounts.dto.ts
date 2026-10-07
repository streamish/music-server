/* eslint-disable max-classes-per-file */
import { AccountEntity } from 'src/database/entities/account.entity';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { BadRequestResponseDto, NotFoundResponseDto, SuccessResponseDto } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';

export class TestListAccountDto extends PickType(AccountEntity, ['id', 'username', 'roles'] as const) {}

export class TestListAccountsResponseDto extends SuccessResponseDto {
  @ApiProperty({ type: [TestListAccountDto] })
  declare accounts: TestListAccountDto[];
}

export class TestListAccountsNotFoundResponseDto extends NotFoundResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.INTERNAL_SERVER_ERROR, ErrorCodes.NOT_FOUND_ERROR],
    enumName: 'TestListAccountsNotFoundErrorMessage',
    default: ErrorCodes.INTERNAL_SERVER_ERROR,
  })
  declare message: ErrorCodes[];
}

export class TestListAccountsBadRequestResponseDto extends BadRequestResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.INTERNAL_SERVER_ERROR],
    enumName: 'TestListAccountsBadRequestErrorMessage',
    default: ErrorCodes.INTERNAL_SERVER_ERROR,
  })
  declare message: ErrorCodes[];
}
