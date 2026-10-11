/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';
import { LibraryAlbumWithTracksDto } from 'src/library/dtos/library.album.dto';
import { SuccessResponseDto } from 'src/api/response.dto';

export class RetrieveAlbumQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_ALBUM_ID_ERROR) {}

export class RetrieveAlbumResponseDto extends SuccessResponseDto {
  @ApiProperty({
    type: LibraryAlbumWithTracksDto,
  })
  declare album: LibraryAlbumWithTracksDto;
}
