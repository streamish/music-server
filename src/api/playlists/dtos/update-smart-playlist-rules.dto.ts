/* eslint-disable max-classes-per-file */
import { CreateSmartPlaylistBodyDto } from './create-smart-playlist.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateSmartPlaylistRulesQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_PLAYLIST_ID_ERROR) {}

export class UpdateSmartPlaylistRulesBodyDto extends OmitType(CreateSmartPlaylistBodyDto, ['name'] as const) {}
