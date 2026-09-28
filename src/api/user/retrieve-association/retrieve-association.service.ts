import { AssociationTypeEnum } from 'src/types/enums';
import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';

@Injectable()
export class UserRetrieveAssociationService {
  constructor(private readonly libraryService: LibraryService) {}

  async retrieveAssociation(accountId: number, associationId: number) {
    const albumArtist = await this.libraryService.retrieveAlbumAssociation(
      accountId,
      associationId,
      AssociationTypeEnum.ARTIST,
    );
    const trackArtist = await this.libraryService.retrieveTrackAssociation(
      accountId,
      associationId,
      AssociationTypeEnum.ARTIST,
    );
    const trackComposer = await this.libraryService.retrieveTrackAssociation(
      accountId,
      associationId,
      AssociationTypeEnum.COMPOSER,
    );
    const trackGenre = await this.libraryService.retrieveTrackAssociation(
      accountId,
      associationId,
      AssociationTypeEnum.GENRE,
    );
    const identity = albumArtist[0] || trackArtist[0] || trackComposer[0] || trackGenre[0] || null;
    return {
      id: identity?.id,
      name: identity?.name,
      createdAt: identity?.createdAt,
      albumArtistCredits: albumArtist[0]?.albums || [],
      artistCredits: trackArtist[0]?.albums || [],
      composerCredits: trackComposer[0]?.albums || [],
      genreCredits: trackGenre[0]?.albums || [],
    };
  }
}
