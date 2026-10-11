/* eslint-disable max-classes-per-file */
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { ContentTypeEnum, FileTypeEnum } from 'src/types/enums';
import { IsEnum, IsInt, IsNumber, IsString, Max, Min } from 'class-validator';
import { SynologyApiEnum, SynologyLibraryEnum, SynologyMethodEnum } from '../synology.enums';
import { SynologyBody, SynologyBodyWithPagination } from '../synology.request.dto';
import { SynologyPaginationResponseDto, SynologySuccessResponseDto } from '../synology.response.dto';
import { Transform } from 'class-transformer';
import type { RatingOrUnset } from 'src/types';

export class SynologySongsBodyDto extends SynologyBodyWithPagination({
  expectedApi: SynologyApiEnum.SONG,
  expectedLibrary: SynologyLibraryEnum.ALL,
  expectedMethod: SynologyMethodEnum.LIST,
}) {
  @IsString()
  @IsEnum(['avg_rating', 'song_tag,song_audio,song_rating'])
  declare additional: string;
}

export class SynologySongsByAlbumBodyDto extends SynologySongsBodyDto {
  @IsString()
  declare album: string;

  @IsString()
  declare album_artist: string;
}

export class SynologySongsByArtistBodyDto extends SynologySongsBodyDto {
  @IsString()
  declare artist: string;
}

export class SynologySongsByAlbumArtistBodyDto extends SynologySongsByAlbumBodyDto {
  @IsString()
  declare artist: string;
}

export class SynologySongsByComposerBodyDto extends SynologySongsBodyDto {
  /**
   * The name of the composer
   */
  @IsString()
  declare composer: string;
}

export class SynologySongsByAlbumComposerBodyDto extends SynologySongsByAlbumBodyDto {
  /**
   * The name of the composer
   */
  @IsString()
  declare composer: string;
}

export class SynologySongsByAlbumGenreBodyDto extends SynologySongsByAlbumBodyDto {
  /**
   * The name of the genre
   */
  @IsString()
  declare genre: string;
}

export class SynologySongsByAlbumDefaultGenreBodyDto extends SynologySongsByAlbumBodyDto {
  /**
   * The name of the genre
   */
  @IsString()
  declare genre_filter: string;
}

export class SynologySongsByGenreBodyDto extends SynologySongsBodyDto {
  /**
   * The name of the genre
   */
  @IsString()
  declare genre: string;
}

export class SynologySongsByDefaultGenreBodyDto extends SynologySongsBodyDto {
  /**
   * The name of the genre
   */
  @IsString()
  declare genre_filter: string;
}

export class SynologySongsRateBodyDto extends OmitType(
  SynologyBody({
    expectedApi: SynologyApiEnum.SONG,
    expectedMethod: SynologyMethodEnum.SET_RATING,
  }),
  ['library'],
) {
  /**
   * The IDs of the track(s) to rate comes in a `music_<id>,music_<id>` format.
   *
   * eg `music_1234,music_5678`
   *
   * The posted value is transformed to an array of song IDs as numbers.
   */
  @ApiProperty({
    type: 'integer',
    isArray: true,
  })
  @IsInt()
  @Transform(({ value }) =>
    value.split(',').map((v) => {
      if (v.startsWith('music_')) {
        return Number.parseInt(v.split('_').pop(), 10);
      }
      return v;
    }),
  )
  declare id: number[];

  /**
   * The rating of the track
   */
  @ApiProperty({
    type: 'integer',
  })
  @IsInt()
  @Min(0)
  @Max(5)
  declare rating: RatingOrUnset;
}

class SynologySongRatingDto {
  @ApiProperty({
    type: 'integer',
  })
  @IsNumber()
  @Min(0)
  @Max(5)
  declare rating: RatingOrUnset;
}

class SynologySongAudioDto {
  @IsNumber()
  declare bitrate: number;

  @IsNumber()
  declare channel: number;

  @ApiProperty({
    enum: FileTypeEnum,
    enumName: 'FileTypeEnum',
    example: FileTypeEnum.FLAC,
  })
  @IsEnum(FileTypeEnum)
  declare codec: FileTypeEnum;

  @ApiProperty({
    enum: FileTypeEnum,
    enumName: 'FileTypeEnum',
    example: FileTypeEnum.FLAC,
  })
  @IsEnum(FileTypeEnum)
  declare container: FileTypeEnum;

  @IsNumber()
  declare duration: number;

  @IsNumber()
  declare filesize: number;

  @IsNumber()
  declare frequency: number;
}

class SynologySongTagDto {
  @IsString()
  declare album: string;

  @IsString()
  declare album_artist: string;

  @IsString()
  declare artist: string;

  @IsString()
  declare comment: string;

  @IsString()
  declare composer: string;

  @IsInt()
  declare disc: number;

  @IsString()
  declare genre: string;

  @IsInt()
  declare track: number;

  @IsInt()
  declare year: number;
}

class SynologySongAdditionalDto {
  @ApiProperty({
    type: SynologySongAudioDto,
  })
  declare song_audio: SynologySongAudioDto;

  @ApiProperty({
    type: SynologySongRatingDto,
  })
  declare song_rating: SynologySongRatingDto;

  @ApiProperty({
    type: SynologySongTagDto,
  })
  declare song_tag: SynologySongTagDto;
}

export class SynologySongDto {
  @ApiProperty({
    type: SynologySongAdditionalDto,
  })
  declare additional: SynologySongAdditionalDto;

  @IsString()
  declare id: string;

  @IsString()
  declare path: string;

  @IsString()
  declare title: string;

  @ApiProperty({
    enum: ContentTypeEnum,
    enumName: 'ContentTypeEnum',
  })
  @IsEnum(ContentTypeEnum)
  declare type: ContentTypeEnum;
}

export class SynologySongDataDto extends SynologyPaginationResponseDto {
  @ApiProperty({
    type: SynologySongDto,
    isArray: true,
  })
  declare songs: SynologySongDto[];
}

export class SynologySongResponseDto extends SynologySuccessResponseDto {
  @ApiProperty({
    type: SynologySongDataDto,
  })
  declare data: SynologySongDataDto;
}
