// eslint-disable-next-line max-classes-per-file
import { ErrorCodes } from 'src/constants/error-codes';
import { IsInt, IsNotEmpty, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { createItemResponseDto } from 'src/api/response.dto';

export class CreateSessionBodyDto {
  /**
   * The username for the account
   */
  @IsString({ message: ErrorCodes.INVALID_USERNAME_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_USERNAME_LENGTH_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_USERNAME_ERROR })
  declare username: string;

  /**
   * The password for the account
   */
  @IsString({ message: ErrorCodes.INVALID_PASSWORD_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_PASSWORD_LENGTH_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_PASSWORD_ERROR })
  declare password: string;

  /**
   * The number of days until the session expires
   */
  @IsInt({ message: ErrorCodes.INVALID_EXPIRES_AT_ERROR })
  @Min(0, { message: ErrorCodes.INVALID_EXPIRES_AT_RANGE_ERROR })
  @Max(3650, { message: ErrorCodes.INVALID_EXPIRES_AT_RANGE_ERROR })
  @IsOptional()
  declare expiresDays?: number;
}

export class CreateSessionResponseDto extends createItemResponseDto('jwtToken', String) {}
