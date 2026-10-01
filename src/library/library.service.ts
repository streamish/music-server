import { AlbumEntity, AssociationEntity, AssociationLinkEntity, TrackEntity } from 'src/database/entities';
import {
  AlbumSortFieldEnum,
  AssociationSortFieldEnum,
  AssociationTypeEnum,
  SortDirectionEnum,
  TrackSortFieldEnum,
} from 'src/types/enums';
import { AssociationFilter } from './types/association-filter';
import { ErrorCodes } from 'src/constants/error-codes';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, NotFoundException } from '@nestjs/common';
import { LibraryAlbumDto, LibraryAlbumWithTracksDto } from './dtos/library.album.dto';
import { LibraryAssociationDto, LibraryAssociationWithTracksDto } from './dtos/library.association.dto';
import { LibraryTrackDto } from './dtos';
import { TrackFilter } from './types/track-filter';
import { UserTreeItemDto } from 'src/api/user/folder-structure/folder-structure.dto';
import { normalizeString, replaceDoubleQuotes } from 'src/utils/strings';
import { sep } from 'node:path';
import sequelize, { FindAttributeOptions, FindOptions, Op, OrderItem, Sequelize } from 'sequelize';
import type { AlbumFilter } from './types/album-filter';
import type { ListResult } from './types/list-result';
import type { Rating, RatingOrUnset } from 'src/types';

@Injectable()
export class LibraryService {
  constructor(
    @InjectModel(AlbumEntity)
    private readonly albumEntity: typeof AlbumEntity,
    @InjectModel(AssociationEntity)
    private readonly associationEntity: typeof AssociationEntity,
    @InjectModel(AssociationLinkEntity)
    private readonly associationLinkEntity: typeof AssociationLinkEntity,
    @InjectModel(TrackEntity)
    private readonly trackEntity: typeof TrackEntity,
  ) {}

