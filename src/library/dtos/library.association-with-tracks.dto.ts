import { ApiProperty } from '@nestjs/swagger';
import { LibraryAlbumWithTracksDto } from './library.album.dto';
import { LibraryAssociationDto } from './library.association.dto';

export class LibraryAssociationWithTracksDto extends LibraryAssociationDto {
  /**
   * The list of albums including tracks for the artist
   */
  @ApiProperty() // not sure why but defining type + isArray results in LibraryAlbumWithTracksDto[][]
  declare albums: LibraryAlbumWithTracksDto[];
}
