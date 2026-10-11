/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsDate, IsInt, IsOptional, IsString, Length } from 'class-validator';
import { SuccessResponseDto } from 'src/api/response.dto';

export class LogEntryDto {
  @IsDate()
  declare date: Date;

  @IsInt()
  declare rootPathId: number;

  @IsString()
  declare rootPath: string;

  @IsString()
  declare message: string;
}

export class ListIndexerLogsQueryDto {
  @IsInt({ message: ErrorCodes.INVALID_ROOT_PATH_ID_ERROR })
  @IsOptional()
  rootPathId?: number;

  @IsString()
  @Length(1, 50, { message: ErrorCodes.INVALID_SEARCH_LENGTH_ERROR })
  @IsOptional()
  search?: string;
}

export class ListIndexerLogsResponseDto extends SuccessResponseDto {
  @ApiProperty({
    type: LogEntryDto,
    isArray: true,
  })
  declare logs: LogEntryDto[];
}

export class LogWithUserEntryDto extends LogEntryDto {
  /**
   * The username the indexer action was for.
   */
  @IsString()
  declare username: string;
}

export class ListIndexerLogsWithUserQueryDto extends ListIndexerLogsQueryDto {
  @IsInt({ message: ErrorCodes.INVALID_ACCOUNT_ID_ERROR })
  @IsOptional()
  accountId?: number;
}

export class ListIndexerLogsWithUserResponseDto extends SuccessResponseDto {
  @ApiProperty({
    type: LogWithUserEntryDto,
    isArray: true,
  })
  declare logs: LogWithUserEntryDto[];
}