  // eslint-disable-next-line class-methods-use-this
  private async buildAlbumItem(album: AlbumEntity): Promise<LibraryAlbumDto> {
    const albumArtists: LibraryAssociationDto[] =
      album.albumArtists?.map((link) => {
        return {
          createdAt: link.association?.createdAt || new Date(),
          id: link.association?.id || 0,
          name: replaceDoubleQuotes(link.association?.name || ''),
        };
      }) || [];
    const albumComposers: LibraryAssociationDto[] = [];
    const albumGenres: LibraryAssociationDto[] = [];
    if (album.tracks?.length) {
      for (let i = 0, len = album.tracks?.length; i < len; i += 1) {
        const track = album.tracks[i];
        const trackArtists: LibraryAssociationDto[] = [];
        const trackComposers: LibraryAssociationDto[] = [];
        const trackGenres: LibraryAssociationDto[] = [];
        if (track) {
          const artistLinks = track.artists || [];
          for (let j = 0, jLen = artistLinks.length; j < jLen; j += 1) {
            const link = artistLinks[j];
            if (link) {
              const object = {
                createdAt: link.association?.createdAt || new Date(),
                id: link.association?.id || 0,
                name: replaceDoubleQuotes(link.association?.name || ''),
              };
              if (link.isArtist) {
                trackArtists.push(object);
              }
            }
          }
          const composerLinks = track.composers || [];
          for (let j = 0, jLen = composerLinks.length; j < jLen; j += 1) {
            const link = composerLinks[j];
            if (link) {
              const object = {
                createdAt: link.association?.createdAt || new Date(),
                id: link.association?.id || 0,
                name: replaceDoubleQuotes(link.association?.name || ''),
              };
              if (link.isComposer) {
                trackComposers.push(object);
                albumComposers.push(object);
              }
            }
          }
          const genreLinks = track.genres || [];
          for (let j = 0, jLen = genreLinks.length; j < jLen; j += 1) {
            const link = genreLinks[j];
            if (link) {
              const object = {
                createdAt: link.association?.createdAt || new Date(),
                id: link.association?.id || 0,
                name: replaceDoubleQuotes(link.association?.name || ''),
              };
              if (link.isGenre) {
                trackGenres.push(object);
                albumGenres.push(object);
              }
            }
          }
        }
      }
    }
    return {
      artists: albumArtists,
      composers: albumComposers,
      coverImageDarkMuted: album.coverImageDarkMuted || '#000000',
      coverImageDarkVibrant: album.coverImageDarkVibrant || '#000000',
      coverImageLightMuted: album.coverImageLightMuted || '#FFFFFF',
      coverImageLightVibrant: album.coverImageLightVibrant || '#FFFFFF',
      coverImageMuted: album.coverImageMuted || '#000000',
      coverImageVibrant: album.coverImageVibrant || '#FFFFFF',
      createdAt: album.createdAt,
      genres: albumGenres,
      id: album.id,
      rating: ((album as unknown as Record<string, number>).rating ?? 0) as RatingOrUnset,
      title: replaceDoubleQuotes(album.title),
      year: album.year,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  private buildAssociationItem(association: AssociationEntity): LibraryAssociationDto {
    return {
      id: association?.id || 0,
      name: association?.name || '',
      createdAt: association?.createdAt || new Date(),
    };
  }

  // eslint-disable-next-line class-methods-use-this
  private buildTrackItem(track: TrackEntity): LibraryTrackDto {
    return {
      albumArtists:
        track.album?.albumArtists?.map((associationLink) => ({
          id: associationLink.association?.id || 0,
          name: associationLink.association?.name || '',
          createdAt: associationLink.association?.createdAt || new Date(),
        })) || [],
      albumCoverImageDarkMuted: track.album?.coverImageDarkMuted || '#000000',
      albumCoverImageDarkVibrant: track.album?.coverImageDarkVibrant || '#000000',
      albumCoverImageLightMuted: track.album?.coverImageLightMuted || '#FFFFFF',
      albumCoverImageLightVibrant: track.album?.coverImageLightVibrant || '#FFFFFF',
      albumCoverImageMuted: track.album?.coverImageMuted || '#000000',
      albumCoverImageVibrant: track.album?.coverImageVibrant || '#FFFFFF',
      albumId: track.album?.id || 0,
      albumTitle: replaceDoubleQuotes(track.album?.title || ''),
      artists:
        track.artists?.map((associationLink) => ({
          id: associationLink.association?.id || 0,
          name: associationLink.association?.name || '',
          createdAt: associationLink.association?.createdAt || new Date(),
        })) || [],
      comment: replaceDoubleQuotes(track.comment),
      composers:
        track.composers?.map((associationLink) => ({
          id: associationLink.association?.id || 0,
          name: associationLink.association?.name || '',
          createdAt: associationLink.association?.createdAt || new Date(),
        })) || [],
      discNumber: track.discNumber,
      duration: track.duration,
      fileBitRate: track.bitRate,
      fileChannels: track.channels,
      fileFrequency: track.frequency,
      filePath: track.filePath,
      fileSize: track.fileSize,
      fileType: track.fileType,
      genres:
        track.genres?.map((associationLink) => ({
          id: associationLink.association?.id || 0,
          name: associationLink.association?.name || '',
          createdAt: associationLink.association?.createdAt || new Date(),
        })) || [],
      id: track.id,
      rating: track.rating ?? 0,
      title: replaceDoubleQuotes(track.title),
      trackNumber: track.trackNumber,
      year: track.year,
    };
  }

  private async constructAlbumQuery(
    accountId: number,
    filter: AlbumFilter,
    sortField?: AlbumSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<FindOptions<AlbumEntity>> {
    let sortFieldColumn: string | undefined;
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
        break;
      case AlbumSortFieldEnum.ALBUM_ARTIST:
        sortFieldColumn = 'albumArtistSort';
        break;
      case AlbumSortFieldEnum.COMPOSER:
        sortFieldColumn = 'composers';
        break;
      case AlbumSortFieldEnum.GENRE:
        sortFieldColumn = 'genres';
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
    const additionalSortFields: FindAttributeOptions = [];
    if (sortField === AlbumSortFieldEnum.ARTIST) {
      additionalSortFields.push([
        Sequelize.literal(` (
    SELECT group_concat(name, ', ')
    FROM (
      SELECT name
      FROM associations
      INNER JOIN association_links
        ON association_links.association_id = associations.id
      WHERE association_links.track_id = "Track"."id" AND
          association_links.is_artist=1
      ORDER BY associations.name COLLATE NOCASE
    )
  )`),
        'artistSort',
      ]);
    }
    if (sortField === AlbumSortFieldEnum.ALBUM_ARTIST) {
      additionalSortFields.push([
        Sequelize.literal(` (
    SELECT group_concat(name, ', ')
    FROM (
      SELECT name
      FROM associations
      INNER JOIN association_links
        ON association_links.association_id = associations.id
      WHERE association_links.album_id = "AlbumEntity"."id" AND
          association_links.is_artist=1
      ORDER BY associations.name COLLATE NOCASE
    )
  )`),
        'albumArtistSort',
      ]);
    } else if (sortField === AlbumSortFieldEnum.COMPOSER) {
      additionalSortFields.push([
        Sequelize.literal(`
    SELECT group_concat(name, ', ')
    FROM (
      SELECT name
      FROM associations
      INNER JOIN association_links
        ON association_links.association_id = associations.id
      WHERE association_links.album_id = "AlbumEntity"."id" AND
          association_links.is_composer=1
      ORDER BY associations.name COLLATE NOCASE
    )
        `),
        'composerSort',
      ]);
    } else if (sortField === AlbumSortFieldEnum.GENRE) {
      additionalSortFields.push([
        Sequelize.literal(`
    SELECT group_concat(name, ', ')
    FROM (
      SELECT name
      FROM associations
      INNER JOIN association_links
        ON association_links.association_id = associations.id
      WHERE association_links.album_id = "AlbumEntity"."id" AND
          association_links.is_genre=1
      ORDER BY associations.name COLLATE NOCASE
    )
      `),
        'genresSort',
      ]);
    }
    const albumArtistIds: number[] = [];
    if (filter?.artist?.length || filter?.artistIds?.length) {
      const filterArtistIds = await this.getArtistIds(accountId, filter?.artist, filter?.filter);
      albumArtistIds.push(...(filter?.artistIds || []), ...filterArtistIds);
    }
    const composerIds: number[] = [];
    if (filter?.composer?.length || filter?.composerIds?.length) {
      const filterComposerIds = await this.getComposerIds(accountId, filter?.composer, filter?.filter);
      composerIds.push(...(filter?.composerIds || []), ...filterComposerIds);
    }
    const genreIds: number[] = [];
    if (filter?.genre?.length || filter?.genreIds?.length) {
      const filterGenreIds = await this.getGenreIds(accountId, filter?.genre, filter?.filter);
      genreIds.push(...(filter?.genreIds || []), ...filterGenreIds);
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
        'year',
        ...additionalSortFields,
        [
          this.albumEntity.sequelize!.literal(
            `(SELECT ROUND(SUM(rating) / COUNT(rating)) FROM tracks WHERE album_id = id)`,
          ),
          'rating',
        ],
      ],
      include: [
        {
          attributes: ['associationId'],
          model: AssociationLinkEntity,
          where: {
            isArtist: true,
            ...(albumArtistIds.length ? { associationId: albumArtistIds } : {}),
          },
          include: [
            {
              attributes: ['id', 'name', 'createdAt'],
              model: AssociationEntity,
            },
          ],
          as: 'albumArtists',
          required: true,
        },
        {
          attributes: ['associationId'],
          model: AssociationLinkEntity,
          where: {
            isGenre: true,
            ...(genreIds.length ? { associationId: genreIds } : {}),
          },
          include: [
            {
              attributes: ['id', 'name', 'createdAt'],
              model: AssociationEntity,
            },
          ],
          as: 'albumGenres',
          required: genreIds.length > 0,
        },
        {
          attributes: ['associationId'],
          model: AssociationLinkEntity,
          where: {
            isComposer: true,
            ...(composerIds.length ? { associationId: composerIds } : {}),
          },
          include: [
            {
              attributes: ['id', 'name', 'createdAt'],
              model: AssociationEntity,
            },
          ],
          as: 'albumComposers',
          required: composerIds.length > 0,
        },
      ],
      where: {
        accountId,
        ...(filter.filter && {
          title: { [Op.like]: `%${normalizeString(filter.filter)}%` },
        }),
        ...(filter?.year && {
          year: filter.year,
        }),
        ...(filter?.minRating !== undefined && {
          rating: { [Op.gte]: filter.minRating },
        }),
        ...(filter?.maxRating !== undefined && {
          rating: {
            [Op.lte]: filter.maxRating,
          },
        }),
        ...(filter?.addedBefore && {
          createdAt: {
            [Op.lt]: filter.addedBefore,
          },
        }),
        ...(filter?.addedAfter && {
          createdAt: {
            [Op.gt]: filter.addedAfter,
          },
        }),
      },
      order,
    };
  }

  private async constructAlbumAssociationQuery(
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
      const filteredGenreIds = await this.getGenreIds(accountId, filter.genre);
      genreIds.push(...filteredGenreIds);
    }
    return {
      attributes: ['associationId'],
      where: {
        albumId: {
          [Op.gte]: 0,
        },
        ...(filter?.addedBefore && {
          createdAt: {
            [Op.lt]: filter.addedBefore,
          },
        }),
        ...(filter?.addedAfter && {
          createdAt: {
            [Op.gt]: filter.addedAfter,
          },
        }),
        ...(filter?.isArtist && {
          isArtist: filter.isArtist,
        }),
        ...(filter?.isComposer && {
          isComposer: filter.isComposer,
        }),
        ...(filter?.isGenre && {
          isGenre: filter.isGenre,
        }),
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

  private async constructAlbumTrackAssociationQuery(
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
    const genreIds: number[] = [];
    if (filter?.genre) {
      const fetchedGenreIds = await this.getGenreIds(accountId, filter.genre);
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
            ...(filter?.addedBefore && {
              createdAt: {
                [Op.lt]: filter.addedBefore,
              },
            }),
            ...(filter?.addedAfter && {
              createdAt: {
                [Op.gt]: filter.addedAfter,
              },
            }),
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
          },
        },
      ],
      order,
    };
  }

  private async constructTrackAssociationQuery(
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
    const genreIds: number[] = [];
    if (filter?.genre) {
      const filteredGenreIds = await this.getGenreIds(accountId, filter.genre);
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
        ...(filter?.addedBefore && {
          createdAt: {
            [Op.lt]: filter.addedBefore,
          },
        }),
        ...(filter?.addedAfter && {
          createdAt: {
            [Op.gt]: filter.addedAfter,
          },
        }),
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

  private async constructTrackQuery(
    accountId: number,
    filter?: TrackFilter,
    sortField?: TrackSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<FindOptions<TrackEntity>> {
    let sortFieldColumn: string | undefined;
    switch (sortField) {
      case TrackSortFieldEnum.DATE_ADDED:
        sortFieldColumn = 'createdAt';
        break;
      case TrackSortFieldEnum.ARTIST:
        sortFieldColumn = 'artistSort';
        break;
      case TrackSortFieldEnum.ALBUM_ARTIST:
        sortFieldColumn = 'albumArtistSort';
        break;
      case TrackSortFieldEnum.ALBUM:
        sortFieldColumn = 'album.title';
        break;
      case TrackSortFieldEnum.COMPOSER:
        sortFieldColumn = 'composerSort';
        break;
      case TrackSortFieldEnum.GENRE:
        sortFieldColumn = 'genresSort';
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
    const additionalSortFields: FindAttributeOptions = [];
    if (sortField === TrackSortFieldEnum.ARTIST) {
      additionalSortFields.push([
        Sequelize.literal(` (
    SELECT group_concat(name, ', ')
    FROM (
      SELECT name
      FROM associations
      INNER JOIN association_links
        ON association_links.association_id = associations.id
      WHERE association_links.track_id = "TrackEntity"."id" AND
          association_links.is_artist=1
      ORDER BY associations.name COLLATE NOCASE
    )
  )`),
        'artistSort',
      ]);
    } else if (sortField === TrackSortFieldEnum.ALBUM_ARTIST) {
      additionalSortFields.push([
        Sequelize.literal(` (
    SELECT group_concat(name, ', ')
    FROM (
      SELECT name
      FROM associations
      INNER JOIN association_links
        ON association_links.association_id = associations.id
      WHERE association_links.album_id = "TrackEntity"."album_id" AND
          association_links.is_artist=1
      ORDER BY associations.name COLLATE NOCASE
    )
  )`),
        'albumArtistSort',
      ]);
    } else if (sortField === TrackSortFieldEnum.COMPOSER) {
      additionalSortFields.push([
        Sequelize.literal(`
    SELECT group_concat(name, ', ')
    FROM (
      SELECT name
      FROM associations
      INNER JOIN association_links
        ON association_links.association_id = associations.id
      WHERE association_links.track_id = "TrackEntity"."id" AND
          association_links.is_composer=1
      ORDER BY associations.name COLLATE NOCASE
        )
        `),
        'composerSort',
      ]);
    } else if (sortField === TrackSortFieldEnum.GENRE) {
      additionalSortFields.push([
        Sequelize.literal(`
        (
    SELECT group_concat(name, ', ')
    FROM (
      SELECT name
      FROM associations
      INNER JOIN association_links
        ON association_links.association_id = associations.id
      WHERE association_links.track_id = "TrackEntity"."id" AND
          association_links.is_genre=1
      ORDER BY associations.name COLLATE NOCASE
          )
        )
      `),
        'genresSort',
      ]);
    }
    const artistIds: number[] = [];
    if (filter?.artist?.length || filter?.filter) {
      const filterArtistIds = await this.getArtistIds(accountId, filter?.artist, filter?.filter);
      artistIds.push(...filterArtistIds);
    }
    const composerIds: number[] = [];
    if (filter?.composer?.length || filter?.filter) {
      const filterComposerIds = await this.getComposerIds(accountId, filter?.composer, filter?.filter);
      composerIds.push(...filterComposerIds);
    }
    const genreIds: number[] = [];
    if (filter?.genre?.length || filter?.filter) {
      const filterGenreIds = await this.getGenreIds(accountId, filter?.genre, filter?.filter);
      genreIds.push(...filterGenreIds);
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
              title: { [Op.like]: `%${normalizeString(filter.album)}%` },
            }),
          },
          include: [
            {
              attributes: ['id'],
              model: AssociationLinkEntity,
              include: [
                {
                  attributes: ['id', 'name', 'createdAt'],
                  model: AssociationEntity,
                  required: true,
                },
              ],
              where: {
                isArtist: true,
              },
              separate: true,
              as: 'albumArtists',
            },
          ],
        },
        {
          model: AssociationLinkEntity,
          include: [
            {
              attributes: ['id', 'name', 'createdAt'],
              model: AssociationEntity,
              required: true,
            },
          ],
          separate: true,
          as: 'artists',
          where: {
            isArtist: true,
          },
        },
        ...(artistIds.length
          ? [
              {
                model: AssociationLinkEntity,
                as: 'artistFilter',
                required: true,
                attributes: [],
                where: {
                  isArtist: true,
                  associationId: artistIds,
                },
              },
            ]
          : []),
        {
          model: AssociationLinkEntity,
          include: [
            {
              attributes: ['id', 'name', 'createdAt'],
              model: AssociationEntity,
              required: true,
            },
          ],
          separate: true,
          as: 'composers',
          where: {
            isComposer: true,
          },
        },
        ...(composerIds.length
          ? [
              {
                model: AssociationLinkEntity,
                as: 'composerFilter',
                required: true,
                attributes: [],
                where: {
                  isComposer: true,
                  associationId: composerIds,
                },
              },
            ]
          : []),
        {
          model: AssociationLinkEntity,
          include: [
            {
              attributes: ['id', 'name', 'createdAt'],
              model: AssociationEntity,
              required: true,
            },
          ],
          separate: true,
          as: 'genres',
          where: {
            isGenre: true,
          },
        },
        ...(genreIds.length
          ? [
              {
                model: AssociationLinkEntity,
                as: 'genreFilter',
                required: true,
                attributes: [],
                where: {
                  isGenre: true,
                  associationId: genreIds,
                },
              },
            ]
          : []),
      ],
      where: {
        accountId,
        ...(filter?.albumIds?.length && {
          albumId: filter.albumIds,
        }),
        ...(filter?.year && {
          year: filter.year,
        }),
        ...(filter?.minRating !== undefined && {
          rating: { [Op.gte]: filter.minRating },
        }),
        ...(filter?.maxRating !== undefined && {
          rating: {
            [Op.lte]: filter.maxRating,
          },
        }),
        ...(filter?.addedBefore && {
          createdAt: {
            [Op.lt]: filter.addedBefore,
          },
        }),
        ...(filter?.addedAfter && {
          createdAt: {
            [Op.gt]: filter.addedAfter,
          },
        }),
        ...(filter?.filter && {
          title: { [Op.like]: `%${normalizeString(filter.filter)}%` },
        }),
        ...(filter?.filePath && {
          filePath: { [Op.like]: `${filter.filePath}%` },
        }),
      },
    };
  }

