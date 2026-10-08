/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { SynologyApiEnum, SynologyLibraryEnum, SynologyMethodEnum } from '../synology.enums';
import { SynologyBodyWithPagination } from '../synology.request.dto';
import { SynologyPaginationResponseDto, SynologySuccessResponseDto } from '../synology.response.dto';
import type { RatingOrUnset } from 'src/types';

export class SynologyComposerBodyDto extends SynologyBodyWithPagination({
  expectedApi: SynologyApiEnum.COMPOSER,
  expectedMethod: SynologyMethodEnum.LIST,
  expectedLibrary: SynologyLibraryEnum.ALL,
}) {}

class SynologyAlbumComposerRatingDto {
  @ApiProperty({
    type: 'integer',
  })
  @IsNumber()
  declare rating: RatingOrUnset;
}

class SynologyAlbumAdditionalDto {
  @ApiProperty({
    type: SynologyAlbumComposerRatingDto,
  })
  declare artist_rating: SynologyAlbumComposerRatingDto;
}

export class SynologyComposerDto {
  @ApiProperty({
    type: SynologyAlbumAdditionalDto,
  })
  declare additional: SynologyAlbumAdditionalDto;

  @IsString()
  declare id: string;

  @IsString()
  declare name: string;
}

export class SynologyComposerDataDto extends SynologyPaginationResponseDto {
  @ApiProperty({
    type: SynologyComposerDto,
    isArray: true,
  })
  declare composers: SynologyComposerDto[];
}

export class SynologyComposerResponseDto extends SynologySuccessResponseDto {
  @ApiProperty({
    type: SynologyComposerDataDto,
  })
  declare data: SynologyComposerDataDto;
}
