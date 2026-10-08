/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';
import { LibraryAlbumWithTracksDto } from 'src/library/dtos/library.album.dto';
import { SuccessResponseDto } from 'src/api/response.dto';

export class UserRetrieveAlbumQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_ALBUM_ID_ERROR) {}

export class UserRetrieveAlbumResponseDto extends SuccessResponseDto {
  /**
   * The list of albums that match the query parameters, which may be limited by pagination.
   */
  @ApiProperty({
    type: LibraryAlbumWithTracksDto,
  })
  declare album: LibraryAlbumWithTracksDto;
}
