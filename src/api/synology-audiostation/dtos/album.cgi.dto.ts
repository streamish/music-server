/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString } from 'class-validator';
import { SynologyApiEnum, SynologyLibraryEnum, SynologyMethodEnum } from '../synology.enums';
import { SynologyBodyWithPagination } from '../synology.request.dto';
import { SynologyPaginationResponseDto, SynologySuccessResponseDto } from '../synology.response.dto';
import type { RatingOrUnset } from 'src/types';

export class SynologyAlbumsBodyDto extends SynologyBodyWithPagination({
  expectedApi: SynologyApiEnum.ALBUM,
  expectedMethod: SynologyMethodEnum.LIST,
  expectedLibrary: SynologyLibraryEnum.ALL,
}) {}

export class SynologyAlbumsByArtistBodyDto extends SynologyAlbumsBodyDto {
  @IsString()
  declare artist: string;
}

export class SynologyAlbumsByArtistAndGenreBodyDto extends SynologyAlbumsBodyDto {
  @IsString()
  declare artist: string;

  @IsString()
  declare genre: string;
}

export class SynologyAlbumsByComposerBodyDto extends SynologyAlbumsBodyDto {
  /**
   * The name of the composer
   */
  @IsString()
  declare composer: string;
}

export class SynologyAlbumsByGenreBodyDto extends SynologyAlbumsBodyDto {
  /**
   * The name of the genre
   */
  @IsString()
  declare genre: string;
}

export class SynologyAlbumsByDefaultGenreBodyDto extends SynologyAlbumsBodyDto {
  /**
   * The name of the genre
   */
  @IsString()
  declare genre_filter: string;
}

export class SynologyAlbumsByArtistAndDefaultGenreBodyDto extends SynologyAlbumsBodyDto {
  @IsString()
  declare artist: string;

  @IsString()
  declare genre_filter: string;
}

class SynologyAlbumAverageRatingDto {
  @ApiProperty({
    type: 'integer',
  })
  @IsNumber()
  declare rating: RatingOrUnset;
}

class SynologyAlbumAdditionalDto {
  @ApiProperty({
    type: SynologyAlbumAverageRatingDto,
  })
  declare avg_rating: SynologyAlbumAverageRatingDto;
}

export class SynologyAlbumDto {
  /**
   * Additional data for the album to return in the response data.
   */
  @ApiProperty({
    type: SynologyAlbumAdditionalDto,
  })
  declare additional: SynologyAlbumAdditionalDto;

  /**
   * The artist for the album, which is all the album artists in a comma-delimited list
   */
  @IsString()
  declare album_artist: string;

  /**
   * The artist for the album, which is all the album artists in a comma-delimited list
   */
  @IsString()
  declare artist: string;

  /**
   * The display name of the artist, which is used for sorting and display consistency when albums
   * have a different artist name than the album artist name.  For example, a compilation album may have
   * multiple artists but the album artist is "Various Artists" and the display artist is "Various".
   */
  @IsString()
  declare display_artist: string;

  /**
   * The name or title of the album.
   */
  @IsString()
  declare name: string;

  /**
   * The year the album was released.
   */
  @IsInt()
  declare year: number;
}

export class SynologyAlbumDataDto extends SynologyPaginationResponseDto {
  /**
   * The list of albums returned by the Synology AudioStation API.  The number of albums returned is
   * limited by the `limit` value in the request body and the `offset` value in the request body
   * determines which albums are returned.
   */
  @ApiProperty({
    type: SynologyAlbumDto,
    isArray: true,
  })
  declare albums: SynologyAlbumDto[];
}

export class SynologyAlbumResponseDto extends SynologySuccessResponseDto {
  /**
   * The data payload returned by the Synology AudioStation API.  This includes the list of albums
   * and pagination information.
   */
  @ApiProperty({
    type: SynologyAlbumDataDto,
  })
  declare data: SynologyAlbumDataDto;
}
