/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { SynologyApiEnum, SynologyLibraryEnum, SynologyMethodEnum } from '../synology.enums';
import { SynologyBodyWithPagination } from '../synology.request.dto';
import { SynologyPaginationResponseDto, SynologySuccessResponseDto } from '../synology.response.dto';
import type { RatingOrUnset } from 'src/types';

class ArtistBodyDto extends SynologyBodyWithPagination({
  expectedApi: SynologyApiEnum.ARTIST,
  expectedMethod: SynologyMethodEnum.LIST,
  expectedLibrary: SynologyLibraryEnum.ALL,
}) {}

export class SynologyArtistsBodyDto extends ArtistBodyDto {}

export class SynologyArtistsByGenreBodyDto extends ArtistBodyDto {
  @IsString()
  declare genre: string;
}

export class SynologyArtistsByDefaultGenreBodyDto extends ArtistBodyDto {
  @IsString()
  declare genre_filter: string;
}

class SynologyAlbumArtistRatingDto {
  @ApiProperty({
    type: 'integer',
  })
  @IsNumber()
  declare rating: RatingOrUnset;
}

class SynologyAlbumAdditionalDto {
  @ApiProperty({
    type: SynologyAlbumArtistRatingDto,
  })
  declare artist_rating: SynologyAlbumArtistRatingDto;
}

export class SynologyArtistDto {
  @ApiProperty({
    type: SynologyAlbumAdditionalDto,
  })
  declare additional: SynologyAlbumAdditionalDto;

  @IsString()
  declare id: string;

  @IsString()
  declare name: string;
}

export class SynologyArtistDataDto extends SynologyPaginationResponseDto {
  @ApiProperty({
    type: SynologyArtistDto,
    isArray: true,
  })
  declare artists: SynologyArtistDto[];
}

export class SynologyArtistResponseDto extends SynologySuccessResponseDto {
  @ApiProperty({
    type: SynologyArtistDataDto,
  })
  declare data: SynologyArtistDataDto;
}
