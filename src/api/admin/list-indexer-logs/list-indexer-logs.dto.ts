/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsDate, IsInt, IsOptional, IsString, Length } from 'class-validator';
import { SuccessResponseDto } from 'src/api/response.dto';

export class AdminLogEntryDto {
  @IsInt()
  declare accountId: number;

  @IsDate()
  declare date: Date;

  @IsString()
  declare username: string;

  @IsInt()
  declare rootPathId: number;

  @IsString()
  declare rootPath: string;

  @IsString()
  declare message: string;
}

export class AdminListIndexerLogsQueryDto {
  @IsInt({ message: ErrorCodes.INVALID_ACCOUNT_ID_ERROR })
  @IsOptional()
  accountId?: number;

  @IsInt({ message: ErrorCodes.INVALID_ROOT_PATH_ID_ERROR })
  @IsOptional()
  rootPathId?: number;

  @IsString()
  @Length(1, 50, { message: ErrorCodes.INVALID_SEARCH_LENGTH_ERROR })
  @IsOptional()
  search?: string;
}

export class AdminListIndexerLogsResponseDto extends SuccessResponseDto {
  @ApiProperty({
    type: AdminLogEntryDto,
    isArray: true,
  })
  declare logs: AdminLogEntryDto[];
}
