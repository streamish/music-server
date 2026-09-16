/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsInt, Min } from 'class-validator';
import { NotFoundResponseDto, SuccessResponseDto } from 'src/api/response.dto';

export class TestDeleteAccountQueryDto {
  /**
   * The ID of the account
   */
  @IsInt({ message: ErrorCodes.INVALID_ACCOUNT_ID_ERROR })
  @Min(1, { message: ErrorCodes.INVALID_ACCOUNT_ID_ERROR })
  declare id: number;
}

export class TestDeleteAccountResponseDto extends SuccessResponseDto {}

export class TestDeleteAccountNotFoundResponseDto extends NotFoundResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.INTERNAL_SERVER_ERROR, ErrorCodes.NOT_FOUND_ERROR],
    enumName: 'TestDeleteAccountNotFoundErrorMessage',
    default: ErrorCodes.INTERNAL_SERVER_ERROR,
  })
  declare message: ErrorCodes[];
}
