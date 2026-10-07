/* eslint-disable max-classes-per-file */
import { AccountEntity } from 'src/database/entities/account.entity';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { BadRequestResponseDto, NotFoundResponseDto, SuccessResponseDto } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsInt, Min } from 'class-validator';

export class TestRetrieveAccountDto extends PickType(AccountEntity, ['id', 'username', 'roles'] as const) {}

export class TestRetrieveAccountQueryDto {
  /**
   * The ID of the account
   */
  @IsInt({ message: ErrorCodes.INVALID_ACCOUNT_ID_ERROR })
  @Min(1, { message: ErrorCodes.INVALID_ACCOUNT_ID_ERROR })
  declare id: number;
}

export class TestRetrieveAccountResponseDto extends SuccessResponseDto {
  @ApiProperty({ type: TestRetrieveAccountDto })
  declare account: TestRetrieveAccountDto;
}

export class TestRetrieveAccountNotFoundResponseDto extends NotFoundResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.INVALID_ACCOUNT_ID_ERROR],
    enumName: 'TestRetrieveAccountNotFoundErrorMessage',
    default: ErrorCodes.INVALID_ACCOUNT_ID_ERROR,
  })
  declare message: ErrorCodes[];
}

export class TestRetrieveAccountBadRequestResponseDto extends BadRequestResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.INTERNAL_SERVER_ERROR],
    enumName: 'TestRetrieveAccountBadRequestErrorMessage',
    default: ErrorCodes.INTERNAL_SERVER_ERROR,
  })
  declare message: ErrorCodes[];
}
