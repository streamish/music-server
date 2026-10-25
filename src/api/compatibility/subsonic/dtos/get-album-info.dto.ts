/* eslint-disable max-classes-per-file */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { SubsonicResponseDto } from '../subsonic.dto';
import { Type } from 'class-transformer';

export class SubsonicAlbumInfoDto {
  @ApiPropertyOptional({ type: String })
  declare notes?: string;

  @ApiPropertyOptional({ type: String })
  declare musicBrainzId?: string;

  @ApiPropertyOptional({ type: String })
  declare lastFmUrl?: string;

  @ApiPropertyOptional({ type: String })
  declare smallImageUrl?: string;

  @ApiPropertyOptional({ type: String })
  declare mediumImageUrl?: string;

  @ApiPropertyOptional({ type: String })
  declare largeImageUrl?: string;
}

export class SubsonicAlbumInfoQueryDto {
  @IsInt()
  @Type(() => Number)
  declare id: number;
}

export class SubsonicAlbumInfoResponseDto extends SubsonicResponseDto {
  @ApiProperty({ type: SubsonicAlbumInfoDto })
  declare albumInfo: SubsonicAlbumInfoDto;
}
