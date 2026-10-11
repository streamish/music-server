/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString } from 'class-validator';
import { SynologyApiEnum, SynologyLibraryEnum, SynologyMethodEnum } from '../synology.enums';
import { SynologyBodyWithPagination } from '../synology.request.dto';
import { SynologyPaginationResponseDto, SynologySuccessResponseDto } from '../synology.response.dto';
import type { RatingOrUnset } from 'src/types';

class GenreBodyDto extends SynologyBodyWithPagination({
  expectedApi: SynologyApiEnum.GENRE,
  expectedMethod: SynologyMethodEnum.LIST,
  expectedLibrary: SynologyLibraryEnum.ALL,
}) {}

export class SynologyGenreBodyDto extends GenreBodyDto {}

class SynologyAlbumGenreRatingDto {
  @ApiProperty({
    type: 'integer',
  })
  @IsNumber()
  declare rating: RatingOrUnset;
}

class SynologyAlbumAdditionalDto {
  @ApiProperty({
    type: SynologyAlbumGenreRatingDto,
  })
  declare artist_rating: SynologyAlbumGenreRatingDto;
}

export class SynologyGenreDto {
  @ApiProperty({
    type: SynologyAlbumAdditionalDto,
  })
  declare additional: SynologyAlbumAdditionalDto;

  @IsString()
  declare id: string;

  @IsString()
  declare name: string;
}

export class SynologyGenreDataDto extends SynologyPaginationResponseDto {
  @ApiProperty({
    type: SynologyGenreDto,
    isArray: true,
  })
  declare genres: SynologyGenreDto[];
}

export class SynologyGenreResponseDto extends SynologySuccessResponseDto {
  @ApiProperty({
    type: SynologyGenreDataDto,
  })
  declare data: SynologyGenreDataDto;
}

export class SynologyDefaultGenreDto {
  @IsString()
  declare name: string;
}

export class SynologyDefaultGenreDataDto {
  @ApiProperty({
    type: SynologyDefaultGenreDto,
    isArray: true,
  })
  declare default_genres: SynologyDefaultGenreDto[];

  @IsInt()
  declare total: number;
}

export class SynologyDefaultGenreResponseDto extends SynologySuccessResponseDto {
  @ApiProperty({
    type: SynologyDefaultGenreDataDto,
  })
  declare data: SynologyDefaultGenreDataDto;
}