  private async getArtistIds(accountId: number, artists?: string[], search?: string): Promise<number[]> {
    const artistFilter = artists?.length
      ? {
          nameNormalized: {
            [Op.or]: [
              ...artists.map((artist) => {
                return {
                  [Op.like]: `${normalizeString(artist)}%`,
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
        [Op.or]: [artistFilter, searchFilter],
      },
    });
    return results.map((artist) => artist.id);
  }

  private async getComposerIds(accountId: number, composers?: string[], search?: string): Promise<number[]> {
    const composerFilter = composers?.length
      ? {
          nameNormalized: {
            [Op.or]: [
              ...composers.map((composer) => {
                return {
                  [Op.like]: `${normalizeString(composer)}%`,
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
        [Op.or]: [composerFilter, searchFilter],
      },
    });
    return results.map((composer) => composer.id);
  }

  private async getGenreIds(accountId: number, genres?: string[], search?: string): Promise<number[]> {
    const genreFilter = genres?.length
      ? {
          nameNormalized: {
            [Op.or]: genres.map(normalizeString),
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
        [Op.or]: [genreFilter, searchFilter],
      },
    });
    return results.map((genre) => genre.id);
  }

  /**
   * Returns lists of album-associated artists, composers and genres filtered by account ID and other criteria.
   * @param {number} accountId
   * @param {AssociationFilter} filter
   * @param {number} offset
   * @param {number} limit
   * @param {AssociationSortFieldEnum} sortField
   * @param {SortDirectionEnum} sortDirection
   * @returns {Promise<ListResult<LibraryAssociationDto>>}
   */
  async listAlbumAssociations(
    accountId: number,
    filter: AssociationFilter,
    offset: number,
    limit: number,
    sortField?: AssociationSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryAssociationDto>> {
    const query = await this.constructAlbumAssociationQuery(accountId, filter, sortField, sortDirection);
    const associations = await this.associationLinkEntity.findAll({
      ...query,
      offset,
      limit,
      group: ['association.name'],
      subQuery: false,
    });
    const totals = await this.associationLinkEntity.count({
      ...query,
      group: ['association.name'],
    });
    return {
      items: associations.map((link) => this.buildAssociationItem(link.association!)),
      total: totals.length,
    };
  }

  async listAlbumAssociationsViaTracks(
    accountId: number,
    filter: AssociationFilter,
    offset: number,
    limit: number,
    sortField?: AssociationSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryAssociationDto>> {
    const query = await this.constructAlbumTrackAssociationQuery(accountId, filter, sortField, sortDirection);
    const associations = await this.associationEntity.findAll({
      ...query,
      offset,
      limit,
      group: ['name'],
    });
    const totals = await this.associationEntity.count({
      ...query,
      group: ['name'],
    });
    return {
      items: associations.map((association) => this.buildAssociationItem(association)),
      total: totals.length,
    };
  }

  /**
   * Returns lists of track-associated artists, composers and genres filtered by account ID and other criteria.
   * @param {number} accountId
   * @param {AssociationFilter} filter
   * @param {number} offset
   * @param {number} limit
   * @param {AssociationSortFieldEnum} sortField
   * @param {SortDirectionEnum} sortDirection
   * @returns {Promise<ListResult<LibraryAssociationDto>>}
   */
  async listTrackAssociations(
    accountId: number,
    filter: AssociationFilter,
    offset: number,
    limit: number,
    sortField?: AssociationSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryAssociationDto>> {
    const query = await this.constructTrackAssociationQuery(accountId, filter, sortField, sortDirection);
    const associations = await this.associationEntity.findAll({ ...query, offset, limit, group: ['name'] });
    const totals = await this.associationEntity.count({ ...query, group: ['name'] });
    return {
      total: totals.length,
      items: associations.map(this.buildAssociationItem),
    };
  }

  /**
   * Returns a list of albums belonging to an account, optionally paginated, filtered and sorted by the
   * specified parameters.
   * @param {number} accountId The user performing the search
   * @param {AlbumFilter} filtes The search parameters for the albums
   * @param {number} offset Optional pagination offset
   * @param {number} limit Optional pagination limit
   * @param {AlbumSortFieldEnum} sortField Optional field to sort the results by
   * @param {SortDirectionEnum} sortDirection Optional sort order specification
   * @returns {Promise<ListResult<LibraryAlbumDto>>} The album list and total record count.
   */
  async listAlbums(
    accountId: number,
    filter: AlbumFilter,
    offset: number,
    limit: number,
    sortField?: AlbumSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryAlbumDto>> {
    const query = await this.constructAlbumQuery(accountId, filter, sortField, sortDirection);
    const albums = await this.albumEntity.findAndCountAll({
      ...query,
      limit,
      offset,
      group: ['AlbumEntity.id'],
    });
    return {
      total: albums.count.length,
      items: await Promise.all(albums.rows.map(this.buildAlbumItem)),
    };
  }

  /**
   * Lists all folders for a given account in a tree structure.
   * @param {number} accountId The user performing the search
   * @returns {Promise<UserTreeItemDto[]>} The tree structure of folders for the account
   */
  async listFolders(accountId: number): Promise<UserTreeItemDto[]> {
    const tracks = await this.listTracks(accountId, {}, 0, 100_000);
    function sortChildren(node: UserTreeItemDto) {
      node.children?.sort((a, b) => (a.folder || a.file || '').localeCompare(b.folder || b.file || ''));
      node.children?.forEach(sortChildren);
    }
    const root: UserTreeItemDto = {
      folder: '',
      file: '',
      fullPath: '',
      id: 0,
      children: [],
    };
    let folderId = 0;
    const directoryMap = new Map([['', root]]);
    for (let i = 0, len = tracks.items.length; i < len; i += 1) {
      const track = tracks.items[i];
      if (track) {
        const { filePath } = track;
        const parts = filePath.split('/').filter(Boolean);
        let currentPath = '';
        let parent = root;
        for (let j = 0, jLen = parts.length; j < jLen; j += 1) {
          const part = parts[j];
          if (part) {
            currentPath += `/${part}`;
            let node = directoryMap.get(currentPath);
            if (!node) {
              const isFile = j === parts.length - 1;
              if (!isFile) {
                folderId += 1;
              }
              node = {
                folder: isFile ? '' : part,
                fullPath: currentPath,
                track: isFile ? track : undefined,
                ...(isFile
                  ? { id: track.id, file: track.filePath.split(sep).pop() || '' }
                  : { children: [], id: folderId }),
              };
              parent.children?.push(node);
              directoryMap.set(currentPath, node);
            }
            parent = node;
          }
        }
      }
    }
    sortChildren(root);
    return root.children || [];
  }

  /**
   * Lists all tracks optionally paginated, filtered and sorted by the specified parameters
   * @param {number} accountId The user performing the search
   * @param {TrackFilter} filter The search parameters for the tracks
   * @param {number} offset The number of items to skip before starting to collect the result set
   * @param {number} limit The maximum number of items to return
   * @param {TrackSortFieldEnum} [sortField] The field by which to sort the tracks
   * @param {SortDirectionEnum} [sortDirection] The direction in which to sort the tracks
   * @returns {Promise<ListResult<LibraryTrackDto>>} The list of tracks with their albums and track details.
   */
  async listTracks(
    accountId: number,
    filter: TrackFilter,
    offset: number,
    limit: number,
    sortField?: TrackSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryTrackDto>> {
    const query = await this.constructTrackQuery(accountId, filter, sortField, sortDirection);
    const data = await this.trackEntity.findAll({
      ...query,
      limit,
      offset,
      logging: false,
      subQuery: false,
    });
    const count = await this.trackEntity.count({
      ...query,
      logging: false,
    });
    return {
      items: data.map(this.buildTrackItem),
      total: count,
    };
  }

  /**
   * Rates the specified tracks for the given account.
   * @param {number} accountId The ID of the account performing the rating
   * @param {number[]} fileIds The IDs of the files (tracks) to be rated
   * @param {RatingOrUnset} rating The rating value `0` `1` `2` `3` `4` `5` to be applied to the specified tracks
   */
  async rateTracks(accountId: number, fileIds: number[], rating: RatingOrUnset): Promise<void> {
    const files = await this.trackEntity.findAll({
      where: {
        accountId,
        id: fileIds,
      },
    });
    if (files.length !== fileIds.length) {
      throw new NotFoundException(ErrorCodes.FILE_NOT_FOUND_ERROR);
    }
    const newValue: Rating | null = rating > 0 ? (rating as Rating) : null;
    await this.trackEntity.update(
      {
        rating: newValue,
      },
      {
        where: {
          accountId,
          id: fileIds,
        },
      },
    );
  }

  async retrieveAlbum(accountId: number, albumIds: number | number[]): Promise<LibraryAlbumWithTracksDto[]> {
    const query = await this.constructAlbumQuery(accountId, {});
    const albums = await this.albumEntity.findAll({
      ...query,
      where: {
        ...query.where,
        id: albumIds,
      },
    });
    if (!albums || albums.length === 0) {
      throw new NotFoundException(ErrorCodes.ALBUM_NOT_FOUND_ERROR);
    }
    albums.sort((a, b) => {
      if (Array.isArray(albumIds)) {
        return albumIds.indexOf(a.id) - albumIds.indexOf(b.id);
      }
      return 0;
    });
    const tracks = await this.listTracks(
      accountId,
      {
        albumIds: Array.isArray(albumIds) ? albumIds : [albumIds],
      },
      0,
      100_000,
    );
    return Promise.all(
      albums.map(async (album) => {
        const builtAlbum = await this.buildAlbumItem(album);
        const albumTracks = tracks.items.filter((track) => track.albumId === album.id);
        return {
          ...builtAlbum,
          tracks: albumTracks,
        };
      }),
    );
  }

  async retrieveAlbumAssociation(
    accountId: number,
    associationIds: number | number[],
    associationType: AssociationTypeEnum,
  ): Promise<LibraryAssociationWithTracksDto[]> {
    const trackQuery = await this.constructTrackAssociationQuery(accountId, {
      ...(associationType === AssociationTypeEnum.ARTIST ? { isArtist: true } : {}),
      ...(associationType === AssociationTypeEnum.COMPOSER ? { isComposer: true } : {}),
      ...(associationType === AssociationTypeEnum.GENRE ? { isGenre: true } : {}),
    });
    const associations = await this.associationEntity.findAll({
      ...trackQuery,
      include: [
        {
          ...(Array.isArray(trackQuery.include) ? trackQuery.include : []),
          model: AssociationLinkEntity,
          where: {
            albumId: {
              [Op.gte]: 0,
            },
            ...(associationType === AssociationTypeEnum.ARTIST ? { isArtist: true } : {}),
            ...(associationType === AssociationTypeEnum.COMPOSER ? { isComposer: true } : {}),
            ...(associationType === AssociationTypeEnum.GENRE ? { isGenre: true } : {}),
          },
        },
      ],
      where: {
        ...trackQuery.where,
        id: associationIds,
      },
    });
    if (!associations || associations.length === 0) {
      return [];
    }
    associations.sort((a, b) => {
      if (Array.isArray(associationIds)) {
        return associationIds.indexOf(a.id) - associationIds.indexOf(b.id);
      }
      return 0;
    });
    const albumIds = Array.from(
      new Set(associations.map((association) => association.associationLinks.map((link) => link.albumId || 0)).flat()),
    );
    const albums = await this.retrieveAlbum(accountId, albumIds);
    return Promise.all(
      associations.map(async (association) => {
        const builtAssociation = this.buildAssociationItem(association);
        return {
          ...builtAssociation,
          albums,
        };
      }),
    );
  }

  async retrieveTrackAssociation(
    accountId: number,
    associationIds: number | number[],
    associationType: AssociationTypeEnum,
  ): Promise<LibraryAssociationWithTracksDto[]> {
    const associationQuery = await this.constructTrackAssociationQuery(accountId, {
      isArtist: associationType === AssociationTypeEnum.ARTIST ? true : undefined,
      isComposer: associationType === AssociationTypeEnum.COMPOSER ? true : undefined,
      isGenre: associationType === AssociationTypeEnum.GENRE ? true : undefined,
    });
    const associations = await this.associationEntity.findAll({
      ...associationQuery,
      where: {
        ...associationQuery.where,
        id: associationIds,
      },
    });
    if (!associations || associations.length === 0) {
      return [];
    }
    associations.sort((a, b) => {
      if (Array.isArray(associationIds)) {
        return associationIds.indexOf(a.id) - associationIds.indexOf(b.id);
      }
      return a.id === associationIds ? -1 : 1;
    });
    const trackIds = associations.flatMap((a) => a.associationLinks.map((link) => link.trackId));
    const tracks = await this.retrieveTrack(accountId, trackIds);
    const albumIds = Array.from(new Set(tracks.map((track) => track.albumId)));
    const albums = await this.retrieveAlbum(accountId, albumIds);
    return associations.map((association) => {
      const builtAssociation = this.buildAssociationItem(association);
      const assocationTrackIds = Array.from(new Set(association.associationLinks.map((link) => link.trackId)));
      const associationTracks = tracks.filter((track) => assocationTrackIds.includes(track.id));
      const associationAlbumIds = Array.from(new Set(associationTracks.map((track) => track.albumId)));
      return {
        ...builtAssociation,
        albums: albums
          .filter((album) => associationAlbumIds.includes(album.id))
          .map((album) => {
            const albumTracks = associationTracks.filter((track) => track.albumId === album.id);
            return {
              ...album,
              tracks: albumTracks,
            };
          }),
      };
    });
  }

  async retrieveTrack(accountId: number, trackIds: number | number[]): Promise<LibraryTrackDto[]> {
    const query = await this.constructTrackQuery(accountId, {});
    const tracks = await this.trackEntity.findAll({
      ...query,
      where: {
        ...query.where,
        id: trackIds,
      },
    });
    if (!tracks || tracks.length === 0) {
      throw new NotFoundException(ErrorCodes.TRACKS_NOT_FOUND_ERROR);
    }
    return tracks.map(this.buildTrackItem);
  }
}
