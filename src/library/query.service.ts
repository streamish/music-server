import { AlbumEntity, AssociationEntity, AssociationLinkEntity, TrackEntity } from 'src/database/entities';
import {
  AlbumSortFieldEnum,
  AssociationSortFieldEnum,
  AssociationTypeEnum,
  SortDirectionEnum,
  TrackSortFieldEnum,
} from 'src/types/enums';
import { AssociationFilter } from './types/association-filter';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';
import { TrackFilter } from './types/track-filter';
import { normalizeString } from 'src/utils/strings';
import sequelize, { FindAttributeOptions, FindOptions, Op, OrderItem, Sequelize } from 'sequelize';
import type { AlbumFilter } from './types/album-filter';

@Injectable()
export class LibraryQueryService {
  constructor(
    @InjectModel(AlbumEntity)
    private readonly albumEntity: typeof AlbumEntity,
    @InjectModel(AssociationEntity)
    private readonly associationEntity: typeof AssociationEntity,
  ) {}

  /**
   * Finds associations matching one or more name case-insensitive names or search string
   * returning the IDs for use as a filter in subsequent queries.  If the association
   * type is a genre then the names will be exact-match, otherwise starting-with.
   * @param {number} accountId The ID of the account to filter by
   * @param {AssociationTypeEnum} associationType The type of association to filter by
   * @param {string[]} names An optional list of association names to filter by
   * @param {string} search An optional search string to filter association names
   * @returns {Promise<number[]>} Array of matching association IDs
   */
  private async getAssociationIds(
    accountId: number,
    associationType: AssociationTypeEnum,
    names?: string[],
    search?: string,
  ): Promise<number[]> {
    const namesFilter = names?.length
      ? {
          nameNormalized: {
            [Op.or]: [
              ...names.map((name) => {
                if (associationType === AssociationTypeEnum.GENRE) {
                  return {
                    [Op.eq]: normalizeString(name),
                  };
                }
                return {
                  [Op.like]: `${normalizeString(name)}%`,
                };
              }),
            ],
          },
        }
      : {};
    const searchFilter = search
      ? {
          nameNormalized: {
            [Op.like]: `${normalizeString(search)}%`,
          },
        }
      : {};
    const results = await this.associationEntity.findAll({
      attributes: ['id'],
      where: {
        accountId,
        [Op.or]: [namesFilter, searchFilter],
      },
      include: [
        {
          attributes: [],
          model: AssociationLinkEntity,
          required: true,
          where: {
            ...(associationType === AssociationTypeEnum.ARTIST ? { isArtist: true } : {}),
            ...(associationType === AssociationTypeEnum.COMPOSER ? { isComposer: true } : {}),
            ...(associationType === AssociationTypeEnum.GENRE ? { isGenre: true } : {}),
          },
        },
      ],
    });
    return results.map((association) => association.id);
  }

  /**
   * Creates a GTE, LTE or BETWEEN filter for the rating field based on the provided min and max values.
   * @param {[number]} minRating
   * @param {[number]} maxRating
   * @returns {object} Sequelize filter object for the rating field
   */
  // eslint-disable-next-line class-methods-use-this
  private createRatingFilter(minRating?: number, maxRating?: number): sequelize.WhereOptions {
    if (minRating !== undefined && maxRating !== undefined) {
      return {
        rating: {
          [Op.between]: [minRating, maxRating],
        },
      };
    }
    if (minRating !== undefined) {
      return {
        rating: {
          [Op.gte]: minRating,
        },
      };
    }
    if (maxRating !== undefined) {
      return {
        rating: {
          [Op.lte]: maxRating,
        },
      };
    }
    return {};
  }

  /**
   * Creates a GTE, LTE or BETWEEN filter for the date field based on the provided min and max values.
   * @param {[Date]} minDate
   * @param {[Date]} maxDate
   * @returns {object} Sequelize filter object for the date field
   */
  // eslint-disable-next-line class-methods-use-this
  private createAddedDateFilter(minDate?: Date, maxDate?: Date): sequelize.WhereOptions {
    if (minDate !== undefined && maxDate !== undefined) {
      return {
        createdAt: {
          [Op.between]: [minDate, maxDate],
        },
      };
    }
    if (minDate !== undefined) {
      return {
        createdAt: {
          [Op.gte]: minDate,
        },
      };
    }
    if (maxDate !== undefined) {
      return {
        createdAt: {
          [Op.lte]: maxDate,
        },
      };
    }
    return {};
  }

