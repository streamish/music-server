import { AssociationTypeEnum } from 'src/types/enums';
import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { SubsonicErrorCode, SubsonicException } from './subsonic-error';
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
      throw new SubsonicException(SubsonicErrorCode.DATA_NOT_FOUND, 'The requested data was not found');
    }
    return libraryAssociationToRow(artists[0]);
  }
}
