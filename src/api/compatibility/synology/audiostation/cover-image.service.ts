import { AlbumEntity, AssociationEntity, AssociationLinkEntity, TrackEntity } from 'src/database/entities';
import { CoverImage } from 'src/types/cover-image';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Op } from 'sequelize';
import { normalizeString } from 'src/utils/strings';

@Injectable()
export class SynologyCoverImageService {
  constructor(
    @InjectModel(AlbumEntity)
    private readonly albumEntity: typeof AlbumEntity,
    @InjectModel(TrackEntity)
    private readonly trackEntity: typeof TrackEntity,
  ) {}

  /**
   * Returns the cover image for a given artist.  If there are no albums it throws a NotFoundException.  The
   * image is embedded in the first-returned album's first file's IDv3 tag data and stored into SQLite for
   * retrieval.  The image can be updated by saving a new image into the IDv3 tag data and then the file being
   * modified will be picked up by the indexer on its next run.
   * @param {number} accountId The account ID for the user requesting the cover image.
   * @param {string} albumArtist The name of the artist for which to retrieve the cover image.
   * @returns {Promise<CoverImage | undefined>} The album cover image.
   */
  async getArtistCoverImage(accountId: number, albumArtist: string): Promise<CoverImage | undefined> {
    const artist = await this.albumEntity.findOne({
      attributes: ['id', 'coverImage', 'coverImageMimeType', 'createdAt', 'updatedAt'],
      where: {
        accountId,
      },
      include: [
        {
          model: AssociationLinkEntity,
          include: [
            {
              attributes: [],
              model: AssociationEntity,
              where: {
                nameNormalized: normalizeString(albumArtist),
                [Op.or]: [
                  {
                    isAlbumArtist: true,
                  },
                  {
                    isTrackArtist: true,
                  },
                ],
              },
            },
          ],
        },
      ],
    });
    if (!artist) {
      throw new NotFoundException(`Cover image not found for artist: ${albumArtist}`);
    }
    return artist;
  }

  /**
   * Returns the cover image for a given album.  If the album is not found it throws a NotFoundException.  The
   * image is embedded in the first-returned album's first file's IDv3 tag data and stored into SQLite for
   * retrieval.  The image can be updated by saving a new image into the IDv3 tag data and then the file being
   * modified will be picked up by the indexer on its next run.
   * @param {number} accountId The account ID for the user requesting the cover image.
   * @param {string} albumArtist The name of the artist for which to retrieve the cover image.
   * @param {string} [albumTitle] The optional title of the album for which to retrieve the cover image.
   * @returns {Promise<CoverImage | undefined>} The album cover image.
   */
  async getAlbumCoverImage(
    accountId: number,
    albumArtist: string,
    albumTitle?: string,
  ): Promise<CoverImage | undefined> {
    const album = await this.albumEntity.findOne({
      attributes: ['id', 'coverImage', 'coverImageMimeType', 'createdAt', 'updatedAt'],
      where: {
        ...(albumTitle ? { titleNormalized: normalizeString(albumTitle) } : {}),
        accountId,
      },
      include: [
        {
          model: AssociationLinkEntity,
          include: [
            {
              attributes: [],
              model: AssociationEntity,
              where: {
                nameNormalized: normalizeString(albumArtist),
                [Op.or]: [
                  {
                    isAlbumArtist: true,
                  },
                  {
                    isTrackArtist: true,
                  },
                ],
              },
            },
          ],
        },
      ],
    });
    if (!album) {
      throw new NotFoundException(`Album not found for title: ${albumTitle} and artist: ${albumArtist}`);
    }
    return album;
  }

  /**
   * Returns the cover image for a given composer.  If there are no albums it throws a NotFoundException.  The
   * image is embedded in the first-returned album's first file's IDv3 tag data and stored into SQLite for
   * retrieval.  The image can be updated by saving a new image into the IDv3 tag data and then the file being
   * modified will be picked up by the indexer on its next run.
   * @param {number} accountId The account ID for the user requesting the cover image.
   * @param {string} composer The name of the composer for which to retrieve the cover image.
   * @returns {Promise<CoverImage | undefined>} The album cover image.
   */
  async getComposerCoverImage(accountId: number, composerName: string): Promise<CoverImage | undefined> {
    const album = await this.albumEntity.findOne({
      attributes: ['id', 'coverImage', 'coverImageMimeType', 'createdAt', 'updatedAt'],
      where: {
        accountId,
      },
      include: [
        {
          model: AssociationLinkEntity,
          include: [
            {
              attributes: [],
              model: AssociationEntity,
              where: {
                nameNormalized: normalizeString(composerName),
                isComposer: true,
              },
            },
          ],
        },
      ],
    });
    if (!album) {
      throw new NotFoundException(`Album not found for composer: ${composerName}`);
    }
    return album;
  }

  /**
   * Returns the cover image for a given track ID. If the track is not found, it throws a NotFoundException.  The
   * image is embedded in the file's IDv3 tag data and stored into SQLite for retrieval.  The image can be
   * updated by saving a new image into the IDv3 tag data and then the file being modified will be picked
   * up by the indexer on its next run.
   * @param {number} accountId The account ID for the user requesting the cover image.
   * @param {number} trackId The ID of the track for which to retrieve the cover image.
   * @returns {Promise<CoverImage | undefined>} The track cover image.
   */
  async getTrackCoverImage(accountId: number, trackId: number): Promise<CoverImage | undefined> {
    const track = await this.trackEntity.findOne({
      attributes: [],
      where: {
        id: trackId,
        accountId,
      },
      include: [
        {
          model: AlbumEntity,
          attributes: ['id', 'coverImage', 'coverImageMimeType', 'createdAt', 'updatedAt'],
        },
      ],
    });
    if (!track?.album) {
      throw new NotFoundException(`Album not found for track ID: ${trackId}`);
    }
    return track?.album;
  }
}
