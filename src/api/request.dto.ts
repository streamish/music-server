/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsInt, IsNotEmpty, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class AdminAuthorizationBodyDto {
  /**
   * The administrator's password to authorize the operation.
   */
  @IsString({ message: ErrorCodes.INVALID_ADMIN_PASSWORD_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_ADMIN_PASSWORD_LENGTH_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_ADMIN_PASSWORD_ERROR })
  declare adminPassword: string;
}

export class PaginationQueryDto {
  /*
   * The number of results to return from the query.
   */
  @ApiProperty({ type: 'integer', required: false, default: 100_000 })
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({ message: ErrorCodes.INVALID_LIMIT_ERROR })
  @Min(1, { message: ErrorCodes.INVALID_LIMIT_ERROR })
  @Max(100_000, { message: ErrorCodes.INVALID_LIMIT_ERROR })
  @IsOptional()
  declare limit?: number;

  /*
   * The starting point of results returned for pagination within the total set of results.
   */
  @IsInt({ message: ErrorCodes.INVALID_OFFSET_ERROR })
  @ApiProperty({ type: 'integer', required: false, default: 0 })
  @Transform(({ value }) => parseInt(value, 10))
  @Min(0, { message: ErrorCodes.INVALID_OFFSET_ERROR })
  @IsOptional()
  declare offset?: number;
}

export function IdQueryDtoFactory(message: ErrorCodes) {
  class IdQueryDto {
    /**
     * The database ID of the resource
     */
    @IsInt({ message })
    @Min(1, { message })
    declare id: number;
  }
  return IdQueryDto;
}
