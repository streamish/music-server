import { AssociationTypeEnum } from 'src/types/enums';
import { Injectable, NotFoundException } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { libraryAssociationToRow } from './subsonic.mapper';

@Injectable()
export class SubsonicArtistService {
  constructor(private readonly libraryService: LibraryService) {}

  async getArtist(userId: number, associationId: number) {
    const artists = await this.libraryService.retrieveAlbumAssociation(
      userId,
      [associationId],
      AssociationTypeEnum.ARTIST,
    );
    if (!artists || !artists?.[0]) {
      throw new NotFoundException(`Artist not found: ${associationId}`);
    }
    return libraryAssociationToRow(artists[0]);
  }
}