  /**
   * Creates an `include` reference to an association that may be additionally filtered by search or name.
   * @param {number} accountId The ID of the account for which to create the association join
   * @param {AssociationTypeEnum} associationType The type of association (e.g., artist, composer, genre)
   * @param {string} [filter] Search filter for the association names
   * @param {string[]} [names] Array of association names to filter by
   * @returns An array of Sequelize includeable objects representing the association join
   */
  private async createTrackAssociationJoin(
    accountId: number,
    associationType: AssociationTypeEnum,
    context: 'album' | 'track',
    filter?: string | undefined,
    names?: string[] | undefined,
  ): Promise<sequelize.Includeable[]> {
    const associationIds =
      names?.length || filter ? await this.getAssociationIds(accountId, associationType, names, filter) : [];
    return [
      {
        model: AssociationLinkEntity,
        include: [
          {
            attributes: ['id', 'name', 'createdAt'],
            model: AssociationEntity,
          },
        ],
        separate: true,
        ...(associationType === AssociationTypeEnum.ARTIST
          ? { as: context === 'album' ? 'albumArtists' : 'artists' }
          : {}),
        ...(associationType === AssociationTypeEnum.COMPOSER
          ? { as: context === 'album' ? 'albumComposers' : 'composers' }
          : {}),
        ...(associationType === AssociationTypeEnum.GENRE
          ? { as: context === 'album' ? 'albumGenres' : 'genres' }
          : {}),
        where: {
          ...(associationType === AssociationTypeEnum.ARTIST ? { isArtist: true } : {}),
          ...(associationType === AssociationTypeEnum.COMPOSER ? { isComposer: true } : {}),
          ...(associationType === AssociationTypeEnum.GENRE ? { isGenre: true } : {}),
        },
      },
      ...(associationIds.length
        ? [
            {
              model: AssociationLinkEntity,
              ...(associationType === AssociationTypeEnum.ARTIST
                ? { as: context === 'album' ? 'albumArtistFilter' : 'artistFilter' }
                : {}),
              ...(associationType === AssociationTypeEnum.COMPOSER
                ? { as: context === 'album' ? 'albumComposerFilter' : 'composerFilter' }
                : {}),
              ...(associationType === AssociationTypeEnum.GENRE
                ? { as: context === 'album' ? 'albumGenreFilter' : 'genreFilter' }
                : {}),
              attributes: [],
              required: true,
              where: {
                ...(associationType === AssociationTypeEnum.ARTIST ? { isArtist: true } : {}),
                ...(associationType === AssociationTypeEnum.COMPOSER ? { isComposer: true } : {}),
                ...(associationType === AssociationTypeEnum.GENRE ? { isGenre: true } : {}),
                associationId: associationIds,
              },
            },
          ]
        : []),
    ];
  }

  /**
   * Creates a concatenated association string for the specified association type and album/track
   * context, joining all artists, composers or genres into a comma-delimited string.
   * @param {'is_artist' | 'is_composer' | 'is_genre'} associationType The type of association to match
   * @param {boolean} album Whether the association is for an album (true) or a track (false)
   * @returns {object} Sequelize literal for the concatenated association
   */
  // eslint-disable-next-line class-methods-use-this
  private createConcatenatedAssociation(
    typeColumn: 'is_artist' | 'is_composer' | 'is_genre',
    linkColumn: 'album_id' | 'track_id',
    linkEntity: 'TrackEntity' | 'AlbumEntity',
  ): sequelize.Utils.Literal {
    let parentId: string;
    if (linkColumn === 'album_id') {
      parentId = linkEntity === 'TrackEntity' ? 'album_id' : 'id';
    } else {
      parentId = 'id';
    }
    return Sequelize.literal(` (
    SELECT group_concat(name, ', ')
    FROM (
      SELECT name
      FROM associations
      INNER JOIN association_links
        ON association_links.association_id = associations.id
      WHERE association_links.${linkColumn} = "${linkEntity}".${parentId} AND
          association_links.${typeColumn}=1
      ORDER BY associations.name COLLATE NOCASE
    )
  )`);
  }

