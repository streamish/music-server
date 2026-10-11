/* eslint-disable max-classes-per-file */
import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';
import { LibraryAlbumWithTracksDto } from 'src/library/dtos/library.album.dto';
import { createItemResponseDto } from 'src/api/response.dto';

export class RetrieveAlbumQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_ALBUM_ID_ERROR) {}

export class RetrieveAlbumResponseDto extends createItemResponseDto('album', LibraryAlbumWithTracksDto) {}
