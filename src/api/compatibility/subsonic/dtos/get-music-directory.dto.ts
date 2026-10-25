/* eslint-disable max-classes-per-file */
import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';
import { SubsonicResponseDto } from '../subsonic.dto';

export class SubsonicMusicDirectoryQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_FOLDER_ID_ERROR) {}

export class SubsonicMusicDirectoryResponseDto extends SubsonicResponseDto {
  declare musicDirectory: { musicFolder: { id: string; name: string } };
}
