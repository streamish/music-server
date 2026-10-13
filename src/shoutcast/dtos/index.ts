/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { ShoutcastItemTypeEnum } from 'src/types/enums';

export class ShoutcastGenreDto {
  @IsString()
  declare id: number;

  @IsString()
  declare name: string;
}

export class ShoutcastStationDto {
  /**
   * Only used for custom-added stations/favorites.
   */
  @IsString()
  declare description: string;

  @IsString()
  declare id: number;

  @IsString()
  declare title: string;

  /**
   * The `type` value is `container` for SHOUTcast genres, and
   * `radio` for actual stations.
   */
  @ApiProperty({
    enum: ShoutcastItemTypeEnum,
    enumName: 'ShoutcastItemTypeEnum',
  })
  @IsEnum(ShoutcastItemTypeEnum)
  declare type: ShoutcastItemTypeEnum;

  /**
   * The `url` value is expected to always be an empty string for SHOUTcast genres.
   */
  @IsString()
  @IsUrl()
  @IsOptional()
  declare url: string;
}

export class ShoutcastContainerDto {
  @IsString()
  declare id: number;

  @IsString()
  declare title: string;
}
