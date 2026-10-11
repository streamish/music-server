import { AlbumEntity } from 'src/database/entities/album.entity';
import { AssociationLinkEntity, TrackEntity } from 'src/database/entities';
import { AssociationTypeEnum } from 'src/types/enums';
import { InjectModel } from '@nestjs/sequelize/dist/common/sequelize.decorators';
import { Injectable } from '@nestjs/common';
import { LibraryAssociationWithTracksDto } from 'src/library/dtos';
import { LibraryService } from 'src/library/library.service';
import { Op, col, where } from 'sequelize';
import sharp from 'sharp';

@Injectable()
export class ApiCoverImageService {
  constructor(
    @InjectModel(AlbumEntity)
    private readonly albumEntity: typeof AlbumEntity,
    @InjectModel(TrackEntity)
    private readonly trackEntity: typeof TrackEntity,
    private readonly libraryService: LibraryService,
  ) {}

  /**
   * Retrieves an association and their tracks, prioritizing album associations and falling back to track.
   * @param userId The authenticated user ID
   * @param associationId The ID of the association
   * @param associationType The type of association
   * @returns
   */
  private async getAssociation(userId: number, associationId: number, associationType: AssociationTypeEnum) {
    let associations: LibraryAssociationWithTracksDto[] | undefined;
    try {
      associations = await this.libraryService.retrieveAlbumAssociation(userId, associationId, associationType);
    } catch {
      if (!associations) {
        try {
          associations = await this.libraryService.retrieveTrackAssociation(userId, associationId, associationType);
        } catch {
          return undefined;
        }
      }
    }
    if (associations?.[0]?.id) {
      return associations[0];
    }
    return undefined;
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
      return undefined;
    }
    let { coverImage } = album;
    if (metadata.width !== size || metadata.height !== size) {
      const resizedImageBuffer = await sharpImage.resize(size, size, { fit: 'inside' });
      coverImage = await resizedImageBuffer.toBuffer();
    }
    return {
      coverImage,
      coverImageMimeType: album.coverImageMimeType,
      updatedAt: album.updatedAt || album.createdAt,
    };
  }

  /**
   * Finds a cover image for an association based on the first album with a cover image.
   * @param albumIds Array of relevant album IDs
   * @param associationId The ID of the associate
   * @param associationType The type of association
   * @param size The dimension of the image
   * @returns The image if it exists
   */
  async getAlbumCovers(albumIds: number[], associationId: number, associationType: AssociationTypeEnum, size: number) {
    const track = await this.trackEntity.findOne({
      attributes: ['albumId'],
      where: {
        albumId: albumIds,
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
      return undefined;
    }
    return ApiCoverImageService.processImage(track.album, size);
  }

  /**
   * Returns an album cover if it exists, or a blank placeholder.
   * @param albumIds Singular or array of relevant album IDs
   * @param size The dimension of the image
   * @returns The image if it exists
   */
  async getAlbumCover(albumId: number | number[], size: number) {
    const album = await this.albumEntity.findOne({
      attributes: ['id', 'coverImage', 'coverImageMimeType', 'createdAt', 'updatedAt'],
      where: {
        [Op.and]: [where(col('coverImage'), Op.not, null), where(col('coverImageMimeType'), Op.not, null)],
        id: albumId,
      },
    });
    if (!album) {
      return undefined;
    }
    return ApiCoverImageService.processImage(album, size);
  }

  /**
   * Finds an album cover image amongst an assocation's album or track credits, prioritizing albums.
   * @param userId The authenticated user ID
   * @param associationId The ID of the associate
   * @param associationType The type of association
   * @param size The dimension of the image
   * @returns The image if it exists
   */
  async getAssociationCover(userId: number, associationId: number, size: number, type: AssociationTypeEnum) {
    const association = await this.getAssociation(userId, associationId, type);
    if (!association) {
      return undefined;
    }
    const albumIds = association.albums.map((album) => album.id);
    let coverImage = await this.getAlbumCover(albumIds, size);
    if (!coverImage) {
      coverImage = await this.getAlbumCovers(albumIds, associationId, type, size);
      if (!coverImage) {
        return undefined;
      }
    }
    return {
      coverImage: coverImage.coverImage,
      coverImageMimeType: coverImage.coverImageMimeType,
    };
  }
}
