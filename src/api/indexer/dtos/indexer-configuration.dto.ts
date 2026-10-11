/* eslint-disable max-classes-per-file */
import { IsBoolean, IsDate, IsInt, IsString } from 'class-validator';
import { createItemResponseDto } from 'src/api/response.dto';

export class IndexerConfigurationDto {
  @IsInt()
  declare id: number;

  @IsBoolean()
  declare isEnabled: boolean;

  @IsDate()
  declare createdAt: Date;

  @IsInt()
  declare createdByAccountId: number;

  @IsString()
  declare createdByUsername: string;
}

export class IndexerConfigurationResponseDto extends createItemResponseDto('configuration', IndexerConfigurationDto) {}
