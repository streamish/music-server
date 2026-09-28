import { AssociationTypeEnum } from 'src/types/enums';
import { ErrorCodes } from 'src/constants/error-codes';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, NotFoundException } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { TrackCustomDataEntity, TrackEntity } from 'src/database/entities';

@Injectable()
export class CustomDataService {
  constructor(
    @InjectModel(TrackEntity)
    private readonly trackEntity: typeof TrackEntity,
    @InjectModel(TrackCustomDataEntity)
    private readonly trackCustomDataEntity: typeof TrackCustomDataEntity,
    private readonly libraryService: LibraryService,
  ) {}

  /**
   * Sets custom name for the specified album artist.
   * @param {number} accountId The ID of the account performing the update
   * @param {number} associationId The ID of the album artist to update
   * @param {string} name The custom name value to set for the artist
   * @returns {Promise<number[]>} The file IDs that were updated and need re-scanning
   */
  async setCustomAlbumArtistName(accountId: number, associationId: number, name: string): Promise<number[]> {
    const albumArtists = await this.libraryService.retrieveAlbumAssociation(
      accountId,
      associationId,
      AssociationTypeEnum.ARTIST,
    );
    const albumArtist = albumArtists[0];
    if (!albumArtist) {
      return [];
    }
    const trackIds = albumArtist.albums.flatMap((album) => album.tracks.map((track) => track.id));
    for (let i = 0, len = albumArtist.albums.length; i < len; i += 1) {
      const album = albumArtist.albums[i];
      if (album) {
        const newAlbumArtists = album.artists
          .map((a) => {
            return a.id === associationId ? name : a.name;
          })
          .join(', ');
        for (let j = 0, jLen = album.tracks.length; j < jLen; j += 1) {
          const track = album.tracks[j];
          if (track) {
            // eslint-disable-next-line no-await-in-loop
            const existingCustomData = await this.trackCustomDataEntity.findOne({
              where: {
                id: track.id,
              },
              attributes: ['id'],
            });
            if (existingCustomData) {
              // eslint-disable-next-line no-await-in-loop
              await this.trackCustomDataEntity.update(
                {
                  albumArtists: newAlbumArtists,
                },
                {
                  where: {
                    id: track.id,
                  },
                },
              );
            } else {
              // eslint-disable-next-line no-await-in-loop
              await this.trackCustomDataEntity.create({
                albumArtists: newAlbumArtists,
                id: track.id,
                trackId: track.id,
              } as TrackCustomDataEntity);
            }
          }
        }
      }
    }
    return trackIds;
  }

  /**
   * Sets custom name for the specified track artist.
   * @param {number} accountId The ID of the account performing the update
   * @param {number} associationId The ID of the track artist to update
   * @param {string} name The custom name value to set for the artist
   * @returns {Promise<number[]>} The file IDs that were updated and need re-scanning
   */
  async setCustomTrackArtistName(accountId: number, associationId: number, name: string): Promise<number[]> {
    const trackArtists = await this.libraryService.retrieveTrackAssociation(
      accountId,
      associationId,
      AssociationTypeEnum.ARTIST,
    );
    const trackArtist = trackArtists[0];
    if (!trackArtist) {
      return [];
    }
    const tracks = trackArtist.albums.map((album) => album.tracks).flat();
    for (let j = 0, trackLen = tracks.length; j < trackLen; j += 1) {
      const track = tracks[j];
      if (track) {
        const newTrackArtists = track.artists
          .map((a) => {
            return a.id === associationId ? name : a.name;
          })
          .join(', ');
        // eslint-disable-next-line no-await-in-loop
        const existingCustomData = await this.trackCustomDataEntity.findOne({
          where: {
            id: track.id,
          },
          attributes: ['id'],
        });
        if (existingCustomData) {
          // eslint-disable-next-line no-await-in-loop
          await this.trackCustomDataEntity.update(
            {
              artists: newTrackArtists,
            },
            {
              where: {
                id: track.id,
              },
            },
          );
        } else {
          // eslint-disable-next-line no-await-in-loop
          await this.trackCustomDataEntity.create({
            artists: newTrackArtists,
            id: track.id,
            trackId: track.id,
          } as TrackCustomDataEntity);
        }
      }
    }
    return tracks.map((track) => track.id);
  }

  /**
   * Sets custom name for the specified track composer.
   * @param {number} accountId The ID of the account performing the update
   * @param {number} composerId The ID of the composer to update
   * @param {string} name The custom name value to set for the composer
   * @returns {Promise<number[]>} The file IDs that were updated and need re-scanning
   */
  async setCustomTrackComposerName(accountId: number, composerId: number, name: string): Promise<number[]> {
    const trackComposers = await this.libraryService.retrieveTrackAssociation(
      accountId,
      composerId,
      AssociationTypeEnum.COMPOSER,
    );
    const trackComposer = trackComposers[0];
    if (!trackComposer) {
      throw new NotFoundException(ErrorCodes.COMPOSER_NOT_FOUND_ERROR);
    }
    const tracks = trackComposer.albums.map((album) => album.tracks).flat();
    for (let j = 0, trackLen = tracks.length; j < trackLen; j += 1) {
      const track = tracks[j];
      if (track) {
        const newTrackComposers = track.composers
          .map((c) => {
            return c.id === composerId ? name : c.name;
          })
          .join(', ');
        // eslint-disable-next-line no-await-in-loop
        const existingCustomData = await this.trackCustomDataEntity.findOne({
          where: {
            id: track.id,
          },
          attributes: ['id'],
        });
        if (existingCustomData) {
          // eslint-disable-next-line no-await-in-loop
          await this.trackCustomDataEntity.update(
            {
              composers: newTrackComposers,
            },
            {
              where: {
                id: track.id,
              },
            },
          );
        } else {
          // eslint-disable-next-line no-await-in-loop
          await this.trackCustomDataEntity.create({
            composers: newTrackComposers,
            id: track.id,
            trackId: track.id,
          } as TrackCustomDataEntity);
        }
      }
    }
    return tracks.map((track) => track.id);
  }

