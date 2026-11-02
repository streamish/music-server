/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import {
  PlaylistTypeEnum,
  SmartPlaylistConjugalEnum,
  SmartPlaylistFieldEnum,
  SmartPlaylistIntervalTagEnum,
  SmartPlaylistOperationEnum,
} from 'src/types/enums';

export class PlaylistRuleInputDto {
  @ApiProperty({ enum: SmartPlaylistFieldEnum, enumName: 'SmartPlaylistFieldEnum' })
  @IsEnum(SmartPlaylistFieldEnum)
  declare field: SmartPlaylistFieldEnum;

  @ApiProperty({ enum: SmartPlaylistOperationEnum, enumName: 'SmartPlaylistOperationEnum' })
  @IsEnum(SmartPlaylistOperationEnum)
  declare operation: SmartPlaylistOperationEnum;

  @IsString()
  declare value: string;

  @ApiProperty({
    enum: SmartPlaylistIntervalTagEnum,
    enumName: 'SmartPlaylistIntervalTagEnum',
    required: false,
    nullable: true,
  })
  @IsEnum(SmartPlaylistIntervalTagEnum)
  @IsOptional()
  declare interval?: SmartPlaylistIntervalTagEnum | null;
}

export class PlaylistRuleDto extends PlaylistRuleInputDto {
  @IsInt()
  declare id: number;
}

export class PlaylistDto {
  @IsInt()
  declare id: number;

  @IsString()
  declare name: string;

  @ApiProperty({ enum: PlaylistTypeEnum, enumName: 'PlaylistTypeEnum' })
  @IsEnum(PlaylistTypeEnum)
  declare type: PlaylistTypeEnum;

  /**
   * Whether tracks must match all rules or any rule. Only set for smart playlists.
   */
  @ApiProperty({
    enum: SmartPlaylistConjugalEnum,
    enumName: 'SmartPlaylistConjugalEnum',
    required: false,
    nullable: true,
  })
  @IsEnum(SmartPlaylistConjugalEnum)
  @IsOptional()
  declare rulesConjugal?: SmartPlaylistConjugalEnum | null;

  /**
   * The rules of a smart playlist. Only set for smart playlists.
   */
  @ApiProperty({ type: [PlaylistRuleDto], required: false })
  @IsOptional()
  declare rules?: PlaylistRuleDto[];

  @IsDate()
  declare createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time', required: false, nullable: true })
  @IsDate()
  @IsOptional()
  declare updatedAt?: Date | null;
}
