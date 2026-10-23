import { AssociationTypeEnum } from 'src/types/enums';
import { Injectable, NotFoundException } from '@nestjs/common';
import { LibraryAssociationWithTracksDto } from 'src/library/dtos';
import { LibraryService } from 'src/library/library.service';

function artistToRow(association: LibraryAssociationWithTracksDto) {
  return {
    id: `artist-${association.id}`,
    name: association.name,
    album: association.albums.map((album) => ({ id: `album-${album.id}`, name: album.title })),
  };
}

@Injectable()
export class SubsonicGetArtistService {
  constructor(private readonly library: LibraryService) {}

  async getArtist(accountId: number, associationId: number) {
    const artists = await this.library.retrieveAlbumAssociation(accountId, [associationId], AssociationTypeEnum.ARTIST);
    if (!artists || !artists?.[0]) {
      throw new NotFoundException(`Artist not found: ${associationId}`);
    }
    return artistToRow(artists[0]);
  }
}
