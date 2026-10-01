/* eslint-disable no-await-in-loop */
import { AssociationEntity, AssociationLinkEntity, TrackEntity } from 'src/database/entities';
import { AssociationTypeEnum } from 'src/types/enums';
import { IAudioMetadata } from 'src/types/music-metadata';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, Logger } from '@nestjs/common';
import { Op, Transaction } from 'sequelize';
import { normalizeString, sanitizeString, splitArray } from 'src/utils/strings';

@Injectable()
export class IndexAssociationService {
  private readonly logger: Logger = new Logger(IndexAssociationService.name);

  constructor(
    @InjectModel(AssociationEntity)
    private readonly associationEntity: typeof AssociationEntity,
    @InjectModel(AssociationLinkEntity)
    private readonly associationLinkEntity: typeof AssociationLinkEntity,
  ) {}

  async findOrInsert(accountId: number, name: string, transaction?: Transaction): Promise<number> {
    const nameNormalized = normalizeString(name);
    const existing = await this.associationEntity.findOne({
      where: {
        accountId,
        nameNormalized,
      },
      transaction,
    });
    if (existing?.id) {
      return existing.id;
    }
    const association = await this.associationEntity.create(
      {
        accountId,
        name: sanitizeString(name),
        nameNormalized,
      } as AssociationEntity,
      {
        transaction,
      },
    );
    return association.id;
  }

  async updateAssociations(
    embeddedData: IAudioMetadata,
    accountId: number,
    associationType: AssociationTypeEnum,
    track: TrackEntity,
    transaction?: Transaction,
  ) {
    let items: string[];
    if (associationType === AssociationTypeEnum.ARTIST) {
      items =
        embeddedData?.common.artists || splitArray(embeddedData?.common.artist ? [embeddedData?.common.artist] : []);
    } else if (associationType === AssociationTypeEnum.COMPOSER) {
      items = splitArray(embeddedData?.common.composer || []);
    } else if (associationType === AssociationTypeEnum.GENRE) {
      items = splitArray(embeddedData?.common.genre || []);
    } else {
      items = [];
    }
    const validAssociationIds: number[] = [];
    for (let i = 0; i < items.length; i += 1) {
      const name = items[i]?.trim();
      if (name) {
        const associationId = await this.findOrInsert(accountId, name, transaction);
        const existingAssociation = await this.associationLinkEntity.findOne({
          where: {
            associationId,
            ...(associationType === AssociationTypeEnum.ARTIST ? { isArtist: true } : {}),
            ...(associationType === AssociationTypeEnum.COMPOSER ? { isComposer: true } : {}),
            ...(associationType === AssociationTypeEnum.GENRE ? { isGenre: true } : {}),
            trackId: track.id,
          },
          transaction,
        });
        if (!existingAssociation) {
          const newAssociation = await this.associationLinkEntity.create(
            {
              associationId,
              trackId: track.id,
              ...(associationType === AssociationTypeEnum.ARTIST ? { isArtist: true } : {}),
              ...(associationType === AssociationTypeEnum.COMPOSER ? { isComposer: true } : {}),
              ...(associationType === AssociationTypeEnum.GENRE ? { isGenre: true } : {}),
            } as AssociationLinkEntity,
            {
              transaction,
            },
          );
          validAssociationIds.push(newAssociation.id);
        } else {
          validAssociationIds.push(existingAssociation.id);
        }
      }
    }
    // remove any associations that are no longer valid
    await this.associationLinkEntity.destroy({
      where: {
        id: {
          [Op.notIn]: validAssociationIds,
        },
        trackId: track.id,
        ...(associationType === AssociationTypeEnum.ARTIST ? { isArtist: true } : {}),
        ...(associationType === AssociationTypeEnum.COMPOSER ? { isComposer: true } : {}),
        ...(associationType === AssociationTypeEnum.GENRE ? { isGenre: true } : {}),
      },
      transaction,
    });
  }

  async syncAlbumAssociations(albumId: number, transaction?: Transaction) {
    const trackAssociations = await this.associationLinkEntity.findAll({
      where: {
        [Op.or]: [{ isGenre: true }, { isComposer: true }],
      },
      include: [
        {
          attributes: [],
          model: TrackEntity,
          where: {
            albumId,
          },
          required: true,
        },
        {
          model: AssociationEntity,
          required: true,
        },
      ],
    });
    const albumAssociations = await this.associationLinkEntity.findAll({
      where: {
        albumId,
        [Op.or]: [{ isGenre: true }, { isComposer: true }],
      },
    });
    const validAssociationIds: number[] = [];
    for (let i = 0; i < trackAssociations.length; i += 1) {
      const trackAssociation = trackAssociations[i];
      if (trackAssociation) {
        const existingAssociation = albumAssociations.find(
          (a) =>
            a.associationId === trackAssociation.associationId &&
            ((trackAssociation.isGenre && a.isGenre === trackAssociation.isGenre) ||
              (trackAssociation.isComposer && a.isComposer === trackAssociation.isComposer)),
        );
        if (!existingAssociation) {
          const newAssociation = await this.associationLinkEntity.create(
            {
              associationId: trackAssociation.associationId,
              albumId,
              ...(trackAssociation.isGenre ? { isGenre: true } : {}),
              ...(trackAssociation.isComposer ? { isComposer: true } : {}),
            } as AssociationLinkEntity,
            {
              transaction,
            },
          );
          validAssociationIds.push(newAssociation.id);
        } else {
          validAssociationIds.push(existingAssociation.id);
        }
      }
    }
    await this.associationLinkEntity.destroy({
      where: {
        albumId,
        id: {
          [Op.notIn]: validAssociationIds,
        },
        [Op.or]: [{ isGenre: true }, { isComposer: true }],
      },
      transaction,
    });
  }
}