  /**
   * Sets a custom genre name for all tracks associated with the specified genre.
   * @param {number} accountId The ID of the account performing the update
   * @param {number} genreId The ID of the genre to update
   * @param {string} name The custom genre name to set for the tracks
   * @returns {Promise<number[]>} The file IDs that were updated and need re-scanning
   */
  async setCustomTrackGenreName(accountId: number, genreId: number, name: string): Promise<number[]> {
    const trackGenres = await this.libraryService.retrieveTrackAssociation(
      accountId,
      genreId,
      AssociationTypeEnum.GENRE,
    );
    const trackGenre = trackGenres[0];
    if (!trackGenre) {
      throw new NotFoundException(ErrorCodes.GENRE_NOT_FOUND_ERROR);
    }
    const tracks = trackGenre.albums.map((album) => album.tracks).flat();
    for (let j = 0, trackLen = tracks.length; j < trackLen; j += 1) {
      const track = tracks[j];
      if (track) {
        const newTrackGenres = track.genres
          .map((g) => {
            return g.id === genreId ? name : g.name;
          })
          .join(', ');
        // eslint-disable-next-line no-await-in-loop
        const existingCustomData = await this.trackCustomDataEntity.findOne({
          where: {
            id: track.id,
          },
          attributes: ['id'],
        });
        if (existingCustomData) {
          // eslint-disable-next-line no-await-in-loop
          await this.trackCustomDataEntity.update(
            {
              genres: newTrackGenres,
            },
            {
              where: {
                id: track.id,
              },
            },
          );
        } else {
          // eslint-disable-next-line no-await-in-loop
          await this.trackCustomDataEntity.create({
            genres: newTrackGenres,
            id: track.id,
            trackId: track.id,
          } as TrackCustomDataEntity);
        }
      }
    }
    return tracks.map((track) => track.id);
  }

  /**
   * Sets custom data for the specified album.
   * @param {number} accountId The ID of the account performing the update
   * @param {number} albumId The ID of the album to update
   * @param {string} albumTitle The custom title value to set for the album
   * @param {string} albumArtists The custom artists value to set for the album
   * @param {number} year The custom year value to set for the album
   * @returns {Promise<number[]>} The file IDs that were updated and need re-scanning
   */
  async setCustomAlbumData(
    accountId: number,
    albumId: number,
    albumTitle: string,
    albumArtists: string,
    year: number,
  ): Promise<number[]> {
    const albums = await this.libraryService.retrieveAlbum(accountId, albumId);
    const album = albums[0];
    if (!album) {
      throw new NotFoundException(ErrorCodes.ALBUM_NOT_FOUND_ERROR);
    }
    for (let i = 0, len = album.tracks.length; i < len; i += 1) {
      const file = album.tracks[i];
      if (file) {
        // eslint-disable-next-line no-await-in-loop
        const existingCustomData = await this.trackCustomDataEntity.findOne({
          where: {
            id: file.id,
          },
          attributes: ['id'],
        });
        if (existingCustomData) {
          // eslint-disable-next-line no-await-in-loop
          await this.trackCustomDataEntity.update(
            {
              albumTitle,
              albumArtists,
              year,
            },
            {
              where: {
                id: file.id,
              },
            },
          );
        } else {
          // eslint-disable-next-line no-await-in-loop
          await this.trackCustomDataEntity.create({
            albumTitle,
            albumArtists,
            year,
            id: file.id,
            trackId: file.id,
          } as TrackCustomDataEntity);
        }
      }
    }
    return album.tracks.map((track) => track.id);
  }

  /**
   * Sets custom data for the specified track.
   * @param {number} accountId The ID of the account that owns the track.
   * @param {number} trackId The ID of the track file.
   * @param {string} title The custom title for the track.
   * @param {string} artists The custom artists for the track.
   * @param {string} composers The custom composers for the track.
   * @param {string} genres The custom genres for the track.
   * @param {string} comment The custom comment for the track.
   * @param {number} discNumber The custom disc number for the track.
   * @param {number} trackNumber The custom track number for the track.
   * @param {number} year The custom year for the track.
   * @returns {Promise<number>} The file ID that was updated and need re-scanning
   */
  async setCustomTrackData(
    accountId: number,
    trackId: number,
    title: string,
    artists: string,
    composers: string,
    genres: string,
    comment: string,
    discNumber: number,
    trackNumber: number,
    year: number,
  ): Promise<number> {
    const file = await this.trackEntity.findByPk(trackId, {
      attributes: ['accountId'],
    });
    if (!file || file.accountId !== accountId) {
      throw new NotFoundException(ErrorCodes.FILE_NOT_FOUND_ERROR);
    }
    const existingData = await this.trackCustomDataEntity.findOne({
      where: {
        id: trackId,
      },
      attributes: ['id'],
    });
    const data: TrackCustomDataEntity = {
      artists,
      composers,
      genres,
      comment,
      discNumber,
      trackId,
      id: trackId,
      title,
      trackNumber,
      year,
    } as TrackCustomDataEntity;
    if (existingData) {
      await this.trackCustomDataEntity.update(data, { where: { id: trackId } });
    } else {
      await this.trackCustomDataEntity.create(data);
    }
    return trackId;
  }
}
