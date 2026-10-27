/* eslint-disable max-classes-per-file */
import { CreatePlaylistBodyDto } from './create-playlist.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';

export class UpdatePlaylistQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_PLAYLIST_ID_ERROR) {}

export class UpdatePlaylistBodyDto extends CreatePlaylistBodyDto {}
