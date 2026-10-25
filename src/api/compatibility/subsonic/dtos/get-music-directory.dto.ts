/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';
import { SubsonicResponseDto } from '../subsonic.dto';

export class SubsonicMusicDirectoryQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_FOLDER_ID_ERROR) {}

export class SubsonicMusicDirectoryDto {
  @ApiProperty({ type: String })
  declare id: string;

  @ApiProperty({ type: String })
  declare name: string;
}

export class SubsonicMusicDirectoryDataDto {
  @ApiProperty({ type: SubsonicMusicDirectoryDto })
  declare musicFolder: SubsonicMusicDirectoryDto;
}

export class SubsonicMusicDirectoryResponseDto extends SubsonicResponseDto {
  @ApiProperty({ type: SubsonicMusicDirectoryDataDto })
  declare musicDirectory: SubsonicMusicDirectoryDataDto;
}
