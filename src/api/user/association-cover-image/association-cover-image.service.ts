import { AlbumEntity } from 'src/database/entities/album.entity';
import { AssociationLinkEntity, TrackEntity } from 'src/database/entities';
import { AssociationTypeEnum } from 'src/types/enums';
import { CoverImage } from 'src/types/cover-image';
import { InjectModel } from '@nestjs/sequelize/dist/common/sequelize.decorators';
import { Injectable } from '@nestjs/common';
import { LibraryAssociationWithTracksDto } from 'src/library/dtos';
import { LibraryService } from 'src/library/library.service';
import { Op, col, where } from 'sequelize';
import sharp from 'sharp';

@Injectable()
export class UserAssociationCoverImageService {
  constructor(
    @InjectModel(AlbumEntity)
    private readonly albumEntity: typeof AlbumEntity,
    @InjectModel(TrackEntity)
    private readonly trackEntity: typeof TrackEntity,
    private readonly libraryService: LibraryService,
  ) {}

  private async getAlbumCover(
    albumIds: number[],
    associationId: number,
    type: AssociationTypeEnum,
  ): Promise<AlbumEntity | null> {
    return this.albumEntity.findOne({
      attributes: ['id', 'coverImage', 'coverImageMimeType', 'createdAt', 'updatedAt'],
      include: [
        {
          attributes: [],
          model: AssociationLinkEntity,
          where: {
            associationId,
            ...(type === AssociationTypeEnum.COMPOSER ? { isComposer: true } : {}),
            ...(type === AssociationTypeEnum.GENRE ? { isGenre: true } : {}),
            ...(type === AssociationTypeEnum.ARTIST ? { isTrackArtist: true } : {}),
          },
          required: true,
          as: 'associationLinks',
        },
      ],
      where: {
        id: albumIds,
        [Op.and]: [where(col('coverImage'), Op.not, null), where(col('coverImageMimeType'), Op.not, null)],
      },
    });
  }

  private async getTrackCover(
    albumIds: number[],
    associationId: number,
    type: AssociationTypeEnum,
  ): Promise<AlbumEntity | null> {
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
            ...(type === AssociationTypeEnum.COMPOSER ? { isComposer: true } : {}),
            ...(type === AssociationTypeEnum.GENRE ? { isGenre: true } : {}),
            ...(type === AssociationTypeEnum.ARTIST ? { isTrackArtist: true } : {}),
          },
          required: true,
          as: 'artists',
        },
      ],
    });
    return track?.album ?? null;
  }

  async getAssociations(
    accountId: number,
    associationId: number,
    type: AssociationTypeEnum,
  ): Promise<LibraryAssociationWithTracksDto[] | undefined> {
    let associations: LibraryAssociationWithTracksDto[] | undefined;
    try {
      associations = await this.libraryService.retrieveAlbumAssociation(accountId, associationId, type);
    } catch {
      if (!associations) {
        try {
          associations = await this.libraryService.retrieveTrackAssociation(accountId, associationId, type);
        } catch {
          return undefined;
        }
      }
    }
    return associations;
  }

  async getImage(
    accountId: number,
    associationId: number,
    size: number,
    type: AssociationTypeEnum,
  ): Promise<CoverImage | undefined> {
    const associations = await this.getAssociations(accountId, associationId, type);
    const association = associations?.[0];
    if (!association) {
      return undefined;
    }
    const albumIds = association.albums.map((album) => album.id);
    let coverImage: AlbumEntity | null = await this.getAlbumCover(albumIds, associationId, type);
    if (!coverImage) {
      coverImage = await this.getTrackCover(albumIds, associationId, type);
      if (!coverImage) {
        return undefined;
      }
    }
    const sharpImage = sharp(coverImage.coverImage);
    const metadata = await sharpImage.metadata();
    if (!metadata.width || !metadata.height) {
      return undefined;
    }
    if (metadata.width !== size || metadata.height !== size) {
      const resizedImageBuffer = await sharpImage.resize(size, size, { fit: 'inside' });
      coverImage.coverImage = await resizedImageBuffer.toBuffer();
    }
    return {
      coverImage: coverImage.coverImage,
      coverImageMimeType: coverImage.coverImageMimeType,
    };
  }
}
