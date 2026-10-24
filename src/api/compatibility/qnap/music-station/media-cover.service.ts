import { AssociationTypeEnum } from 'src/types/enums';
import { CoverImagesService } from 'src/cover-images/cover-images.service';
import { Injectable } from '@nestjs/common';

const emptyBuffer = Buffer.alloc(0);

@Injectable()
export class QnapMediaCoverService {
  constructor(private readonly coverImagesService: CoverImagesService) {}

  /**
   * Returns the cover image for a given artist.  If there are no albums it throws a NotFoundException.  The
   * image is embedded in the first-returned album's first file's IDv3 tag data and stored into SQLite for
   * retrieval.  The image can be updated by saving a new image into the IDv3 tag data and then the file being
   * modified will be picked up by the indexer on its next run.
   * @param userId The authenticated user ID
   * @param associationId The association ID for the artist
   * @throws If no cover image was found for the association
   * @returns The album cover image.
   */
  async getArtistCoverImage(userId: number, associationId: number) {
    return this.coverImagesService.getAssociationCover(userId, associationId, 600, AssociationTypeEnum.ARTIST);
  }

  /**
   * Returns the cover image for a given album.  If the album is not found it throws a NotFoundException.  The
   * image is embedded in the first-returned album's first file's IDv3 tag data and stored into SQLite for
   * retrieval.  The image can be updated by saving a new image into the IDv3 tag data and then the file being
   * modified will be picked up by the indexer on its next run.
   * @param userId The authenticated user ID
   * @param albumId The ID of the album for which to retrieve the cover image.
   * @returns The album cover image.
   */
  async getAlbumCoverImage(userId: number, albumId: number) {
    return this.coverImagesService.getAlbumCover(userId, albumId);
  }

  // eslint-disable-next-line class-methods-use-this
  async getFolderCoverImage() {
    return {
      coverImage: emptyBuffer,
      coverImageMimeType: '',
      eTag: '',
      fileName: 'folder.png',
      updatedAt: new Date(1970, 0, 1, 0, 0, 0, 0),
    };
  }
}
