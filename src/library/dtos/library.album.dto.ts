/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsInt, IsString } from 'class-validator';
import { LibraryAssociationDto } from './library.association.dto';
import { LibraryTrackDto } from './library.track.dto';
import type { RatingOrUnset } from 'src/types';

export class LibraryAlbumDto {
  /**
   * The artist for the album, aggregated from the track album artists data.
   */
  @ApiProperty({
    type: LibraryAssociationDto,
    isArray: true,
  })
  declare artists: LibraryAssociationDto[];

  /**
   * The album composers aggregated from the track compilers data.
   */
  @ApiProperty({
    type: LibraryAssociationDto,
    isArray: true,
  })
  declare composers: LibraryAssociationDto[];

  /**
   * A color detected in the cover art image
   */
  @IsString()
  declare coverImageLightVibrant?: string;

  /**
   * A color detected in the cover art image
   */
  @IsString()
  declare coverImageDarkVibrant?: string;

  /**
   * A color detected in the cover art image
   */
  @IsString()
  declare coverImageMuted?: string;

  /**
   * A color detected in the cover art image
   */
  @IsString()
  declare coverImageVibrant?: string;

  /**
   * A color detected in the cover art image
   */
  @IsString()
  declare coverImageDarkMuted?: string;

  /**
   * A color detected in the cover art image
   */
  @IsString()
  declare coverImageLightMuted?: string;

  /**
   * The date the album was added to the library
   */
  @IsDate()
  declare createdAt: Date;

  /**
   * The favorite data for the album if it exists
   */
  @IsInt()
  declare favoriteId?: number;

  /**
   * The album genres aggregated from the track genres.
   */
  @ApiProperty({
    type: LibraryAssociationDto,
    isArray: true,
  })
  declare genres: LibraryAssociationDto[];

  /**
   * The internally-generated unique ID of the album
   */
  @IsInt()
  declare id: number;

  /**
   * The aggregate rating for the album, which is the average of the rating values
   * between 0 (not rated) and 5 inclusive applied to tracks.
   */
  @ApiProperty({
    type: 'integer',
    default: 0,
    minimum: 0,
    maximum: 5,
    enum: [0, 1, 2, 3, 4, 5],
    enumName: 'RatingOrUnset',
  })
  @IsInt()
  declare rating: RatingOrUnset;

  /**
   * The name or title of the album, this would usually come from an official source such as MusicBrainz
   * or Discogs.
   */
  @IsString()
  declare title: string;

  /**
   * The year the album was released.
   */
  @IsInt()
  declare year: number;
}

export class LibraryAlbumWithTracksDto extends LibraryAlbumDto {
  /**
   * The list of tracks for the album
   */
  @ApiProperty({
    type: LibraryTrackDto,
    isArray: true,
  })
  declare tracks: LibraryTrackDto[];
}