  /**
   * Builds an album query with sorting, pagination and filtering options that will return the
   * album data along with album artists, and the aggregated track composers and genres.
   * @param {number} accountId The ID of the account to filter by
   * @param {AlbumFilter} filter The filter criteria for the album query
   * @param {AlbumSortFieldEnum} sortField The field to sort the results by
   * @param {SortDirectionEnum} sortDirection The direction to sort the results (ASC or DESC)
   * @returns {Promise<FindOptions<AlbumEntity>>} The Sequelize find options for the album query
   */
  async buildAlbumQuery(
    accountId: number,
    filter: AlbumFilter,
    sortField?: AlbumSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<FindOptions<AlbumEntity>> {
    // the sort column can be an actual field or a derived field from joined tables
    let sortFieldColumn: string | undefined;
    // the additional sort fields allow sorting by values that are concatenated from
    // joined tables like artist names
    const additionalSortFields: FindAttributeOptions = [];
    switch (sortField) {
      case AlbumSortFieldEnum.ALBUM:
        sortFieldColumn = 'title';
        break;
      case AlbumSortFieldEnum.YEAR:
        sortFieldColumn = 'year';
        break;
      case AlbumSortFieldEnum.RATING:
        sortFieldColumn = 'rating';
        break;
      case AlbumSortFieldEnum.DATE_ADDED:
        sortFieldColumn = 'createdAt';
        break;
      case AlbumSortFieldEnum.DATE_RELEASED:
        sortFieldColumn = 'year';
        break;
      case AlbumSortFieldEnum.ARTIST:
        sortFieldColumn = 'artists';
        additionalSortFields.push([
          this.createConcatenatedAssociation('is_artist', 'album_id', 'AlbumEntity'),
          'artistSort',
        ]);
        break;
      case AlbumSortFieldEnum.ALBUM_ARTIST:
        sortFieldColumn = 'albumArtistSort';
        additionalSortFields.push([
          this.createConcatenatedAssociation('is_artist', 'album_id', 'AlbumEntity'),
          'albumArtistSort',
        ]);
        break;
      case AlbumSortFieldEnum.COMPOSER:
        sortFieldColumn = 'composerSort';
        additionalSortFields.push([
          this.createConcatenatedAssociation('is_composer', 'album_id', 'AlbumEntity'),
          'composerSort',
        ]);
        break;
      case AlbumSortFieldEnum.GENRE:
        sortFieldColumn = 'genreSort';
        additionalSortFields.push([
          this.createConcatenatedAssociation('is_genre', 'album_id', 'AlbumEntity'),
          'genreSort',
        ]);
        break;
      default:
        sortFieldColumn = 'title';
        break;
    }
    const order: OrderItem[] = [];
    if (sortFieldColumn) {
      if (sortField === AlbumSortFieldEnum.RANDOM) {
        order.push(Sequelize.literal('RANDOM()'));
      } else {
        order.push([Sequelize.fn('lower', Sequelize.col(sortFieldColumn as string)), sortDirection || 'ASC']);
      }
    }
    return {
      attributes: [
        'coverImageDarkMuted',
        'coverImageDarkVibrant',
        'coverImageLightMuted',
        'coverImageLightVibrant',
        'coverImageMuted',
        'coverImageVibrant',
        'createdAt',
        'id',
        'title',
        'titleNormalized',
        'year',
        ...additionalSortFields,
        [
          // the aggregated rating value for the album
          this.albumEntity.sequelize!.literal(
            `(
              SELECT ROUND(SUM(rating) / (SELECT COUNT(id) FROM tracks WHERE tracks.album_id=AlbumEntity.id)
            ) FROM tracks WHERE tracks.album_id = AlbumEntity.id)`,
          ),
          'rating',
        ],
      ],
      include: [
        ...(await this.createTrackAssociationJoin(
          accountId,
          AssociationTypeEnum.ARTIST,
          'album',
          filter.filter,
          filter.artist,
        )),
        ...(await this.createTrackAssociationJoin(
          accountId,
          AssociationTypeEnum.GENRE,
          'album',
          filter.filter,
          filter.genre,
        )),
        ...(await this.createTrackAssociationJoin(
          accountId,
          AssociationTypeEnum.COMPOSER,
          'album',
          filter.filter,
          filter.composer,
        )),
      ],
      where: {
        accountId,
        ...(filter.filter && {
          titleNormalized: { [Op.like]: `%${normalizeString(filter.filter)}%` },
        }),
        ...(filter?.year && {
          year: filter.year,
        }),
        ...this.createAddedDateFilter(filter?.addedAfter, filter?.addedBefore),
        ...this.createRatingFilter(filter?.minRating, filter?.maxRating),
      },
      order,
    };
  }

  /**
   * Builds an album association query with sorting, filtering, and pagination options that will
   * return the matching associations with their album data.
   * @param {number} accountId The ID of the account to filter by
   * @param {AssociationFilter} filter The filter criteria for the album association query
   * @param {AssociationSortFieldEnum} sortField The field to sort the results by
   * @param {SortDirectionEnum} sortDirection The direction to sort the results (ASC or DESC)
   * @returns {Promise<FindOptions<AssociationLinkEntity>>} The Sequelize find options for the query
   */
  async buildAlbumAssociationQuery(
    accountId: number,
    filter?: AssociationFilter,
    sortField?: AssociationSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<FindOptions<AssociationLinkEntity>> {
    const order: OrderItem[] = [];
    if (sortField === AssociationSortFieldEnum.RANDOM) {
      order.push(Sequelize.literal('RANDOM()'));
    } else {
      const sortFieldColumn =
        sortField === AssociationSortFieldEnum.DATE_ADDED
          ? Sequelize.col('createdAt')
          : Sequelize.col('association.name');
      order.push([Sequelize.fn('LOWER', sortFieldColumn), sortDirection || 'ASC']);
    }
    const genreIds: number[] = [];
    if (filter?.genre) {
      const filteredGenreIds = await this.getAssociationIds(
        accountId,
        AssociationTypeEnum.GENRE,
        filter?.genre,
        filter?.filter,
      );
      genreIds.push(...filteredGenreIds);
    }
    return {
      attributes: ['associationId'],
      where: {
        albumId: {
          [Op.gte]: 0,
        },
        ...(filter?.isArtist && {
          isArtist: filter.isArtist,
        }),
        ...(filter?.isComposer && {
          isComposer: filter.isComposer,
        }),
        ...(filter?.isGenre && {
          isGenre: filter.isGenre,
        }),
        ...this.createAddedDateFilter(filter?.addedAfter, filter?.addedBefore),
      },
      include: [
        {
          attributes: ['id', 'name', 'nameNormalized', 'createdAt'],
          model: AssociationEntity,
          where: {
            accountId,
            ...(filter?.filter && {
              nameNormalized: { [Op.like]: `%${normalizeString(filter.filter)}%` },
            }),
          },
        },
        {
          attributes: ['id', 'title'],
          model: AlbumEntity,
          required: true,
          include: genreIds.length
            ? [
                {
                  attributes: [],
                  model: AssociationLinkEntity,
                  where: {
                    isGenre: true,
                    associationId: genreIds,
                  },
                  required: true,
                  as: 'albumGenres',
                },
              ]
            : [],
        },
      ],
      order,
    };
  }

  /**
   * Builds an album's track-associations query with sorting, filtering, and pagination options that will
   * return the matching associations.
   * @param {number} accountId The ID of the account to filter by
   * @param {AssociationFilter} filter The filter criteria for the album association query
   * @param {AssociationSortFieldEnum} sortField The field to sort the results by
   * @param {SortDirectionEnum} sortDirection The direction to sort the results (ASC or DESC)
   * @returns {Promise<FindOptions<AssociationEntity>>} The Sequelize find options for the query
   */
  async buildAlbumTrackAssociationQuery(
    accountId: number,
    filter?: AssociationFilter,
    sortField?: AssociationSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<FindOptions<AssociationEntity>> {
    const order: OrderItem[] = [];
    if (sortField === AssociationSortFieldEnum.RANDOM) {
      order.push(Sequelize.literal('RANDOM()'));
    } else {
      const sortFieldColumn = sortField === AssociationSortFieldEnum.DATE_ADDED ? 'createdAt' : 'name';
      order.push([Sequelize.fn('LOWER', Sequelize.col(sortFieldColumn)), sortDirection || 'ASC']);
    }
    // Genres can be specified because associated artists and composers can have multiple genres associated
    // with their works, e.g., if you wanted to browse "Artist 1" and see their "Rock" tracks.
    const genreIds: number[] = [];
    if (filter?.genre) {
      const fetchedGenreIds = await this.getAssociationIds(
        accountId,
        AssociationTypeEnum.GENRE,
        filter?.genre,
        filter?.filter,
      );
      if (fetchedGenreIds.length) {
        genreIds.push(...fetchedGenreIds);
      }
    }
    return {
      attributes: ['id', 'createdAt', 'name'],
      where: {
        accountId,
        ...(filter?.filter && {
          nameNormalized: { [Op.like]: `%${normalizeString(filter.filter)}%` },
        }),
      },
      include: [
        {
          attributes: [],
          model: AssociationLinkEntity,
          required: true,
          where: {
            trackId: {
              [Op.not]: null,
            },
            ...(filter?.isArtist !== undefined && {
              isArtist: filter.isArtist,
            }),
            ...(filter?.isComposer !== undefined && {
              isComposer: filter.isComposer,
            }),
            ...(filter?.isGenre !== undefined && {
              isGenre: filter.isGenre,
              ...(genreIds.length && {
                id: genreIds,
              }),
            }),
            ...this.createAddedDateFilter(filter?.addedAfter, filter?.addedBefore),
          },
        },
      ],
      order,
    };
  }

  /**
   * Builds a track association query with sorting, filtering, and pagination options that will
   * return the matching associations.
   * @param {number} accountId The ID of the account to filter by
   * @param {AssociationFilter} filter The filter criteria for the album association query
   * @param {AssociationSortFieldEnum} sortField The field to sort the results by
   * @param {SortDirectionEnum} sortDirection The direction to sort the results (ASC or DESC)
   * @returns {Promise<FindOptions<AssociationEntity>>} The Sequelize find options for the query
   */
  async buildTrackAssociationQuery(
    accountId: number,
    filter?: AssociationFilter,
    sortField?: AssociationSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<FindOptions<AssociationEntity>> {
    const order: OrderItem[] = [];
    if (sortField === AssociationSortFieldEnum.RANDOM) {
      order.push(sequelize.literal('RANDOM()'));
    } else {
      const sortFieldColumn = sortField === AssociationSortFieldEnum.DATE_ADDED ? 'createdAt' : 'name';
      order.push([Sequelize.fn('LOWER', Sequelize.col(sortFieldColumn)), sortDirection || 'ASC']);
    }
    // Genres can be specified because associated artists and composers can have multiple genres associated
    // with their works, e.g., if you wanted to browse "Artist 1" and see their "Rock" tracks.
    const genreIds: number[] = [];
    if (filter?.genre) {
      const filteredGenreIds = await this.getAssociationIds(accountId, AssociationTypeEnum.GENRE, filter.genre);
      if (filteredGenreIds.length) {
        genreIds.push(...filteredGenreIds);
      }
    }
    return {
      attributes: ['id', 'name', 'createdAt'],
      where: {
        accountId,
        ...(filter?.filter && {
          nameNormalized: { [Op.like]: `%${normalizeString(filter.filter)}%` },
        }),
        ...this.createAddedDateFilter(filter?.addedAfter, filter?.addedBefore),
      },
      include: [
        {
          attributes: ['associationId', 'trackId'],
          model: AssociationLinkEntity,
          as: 'associationLinks',
          where: {
            trackId: {
              [Op.not]: null,
            },
            ...(filter?.isArtist === true && {
              isArtist: filter.isArtist,
            }),
            ...(filter?.isComposer === true && {
              isComposer: filter.isComposer,
            }),
            ...(filter?.isGenre === true && {
              isGenre: filter.isGenre,
            }),
            ...(genreIds.length && {
              [Op.and]: [
                Sequelize.literal(`
              EXISTS (
                SELECT 1
                FROM association_links AS genre_link
                WHERE 
                  genre_link.track_id = "associationLinks"."track_id"
                  AND genre_link.is_genre = 1
                  AND genre_link.association_id IN (${genreIds.join(',')})
              )
            `),
              ],
            }),
          },
          required: true,
        },
      ],
      order,
    };
  }

  /**
   * Builds a track query with sorting, pagination and filtering options that will return the
   * album data along with album artists and track artists, composers and genres.
   * @param {number} accountId The ID of the account to filter by
   * @param {TrackFilter} filter The filter criteria for the track query
   * @param {TrackSortFieldEnum} sortField The field to sort the results by
   * @param {SortDirectionEnum} sortDirection The direction to sort the results (ASC or DESC)
   * @returns {Promise<FindOptions<TrackEntity>>} The Sequelize find options for the query
   */
  async buildTrackQuery(
    accountId: number,
    filter?: TrackFilter,
    sortField?: TrackSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<FindOptions<TrackEntity>> {
    // the sort column can be an actual field or a derived field from joined tables
    let sortFieldColumn: string | undefined;
    // the additional sort fields allow sorting by values concatenated from joined tables
    const additionalSortFields: FindAttributeOptions = [];
    switch (sortField) {
      case TrackSortFieldEnum.DATE_ADDED:
        sortFieldColumn = 'createdAt';
        break;
      case TrackSortFieldEnum.ARTIST:
        sortFieldColumn = 'artistSort';
        additionalSortFields.push([
          this.createConcatenatedAssociation('is_artist', 'track_id', 'TrackEntity'),
          'artistSort',
        ]);
        break;
      case TrackSortFieldEnum.ALBUM_ARTIST:
        sortFieldColumn = 'albumArtistSort';
        additionalSortFields.push([
          this.createConcatenatedAssociation('is_artist', 'album_id', 'TrackEntity'),
          'albumArtistSort',
        ]);
        break;
      case TrackSortFieldEnum.ALBUM:
        sortFieldColumn = 'album.title';
        break;
      case TrackSortFieldEnum.COMPOSER:
        sortFieldColumn = 'composerSort';
        additionalSortFields.push([
          this.createConcatenatedAssociation('is_composer', 'track_id', 'TrackEntity'),
          'composerSort',
        ]);
        break;
      case TrackSortFieldEnum.GENRE:
        sortFieldColumn = 'genresSort';
        additionalSortFields.push([
          this.createConcatenatedAssociation('is_genre', 'track_id', 'TrackEntity'),
          'genresSort',
        ]);
        break;
      case TrackSortFieldEnum.YEAR:
        sortFieldColumn = 'TrackEntity.year';
        break;
      case TrackSortFieldEnum.TITLE:
        sortFieldColumn = 'TrackEntity.title';
        break;
      default:
        break;
    }
    const order: OrderItem[] = [];
    if (sortFieldColumn) {
      order.push([Sequelize.fn('lower', Sequelize.col(sortFieldColumn as string)), sortDirection || 'ASC']);
    } else {
      order.push(
        [Sequelize.fn('lower', Sequelize.col('album.title')), 'ASC'],
        ['discNumber', 'ASC'],
        ['trackNumber', 'ASC'],
      );
    }
    return {
      attributes: [
        'albumId',
        'bitRate',
        'channels',
        'comment',
        'createdAt',
        'discNumber',
        'duration',
        'filePath',
        'fileSize',
        'fileType',
        'frequency',
        'id',
        'rating',
        'title',
        'titleNormalized',
        'trackNumber',
        'year',
        ...additionalSortFields,
      ],
      order,
      include: [
        {
          attributes: [
            'id',
            'title',
            'titleNormalized',
            'coverImageLightVibrant',
            'coverImageDarkVibrant',
            'coverImageMuted',
            'coverImageVibrant',
            'coverImageDarkMuted',
            'coverImageLightMuted',
          ],
          model: AlbumEntity,
          required: true,
          where: {
            ...(filter?.album && {
              titleNormalized: { [Op.like]: `%${normalizeString(filter.album)}%` },
            }),
          },
          include: [...(await this.createTrackAssociationJoin(accountId, AssociationTypeEnum.ARTIST, 'album'))],
        },
        ...(await this.createTrackAssociationJoin(
          accountId,
          AssociationTypeEnum.ARTIST,
          'track',
          filter?.filter,
          filter?.artist,
        )),
        ...(await this.createTrackAssociationJoin(
          accountId,
          AssociationTypeEnum.COMPOSER,
          'track',
          filter?.filter,
          filter?.composer,
        )),
        ...(await this.createTrackAssociationJoin(
          accountId,
          AssociationTypeEnum.GENRE,
          'track',
          filter?.filter,
          filter?.genre,
        )),
      ],
      where: {
        accountId,
        ...(filter?.albumIds?.length && {
          albumId: filter.albumIds,
        }),
        ...(filter?.filter && {
          titleNormalized: { [Op.like]: `%${normalizeString(filter.filter)}%` },
        }),
        ...(filter?.filePath && {
          filePath: { [Op.like]: `${filter.filePath}%` },
        }),
        ...(filter?.year && {
          year: filter.year,
        }),
        ...this.createAddedDateFilter(filter?.addedAfter, filter?.addedBefore),
        ...this.createRatingFilter(filter?.minRating, filter?.maxRating),
      },
    };
  }
}
