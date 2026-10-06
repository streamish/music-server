/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { AssociationTypeEnum } from 'src/types/enums';
import { IsBoolean, IsDate, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { LibraryAlbumDto } from './library.album.dto';
import { LibraryAssociationWithTracksDto } from './library.association.dto';
import { LibraryFolderDto } from './library.folder.dto';
import { LibraryTrackDto } from './library.track.dto';

/**
 * Playlists are not-yet implemented at the library-level
 */
class PlaylistPlaceholder {
  @IsInt()
  declare id: number;

  @IsString()
  declare name: string;
}

export class LibraryFavoriteDto {
  /**
   * Flag used by Synology
   */
  @IsBoolean()
  declare allSongs?: boolean;

  /**
   * Flag used by Synology for a random-100 playlist
   */
  @IsBoolean()
  declare randomHundred?: boolean;

  /**
   * Flag used by Synology for recently added items
   */
  @IsBoolean()
  declare recentlyAdded?: boolean;

  /**
   * The date the artist was added to the library
   */
  @ApiProperty({
    type: Date,
    format: 'date-time',
  })
  @IsDate()
  declare createdAt: Date;

  /**
   * The internally-generated unique ID of the artist
   */
  @IsInt()
  declare id: number;

  @ApiProperty({
    type: LibraryAlbumDto,
    required: false,
  })
  @IsOptional()
  album?: LibraryAlbumDto;

  @ApiProperty({
    type: LibraryAssociationWithTracksDto,
    required: false,
  })
  @IsOptional()
  association?: LibraryAssociationWithTracksDto;

  @ApiProperty({
    enum: AssociationTypeEnum,
    enumName: 'AssociationTypeEnum',
    required: false,
  })
  @IsEnum(AssociationTypeEnum)
  associationType?: AssociationTypeEnum;

  @ApiProperty({
    type: LibraryFolderDto,
    required: false,
  })
  @IsOptional()
  folder?: LibraryFolderDto;

  @ApiProperty({
    type: PlaylistPlaceholder,
    required: false,
  })
  playlist?: PlaylistPlaceholder;

  @ApiProperty({
    type: LibraryTrackDto,
    required: false,
  })
  @IsOptional()
  track?: LibraryTrackDto;
}
