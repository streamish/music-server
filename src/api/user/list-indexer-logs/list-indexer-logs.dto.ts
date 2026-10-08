/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsDate, IsInt, IsOptional, IsString, Length } from 'class-validator';
import { SuccessResponseDto } from 'src/api/response.dto';

export class UserLogEntryDto {
  @IsDate()
  declare date: Date;

  @IsInt()
  declare rootPathId: number;

  @IsString()
  declare rootPath: string;

  @IsString()
  declare message: string;
}

export class UserListIndexerLogsQueryDto {
  @IsInt({ message: ErrorCodes.INVALID_ROOT_PATH_ID_ERROR })
  @IsOptional()
  rootPathId?: number;

  @IsString()
  @Length(1, 50, { message: ErrorCodes.INVALID_SEARCH_LENGTH_ERROR })
  @IsOptional()
  search?: string;
}

export class UserListIndexerLogsResponseDto extends SuccessResponseDto {
  @ApiProperty({
    type: UserLogEntryDto,
    isArray: true,
  })
  declare logs: UserLogEntryDto[];
}
