/* eslint-disable max-classes-per-file */
import { IsBoolean, IsDate, IsInt, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { createItemResponseDto } from 'src/api/response.dto';

export class IndexerConfigurationDto {
  /**
   * The unique identifier for this indexer configuration.
   */
  @ApiProperty({ type: 'integer' })
  @IsInt()
  declare id: number;

  /**
   * Flag for whether this configuration has the indexer active or inactive.
   */
  @IsBoolean()
  declare isEnabled: boolean;

  /**
   * The date and time when this configuration was created.
   */
  @ApiProperty({ type: 'string', format: 'date-time' })
  @IsDate()
  declare createdAt: Date;

  /**
   * The ID of the account that created this configuration.
   */
  @IsInt()
  declare createdByAccountId: number;

  /**
   * The username of the account that created this configuration.
   */
  @IsString()
  declare createdByUsername: string;
}

export class IndexerConfigurationResponseDto extends createItemResponseDto('configuration', IndexerConfigurationDto) {}
