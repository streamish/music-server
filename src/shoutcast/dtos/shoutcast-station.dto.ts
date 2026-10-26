import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, IsUrl } from 'class-validator';
import { ShoutcastItemTypeEnum } from 'src/types/enums';

export class ShoutcastStationDto {
  /**
   * The favorite data for the station if it exists
   */
  @IsInt()
  declare favoriteId?: number;

  @IsInt()
  declare id: number;

  /**
   * The number of times the station has been played.
   */
  @IsInt()
  declare playCount: number;

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
