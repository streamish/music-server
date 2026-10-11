/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { SynologyApiEnum, SynologyLibraryEnum, SynologyMethodEnum } from '../synology.enums';
import { SynologyBody } from '../synology.request.dto';
import { SynologySongDto } from './song.cgi.dto';
import { SynologySuccessResponseDto } from '../synology.response.dto';

class SearchBodyDto extends SynologyBody({
  expectedApi: SynologyApiEnum.SEARCH,
  expectedLibrary: SynologyLibraryEnum.ALL,
  expectedMethod: SynologyMethodEnum.LIST,
}) {}

export class SynologySearchBodyDto extends SearchBodyDto {
  /**
   * The search phrase to find in the library artists, tracks and albums
   */
  @IsString()
  @IsNotEmpty()
  declare keyword: string;
}

export class SynologySearchAlbumDto {
  @IsString()
  declare album_artist: string;

  @IsString()
  declare display_artist: string;

  @IsString()
  declare name: string;

  @IsString()
  declare artist: string;

  @IsInt()
  declare year: number;
}

export class SynologySearchArtistDto {
  @IsString()
  declare name: string;
}

export class SynologySearchDataDto {
  /**
   * The number of albums found matching the keyword search.
   */
  @IsInt()
  declare albumTotal: number;

  @ApiProperty({
    type: SynologySearchAlbumDto,
    isArray: true,
  })
  declare albums: SynologySearchAlbumDto[];

  /**
   * The number of artists found matching the keyword search.
   */
  @IsInt()
  declare artistTotal: number;

  @ApiProperty({
    type: SynologySearchArtistDto,
    isArray: true,
  })
  declare artists: SynologySearchArtistDto[];

  /**
   * The number of songs found matching the keyword search.
   */
  @IsInt()
  declare songTotal: number;

  @ApiProperty({
    type: SynologySongDto,
    isArray: true,
  })
  declare songs: SynologySongDto[];
}

export class SynologySearchResponseDto extends SynologySuccessResponseDto {
  @ApiProperty({
    type: SynologySearchDataDto,
  })
  declare data: SynologySearchDataDto;
}
