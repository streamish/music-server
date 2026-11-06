/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { AssociationTypeEnum } from 'src/types/enums';
import { IsBoolean, IsDate, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { LibraryAlbumDto } from './library.album.dto';
import { LibraryAssociationWithTracksDto } from './library.association-with-tracks.dto';
import { LibraryFolderDto } from './library.folder.dto';
import { LibraryShoutcastStationDto } from './library.shoutcast-station.dto';
import { LibraryTrackDto } from './library.track.dto';

/**
 * Playlists are not-yet implemented at the library-level
 */
class PlaylistPlaceholder {
  /**
   * The internally-generated unique ID of the playlist.
   */
  @IsInt()
  declare id: number;

  /**
   * The name of the playlist.
   */
  @IsString()
  declare name: string;
}

export class LibraryFavoriteDto {
  /**
   * Flag used by Synology to indicate the "all songs" playlist was favorited.
   */
  @IsBoolean()
  declare allSongs?: boolean;

  /**
   * Flag used by Synology to indicate the "random hundred" playlist was favorited.
   */
  @IsBoolean()
  declare randomHundred?: boolean;

  /**
   * Flag used by Synology to indicate the "recently added" playlist was favorited.
   */
  @IsBoolean()
  declare recentlyAdded?: boolean;

  /**
   * The date the favorite was added to the library.
   */
  @ApiProperty({
    type: Date,
    format: 'date-time',
  })
  @IsDate()
  declare createdAt: Date;

  /**
   * The internally-generated unique ID of the favorite.
   */
  @IsInt()
  declare id: number;

  /**
   * If the favorite is referencing an album this field will contain the album details.
   */
  @ApiProperty({
    type: LibraryAlbumDto,
    required: false,
  })
  @IsOptional()
  album?: LibraryAlbumDto;

  /**
   * If the favorite is referencing an association this field will contain the association details.
   */
  @ApiProperty({
    type: LibraryAssociationWithTracksDto,
    required: false,
  })
  @IsOptional()
  association?: LibraryAssociationWithTracksDto;

  /**
   * If the favorite is referencing an association this field will describe the type of association.
   */
  @ApiProperty({
    enum: AssociationTypeEnum,
    enumName: 'AssociationTypeEnum',
    required: false,
  })
  @IsEnum(AssociationTypeEnum)
  associationType?: AssociationTypeEnum;

  /**
   * If the favorite is referencing a folder this field will contain the folder details.
   */
  @ApiProperty({
    type: LibraryFolderDto,
    required: false,
  })
  @IsOptional()
  folder?: LibraryFolderDto;

  /**
   * If the favorite is referencing a playlist this field will contain the playlist details.
   */
  @ApiProperty({
    type: PlaylistPlaceholder,
    required: false,
  })
  playlist?: PlaylistPlaceholder;

  /**
   * If the favorite is referencing a Shoutcast station this field will contain the station details.
   */
  @ApiProperty({
    type: LibraryShoutcastStationDto,
    required: false,
  })
  @IsOptional()
  shoutcastStation?: LibraryShoutcastStationDto;

  /**
   * If the favorite is referencing a track this field will contain the track details.
   */
  @ApiProperty({
    type: LibraryTrackDto,
    required: false,
  })
  @IsOptional()
  track?: LibraryTrackDto;
}
