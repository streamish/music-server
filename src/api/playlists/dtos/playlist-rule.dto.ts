import { ApiProperty } from '@nestjs/swagger';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { SmartPlaylistFieldEnum, SmartPlaylistIntervalTagEnum, SmartPlaylistOperationEnum } from 'src/types/enums';

export class PlaylistRuleBodyDto {
  /**
   * The track field the rule is evaluated against.
   */
  @ApiProperty({ enum: SmartPlaylistFieldEnum, enumName: 'SmartPlaylistFieldEnum' })
  @IsEnum(SmartPlaylistFieldEnum, { message: ErrorCodes.INVALID_PLAYLIST_RULE_FIELD_ERROR })
  declare field: SmartPlaylistFieldEnum;

  /**
   * The comparison applied between the track field and the rule value.
   */
  @ApiProperty({ enum: SmartPlaylistOperationEnum, enumName: 'SmartPlaylistOperationEnum' })
  @IsEnum(SmartPlaylistOperationEnum, { message: ErrorCodes.INVALID_PLAYLIST_RULE_OPERATION_ERROR })
  declare operation: SmartPlaylistOperationEnum;

  /**
   * The value to compare against.
   */
  @IsString({ message: ErrorCodes.INVALID_PLAYLIST_RULE_VALUE_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_PLAYLIST_RULE_VALUE_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_PLAYLIST_RULE_VALUE_LENGTH_ERROR })
  declare value: string;

  /**
   * The time interval for `in_the_last` and `not_in_the_last` operations.
   */
  @ApiProperty({ enum: SmartPlaylistIntervalTagEnum, enumName: 'SmartPlaylistIntervalTagEnum', required: false })
  @IsEnum(SmartPlaylistIntervalTagEnum, { message: ErrorCodes.INVALID_PLAYLIST_RULE_INTERVAL_ERROR })
  @IsOptional()
  declare interval?: SmartPlaylistIntervalTagEnum;
}
