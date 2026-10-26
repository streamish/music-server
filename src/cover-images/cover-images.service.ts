import { AlbumEntity } from 'src/database/entities/album.entity';
import { AssociationLinkEntity, TrackEntity } from 'src/database/entities';
import { AssociationTypeEnum } from 'src/types/enums';
import { InjectModel } from '@nestjs/sequelize/dist/common/sequelize.decorators';
import { Injectable } from '@nestjs/common';
import { Op, col, where } from 'sequelize';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import sharp from 'sharp';

let blankBuffer: Buffer;

@Injectable()
export class CoverImagesService {
  constructor(
    @InjectModel(AlbumEntity)
    private readonly albumEntity: typeof AlbumEntity,
    @InjectModel(TrackEntity)
    private readonly trackEntity: typeof TrackEntity,
  ) {}

  /**
   * Retrieves the default blank cover image.
   * @returns An object containing the blank cover image and its metadata.
   */
  private static getBlankCover() {
    if (!blankBuffer) {
      const blankCoverPath = join(__dirname, 'resources', 'blank-cover.png');
      blankBuffer = readFileSync(blankCoverPath);
    }
    return {
      coverImage: blankBuffer,
      coverImageMimeType: 'image/png',
      eTag: CoverImagesService.getEtag(0, 0, new Date(1970, 0, 1, 0, 0, 0, 0)),
      fileName: CoverImagesService.getFileName('image/png', 0, 0),
      updatedAt: new Date(1970, 0, 1, 0, 0, 0, 0),
    };
  }

  /**
   * Generates an album- or association-unique filename for a cover image to report to clients.
   * @param mimeType The MIME type of the cover image
   * @param id The ID of the album or association
   * @param size The size of the cover image
   * @param associationType The type of association, if applicable
   * @returns The generated filename string
   */
  private static getFileName(mimeType: string, id: number, size: number, associationType?: AssociationTypeEnum) {
    const fileType = mimeType.split('/').pop() || 'png';
    let fileName: string;
    if (associationType) {
      fileName = `${associationType}-${id}-cover-${size}.${fileType}`;
    } else {
      fileName = `album-${id}-cover-${size}.${fileType}`;
    }
    return fileName;
  }

  /**
   * Generates an album- or association-unique ETag for caching purposes taking into account the size and
   * last updated timestamp to bust previous caches.
   * @param id The ID of the album or association
   * @param size The size of the cover image
   * @param updatedAt The last updated timestamp of the album or association
   * @param associationType The type of association, if applicable
   * @returns The generated ETag string
   */
  private static getEtag(id: number, size: number, updatedAt: Date, associationType?: AssociationTypeEnum) {
    let eTag: string;
    if (associationType) {
      eTag = `${associationType}-${id}-cover-${size}-${updatedAt?.getTime() || ''}`;
    } else {
      eTag = `album-${id}-cover-${size}-${updatedAt?.getTime() || ''}`;
    }
    return eTag;
  }

  /**
   * Resizes an image to the specified size if required
   * @param album The album with the image attached
   * @param size The target size
   * @returns The image if it exists
   */
  private static async processImage(album: AlbumEntity, size: number) {
    const sharpImage = sharp(album.coverImage);
    const metadata = await sharpImage.metadata();
    if (!metadata.width || !metadata.height) {
      return CoverImagesService.getBlankCover();
    }
    let { coverImage } = album;
    if (metadata.width !== size || metadata.height !== size) {
      const resizedImageBuffer = await sharpImage.resize(size, size, { fit: 'inside' });
      coverImage = await resizedImageBuffer.toBuffer();
    }
    return {
      coverImage,
      coverImageMimeType: album.coverImageMimeType,
      eTag: CoverImagesService.getEtag(album.id, size, album.updatedAt || album.createdAt),
      fileName: CoverImagesService.getFileName(album.coverImageMimeType, album.id, size),
      updatedAt: album.updatedAt || album.createdAt,
    };
  }

