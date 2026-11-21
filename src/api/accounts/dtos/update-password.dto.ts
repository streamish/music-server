import { ErrorCodes } from 'src/constants/error-codes';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { UserAuthorizationBodyDto } from 'src/api/request.dto';

export class UpdatePasswordBodyDto extends UserAuthorizationBodyDto {
  @IsString({ message: ErrorCodes.INVALID_PASSWORD_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_PASSWORD_LENGTH_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_PASSWORD_ERROR })
  declare newPassword: string;
}
