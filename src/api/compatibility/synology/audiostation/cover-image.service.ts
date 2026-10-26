import { AlbumEntity, AssociationEntity, AssociationLinkEntity } from 'src/database/entities';
import { AssociationTypeEnum } from 'src/types/enums';
import { CoverImagesService } from 'src/cover-images/cover-images.service';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, NotFoundException } from '@nestjs/common';
import { normalizeString } from 'src/utils/strings';

@Injectable()
export class SynologyCoverImageService {
  constructor(
    private readonly coverImageService: CoverImagesService,
    @InjectModel(AssociationEntity)
    private readonly associationEntity: typeof AssociationEntity,
    @InjectModel(AlbumEntity)
    private readonly albumEntity: typeof AlbumEntity,
  ) {}

  private async getAssociationId(accountId: number, name: string) {
    const association = await this.associationEntity.findOne({
      attributes: ['id'],
      where: {
        accountId,
        nameNormalized: normalizeString(name),
      },
    });
    if (!association) {
      throw new NotFoundException(`Association not found for name: ${name}`);
    }
    return association.id;
  }

  /**
   * Returns the cover image for a given artist.  If there are no albums it throws a NotFoundException.  The
   * image is embedded in the first-returned album's first file's IDv3 tag data and stored into SQLite for
   * retrieval.  The image can be updated by saving a new image into the IDv3 tag data and then the file being
   * modified will be picked up by the indexer on its next run.
   * @param userId The authenticated user ID
   * @param albumArtist The name of the artist for which to retrieve the cover image.
   * @returns The album cover image.
   */
  async getArtistCoverImage(userId: number, albumArtist: string) {
    const artistId = await this.getAssociationId(userId, albumArtist);
    return this.coverImageService.getAssociationCover(userId, artistId, 600, AssociationTypeEnum.ARTIST);
  }

  /**
   * Returns the cover image for a given album.  If the album is not found it throws a NotFoundException.  The
   * image is embedded in the first-returned album's first file's IDv3 tag data and stored into SQLite for
   * retrieval.  The image can be updated by saving a new image into the IDv3 tag data and then the file being
   * modified will be picked up by the indexer on its next run.
   * @param userId The authenticated user ID
   * @param albumArtist The name of the artist for which to retrieve the cover image.
   * @param [albumTitle] The optional title of the album for which to retrieve the cover image.
   * @returns The album cover image.
   */
  async getAlbumCoverImage(userId: number, albumArtist: string, albumTitle?: string) {
    const album = await this.albumEntity.findOne({
      attributes: ['id', 'coverImage', 'coverImageMimeType', 'createdAt', 'updatedAt'],
      where: {
        ...(albumTitle ? { titleNormalized: normalizeString(albumTitle) } : {}),
        accountId: userId,
      },
      include: [
        {
          attributes: [],
          model: AssociationLinkEntity,
          as: 'albumArtists',
          where: {
            isArtist: true,
          },
          required: true,
          include: [
            {
              attributes: [],
              model: AssociationEntity,
              where: {
                nameNormalized: normalizeString(albumArtist),
              },
              required: true,
            },
          ],
        },
      ],
      subQuery: false,
    });
    if (!album) {
      throw new NotFoundException(`Album not found for title: ${albumTitle} and artist: ${albumArtist}`);
    }
    return this.coverImageService.getAlbumCover(userId, album.id, 600);
  }

  /**
   * Returns the cover image for a given composer.  If there are no albums it throws a NotFoundException.  The
   * image is embedded in the first-returned album's first file's IDv3 tag data and stored into SQLite for
   * retrieval.  The image can be updated by saving a new image into the IDv3 tag data and then the file being
   * modified will be picked up by the indexer on its next run.
   * @param userId The authenticated user ID
   * @param composer The name of the composer for which to retrieve the cover image.
   * @returns The album cover image.
   */
  async getComposerCoverImage(userId: number, composerName: string) {
    const composerId = await this.getAssociationId(userId, composerName);
    return this.coverImageService.getAssociationCover(userId, composerId, 600, AssociationTypeEnum.COMPOSER);
  }

  /**
   * Returns the cover image for a given track ID. If the track is not found, it throws a NotFoundException.  The
   * image is embedded in the file's IDv3 tag data and stored into SQLite for retrieval.  The image can be
   * updated by saving a new image into the IDv3 tag data and then the file being modified will be picked
   * up by the indexer on its next run.
   * @param userId The authenticated user ID
   * @param trackId The ID of the track for which to retrieve the cover image.
   * @returns The track cover image.
   */
  async getTrackCoverImage(userId: number, trackId: number) {
    return this.coverImageService.getTrackCover(userId, trackId, 600);
  }
}
