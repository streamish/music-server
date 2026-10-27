/* eslint-disable max-classes-per-file */
import { ErrorCodes } from 'src/constants/error-codes';
import { IsInt, IsNotEmpty, IsString, Length } from 'class-validator';
import { SuccessResponseDto } from 'src/api/response.dto';

export class CreatePlaylistBodyDto {
  /**
   * The name of the playlist.
   */
  @IsString({ message: ErrorCodes.INVALID_NAME_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_NAME_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_NAME_LENGTH_ERROR })
  declare name: string;
}

export class CreatePlaylistResponseDto extends SuccessResponseDto {
  @IsInt()
  declare playlistId: number;
}