  /**
   * Finds a cover image for an association based on the first album with a cover image
   * that is extracted from the first track within that album that contains a cover image.
   * @param albumIds Array of relevant album IDs
   * @param associationId The ID of the associated entity
   * @param associationType The type of association
   * @param size The dimension of the image
   * @returns The image if it exists
   */
  async getAlbumCovers(
    albumIds: number[] | undefined,
    associationId: number,
    associationType: AssociationTypeEnum,
    size: number,
  ) {
    const track = await this.trackEntity.findOne({
      attributes: ['albumId'],
      where: {
        ...(albumIds ? { albumId: albumIds } : {}),
      },
      include: [
        {
          model: AlbumEntity,
          attributes: ['id', 'coverImage', 'coverImageMimeType', 'createdAt', 'updatedAt'],
          where: {
            coverImage: { [Op.not]: null },
            coverImageMimeType: { [Op.not]: null },
          },
        },
        {
          attributes: [],
          model: AssociationLinkEntity,
          where: {
            associationId,
            ...(associationType === AssociationTypeEnum.COMPOSER ? { isComposer: true } : {}),
            ...(associationType === AssociationTypeEnum.GENRE ? { isGenre: true } : {}),
            ...(associationType === AssociationTypeEnum.ARTIST ? { isTrackArtist: true } : {}),
          },
          required: true,
          as: 'artists',
        },
      ],
    });
    if (!track?.album?.id) {
      return CoverImagesService.getBlankCover();
    }
    return CoverImagesService.processImage(track.album, size);
  }

  /**
   * Returns an album cover if it exists, or a blank placeholder.  The image is embedded in the track
   * files, the first track found with an image provides it.  The image can be updated by saving a new
   * image into the IDv3 tag data and re-indexing.
   * @param accountId The owner of the data
   * @param albumId The ID of the album to retrieve the cover image for.
   * @returns The album cover image.
   */
  async getAlbumCover(accountId: number, albumId: number | number[], size: number) {
    const album = await this.albumEntity.findOne({
      attributes: ['id', 'coverImage', 'coverImageMimeType', 'createdAt', 'updatedAt'],
      where: {
        [Op.and]: [where(col('coverImage'), Op.not, null), where(col('coverImageMimeType'), Op.not, null)],
        id: albumId,
        accountId,
      },
    });
    if (!album) {
      return CoverImagesService.getBlankCover();
    }
    return CoverImagesService.processImage(album, size);
  }

  /**
   * Finds an album cover image amongst an association's album or track credits, prioritizing the
   * albums they are credited to.  The image comes from the first available image in an album's
   * tracks or then the loose-track credits.  The image can be updated by saving a new
   * image into the IDv3 tag data and re-indexing.
   * @param accountId The owner of the data
   * @param associationId The ID of the associate
   * @param associationType The type of association
   * @param size The dimension of the image
   * @returns The image if it exists
   */
  async getAssociationCover(accountId: number, associationId: number, size: number, type: AssociationTypeEnum) {
    const flag = { isArtist: 'isArtist', isComposer: 'isComposer', isGenre: 'isGenre' };
    let alias = 'albumGenres';
    let flagColumn = flag.isGenre;
    if (type === AssociationTypeEnum.ARTIST) {
      alias = 'albumArtists';
      flagColumn = flag.isArtist;
    } else if (type === AssociationTypeEnum.COMPOSER) {
      alias = 'albumComposers';
      flagColumn = flag.isComposer;
    }
    const album = await this.albumEntity.findOne({
      attributes: ['id', 'coverImage', 'coverImageMimeType', 'createdAt', 'updatedAt'],
      where: {
        [Op.and]: [where(col('coverImage'), Op.not, null), where(col('coverImageMimeType'), Op.not, null)],
        accountId,
      },
      include: [
        {
          attributes: [],
          model: AssociationLinkEntity,
          as: alias,
          required: true,
          where: { associationId, [flagColumn]: true },
        },
      ],
      order: [['id', 'ASC']],
      subQuery: false,
    });
    if (album) {
      return CoverImagesService.processImage(album, size);
    }
    return this.getAlbumCovers(undefined, associationId, type, size);
  }

  /**
   * Returns a track cover if it exists, or a blank placeholder.  The image returned comes from the album which
   * is sourced from the first track containing an image.
   * @param accountId The owner of the data
   * @param trackId The ID of the track to retrieve the cover image for.
   * @returns The track cover image.
   */
  async getTrackCover(accountId: number, trackId: number, size: number) {
    const track = await this.trackEntity.findOne({
      attributes: ['id', 'albumId'],
      where: {
        id: trackId,
        accountId,
      },
    });
    if (!track) {
      return CoverImagesService.getBlankCover();
    }
    return this.getAlbumCover(accountId, track.albumId, size);
  }
}
