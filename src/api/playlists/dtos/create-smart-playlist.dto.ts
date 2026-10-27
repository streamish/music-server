import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsEnum, ValidateNested } from 'class-validator';
import { CreatePlaylistBodyDto } from './create-playlist.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { PlaylistRuleBodyDto } from './playlist-rule.dto';
import { SmartPlaylistConjugalEnum } from 'src/types/enums';
import { Type } from 'class-transformer';

export class CreateSmartPlaylistBodyDto extends CreatePlaylistBodyDto {
  /**
   * Whether tracks must match all rules (`and`) or any rule (`or`).
   */
  @ApiProperty({ enum: SmartPlaylistConjugalEnum, enumName: 'SmartPlaylistConjugalEnum' })
  @IsEnum(SmartPlaylistConjugalEnum, { message: ErrorCodes.INVALID_PLAYLIST_RULES_CONJUGAL_ERROR })
  declare rulesConjugal: SmartPlaylistConjugalEnum;

  /**
   * The rules that determine which tracks belong to the playlist.
   */
  @ApiProperty({ type: [PlaylistRuleBodyDto] })
  @IsArray({ message: ErrorCodes.INVALID_PLAYLIST_RULES_ERROR })
  @ArrayMaxSize(100, { message: ErrorCodes.INVALID_PLAYLIST_RULES_ERROR })
  @ValidateNested({ each: true })
  @Type(() => PlaylistRuleBodyDto)
  declare rules: PlaylistRuleBodyDto[];
}
