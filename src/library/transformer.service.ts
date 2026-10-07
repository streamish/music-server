import { AlbumEntity, AssociationEntity, FavoriteItemEntity, TrackEntity } from 'src/database/entities';
import { ErrorCodes } from 'src/constants/error-codes';
import { Injectable, NotFoundException } from '@nestjs/common';
import { LibraryAlbumDto, LibraryAlbumWithTracksDto } from './dtos/library.album.dto';
import { LibraryAssociationDto } from './dtos/library.association.dto';
import { LibraryFavoriteDto, LibraryFolderDto, LibraryTrackDto } from './dtos';
import { replaceDoubleQuotes } from 'src/utils/strings';
import type { RatingOrUnset } from 'src/types';

@Injectable()
export class LibraryTransformerService {
  // eslint-disable-next-line class-methods-use-this
  convertAlbumEntityToLibraryAlbum(album: AlbumEntity): LibraryAlbumDto {
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
      rating: ((album.get({ plain: true }) as unknown as Record<string, number>).rating as RatingOrUnset) || 0,
      title: replaceDoubleQuotes(album.title),
      year: album.year,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  convertAssociationEntityToLibraryAssociation(association: AssociationEntity): LibraryAssociationDto {
    return {
      id: association?.id || 0,
      name: association?.name || '',
      createdAt: association?.createdAt || new Date(),
    };
  }

  // eslint-disable-next-line class-methods-use-this
  convertFavoriteItemEntityToLibraryFavorite(
    favorite: FavoriteItemEntity,
    folders?: LibraryFolderDto[],
    albums?: LibraryAlbumWithTracksDto[],
  ): LibraryFavoriteDto {
    // Build a favorite album
    if (favorite.album?.id) {
      return {
        id: favorite.id || 0,
        createdAt: favorite.createdAt || new Date(),
        album: this.convertAlbumEntityToLibraryAlbum(favorite.album),
      };
    }
    // Build a favorite track
    if (favorite.track?.id) {
      return {
        id: favorite.id || 0,
        createdAt: favorite.createdAt || new Date(),
        track: this.convertTrackEntityToLibraryTrack(favorite.track),
      };
    }
    // Build a favorite folder
    if (favorite.folderPath) {
      const findFolder = (branches: LibraryFolderDto[]) => {
        for (let i = 0, len = branches.length; i < len; i += 1) {
          const branch = branches[i];
          if (branch) {
            if (branch.fullPath === favorite.folderPath) {
              return branch;
            }
            if (branch.children?.length) {
              const found = findFolder(branch.children);
              if (found) {
                return found;
              }
            }
          }
        }
        return undefined;
      };
      const folder = findFolder(folders || []);
      if (!folder) {
        throw new NotFoundException(ErrorCodes.FOLDER_NOT_FOUND_ERROR);
      }
      return {
        id: favorite.id || 0,
        createdAt: favorite.createdAt || new Date(),
        folder,
      };
    }
    // Build a favorite association
    if (favorite.association?.id) {
      return {
        id: favorite.id || 0,
        createdAt: favorite.createdAt || new Date(),
        associationType: favorite.associationType,
        association: {
          ...this.convertAssociationEntityToLibraryAssociation(favorite.association),
          albums:
            albums?.map((album) => {
              album.tracks.sort((a, b) => {
                // sort by disc number then track number
                if ((!a.discNumber && !b.discNumber) || a.discNumber === b.discNumber) {
                  return a.trackNumber - b.trackNumber;
                }
                return a.discNumber - b.discNumber;
              });
              return album;
            }) || [],
        },
      };
    }
    // Build a favorite playlist
    if (favorite.playlist?.id && !favorite.allSongs && !favorite.randomHundred && !favorite.recentlyAdded) {
      return {
        id: favorite.id || 0,
        createdAt: favorite.createdAt || new Date(),
        playlist: favorite.playlist, // TODO: this.convertPlaylistEntityToLibraryPlaylist(playlist),
      };
    }
    return {
      id: favorite.id || 0,
      createdAt: favorite.createdAt || new Date(),
      allSongs: favorite.allSongs,
      randomHundred: favorite.randomHundred,
      recentlyAdded: favorite.recentlyAdded,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  convertTrackEntityToLibraryTrack(track: TrackEntity): LibraryTrackDto {
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
}
