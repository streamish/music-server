import { ErrorCodes } from 'src/constants/error-codes';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { UserAuthorizationBodyDto } from 'src/api/request.dto';

export class UpdateUsernameBodyDto extends UserAuthorizationBodyDto {
  @IsString({ message: ErrorCodes.INVALID_USERNAME_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_USERNAME_LENGTH_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_USERNAME_ERROR })
  declare newUsername: string;
}
