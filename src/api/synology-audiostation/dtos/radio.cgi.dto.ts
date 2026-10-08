/* eslint-disable max-classes-per-file */
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, IsUrl } from 'class-validator';
import { ShoutcastItemTypeEnum } from 'src/types/enums';
import { SynologyApiEnum, SynologyMethodEnum } from '../synology.enums';
import { SynologyBody } from '../synology.request.dto';
import { SynologyPaginationResponseDto, SynologySuccessResponseDto } from '../synology.response.dto';
import { Transform } from 'class-transformer';

export class SynologyRadioContainerListBodyDto extends OmitType(
  SynologyBody({
    expectedApi: SynologyApiEnum.RADIO,
    expectedMethod: SynologyMethodEnum.LIST,
  }),
  ['library'],
) {
  /**
   * Refers to the position in the existing data, a value of `-1` indicates a new item.  This
   * is not the pagination offset.
   */
  @IsInt()
  declare offset: number;
}

export class SynologyRadioItemListBodyDto extends SynologyRadioContainerListBodyDto {
  /**
   * The name of the container
   */
  @IsString()
  declare container: string;
}

export class SynologyRadioFavoriteItemDto {
  @IsString()
  declare desc: string;

  @IsString()
  declare title: string;

  @IsString()
  @IsUrl()
  declare url: string;
}

export class SynologyRadioAddOrUpdateItemBodyDto extends OmitType(
  SynologyBody({
    expectedApi: SynologyApiEnum.RADIO,
    expectedMethod: SynologyMethodEnum.UPDATE_RADIOS,
  }),
  ['library'],
) {
  /**
   * The name of the container the favorite is in.
   */
  @IsString()
  declare container: string;

  /**
   * Refers to the position in the existing data, a value of `-1` indicates a new item.  This
   * is not the pagination offset.
   */
  @IsInt()
  declare offset: number;

  @ApiProperty({
    type: SynologyRadioFavoriteItemDto,
    isArray: true,
  })
  @Transform(({ value }) => {
    return JSON.parse(value);
  })
  declare radios_json: SynologyRadioFavoriteItemDto[];
}

export class SynologyRadioAddUserStationBodyDto extends OmitType(
  SynologyBody({
    expectedApi: SynologyApiEnum.RADIO,
    expectedMethod: SynologyMethodEnum.ADD,
  }),
  ['library'],
) {
  /**
   * The name of the container the user-defined station is in.
   */
  @IsString()
  declare container: string;

  /**
   * Refers to the position in the existing data, a value of `-1` indicates a new item.  This
   * is not the pagination offset.
   */
  @IsInt()
  declare offset: number;

  @IsString()
  declare title: string;

  @IsString()
  declare desc: string;

  @IsString()
  @IsUrl()
  declare url: string;
}

export class SynologyRadioItemDto {
  /**
   * The `desc` value is used for custom-added stations/favorites.
   */
  @IsString()
  declare desc: string;

  @IsString()
  declare id: string;

  @IsString()
  declare title: string;

  /**
   * The `type` value is expected to always be `container` for SHOUTcast genres, and
   * `radio` for actual stations.  Possibly other values for favorites and custom-added
   * stations.
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

export class SynologyRadioItemDataDto extends SynologyPaginationResponseDto {
  @ApiProperty({
    type: SynologyRadioItemDto,
    isArray: true,
  })
  declare radios: SynologyRadioItemDto[];
}

export class SynologyRadioItemResponseDto extends SynologySuccessResponseDto {
  @ApiProperty({
    type: SynologyRadioItemDataDto,
  })
  declare data: SynologyRadioItemDataDto;
}
