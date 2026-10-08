/* eslint-disable max-classes-per-file */
import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsString, ValidateIf } from 'class-validator';
import { SynologyApiEnum, SynologyMethodEnum, SynologyPinTypeEnum } from '../synology.enums';
import { SynologyBody, SynologyBodyWithPagination } from '../synology.request.dto';
import { SynologyPaginationResponseDto, SynologySuccessResponseDto } from '../synology.response.dto';
import { Transform } from 'class-transformer';

class SynologyEntryPinItemCriteriaDto {
  @IsString()
  album?: string;

  @IsString()
  album_artist?: string;

  @IsString()
  artist?: string;

  @IsString()
  composer?: string;

  @IsInt()
  @Transform(({ value }) => Number.parseInt(value, 10))
  @ValidateIf((o) => o.folder?.length)
  folder?: string;

  @IsString()
  genre?: string;

  @IsString()
  playlist?: string;
}

export class SynologyEntryNewPinItemDto {
  @ApiProperty({
    type: SynologyEntryPinItemCriteriaDto,
  })
  declare criteria: SynologyEntryPinItemCriteriaDto;

  @IsString()
  declare name: string;

  @ApiProperty({
    enum: SynologyPinTypeEnum,
    enumName: 'SynologyPinTypeEnum',
  })
  @IsEnum(SynologyPinTypeEnum)
  declare type: SynologyPinTypeEnum;
}

export class SynologyEntryPinItemDto extends PickType(SynologyEntryNewPinItemDto, ['criteria', 'name', 'type']) {
  @IsString()
  declare id: string;
}

export class SynologyEntryListPinsBodyDto extends OmitType(
  SynologyBodyWithPagination({
    expectedApi: SynologyApiEnum.PIN,
    expectedMethod: SynologyMethodEnum.LIST,
  }),
  ['library'],
) {}

export class SynologyEntryCreatePinBodyDto extends OmitType(
  SynologyBody({
    expectedApi: SynologyApiEnum.PIN,
    expectedMethod: SynologyMethodEnum.PIN,
  }),
  ['library'],
) {
  /**
   * List of item details to pin
   */
  @ApiProperty({
    type: SynologyEntryNewPinItemDto,
    isArray: true,
  })
  @Transform(({ value }) => {
    const parsed = value.substring ? JSON.parse(value) : value;
    return parsed.map((item: SynologyEntryNewPinItemDto) => ({
      ...item,
      type: item.type as SynologyPinTypeEnum,
    }));
  })
  declare items: SynologyEntryNewPinItemDto[];
}

export class SynologyEntryDeletePinBodyDto extends OmitType(
  SynologyBody({
    expectedApi: SynologyApiEnum.PIN,
    expectedMethod: SynologyMethodEnum.UNPIN,
  }),
  ['library'],
) {
  /**
   * List of item IDs to unpin
   */
  @ApiProperty({
    isArray: true,
  })
  @IsNumber(undefined, { each: true })
  @Transform(({ value }) => JSON.parse(value).map((id: string) => Number.parseInt(id, 10)))
  declare items: number[];
}

export class SynologyEntryPinsDataDto extends SynologyPaginationResponseDto {
  @ApiProperty({
    type: SynologyEntryPinItemDto,
    isArray: true,
  })
  declare items: SynologyEntryPinItemDto[];
}

export class SynologyEntryListPinsResponseDto extends SynologySuccessResponseDto {
  @ApiProperty({
    type: SynologyEntryPinsDataDto,
  })
  declare data: SynologyEntryPinsDataDto;
}
