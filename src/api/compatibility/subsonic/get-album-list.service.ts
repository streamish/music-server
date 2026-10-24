import { AlbumSortFieldEnum, SortDirectionEnum } from 'src/types/enums';
import { Injectable } from '@nestjs/common';
import { LibraryAlbumDto, LibraryTrackDto } from 'src/library/dtos';
import { LibraryService } from 'src/library/library.service';
import { SubsonicAlbumList2QueryDto, SubsonicAlbumListQueryDto } from './dtos';
import { SubsonicAlbumListType } from './subsonic.enums';
import { libraryAlbumToRow } from './subsonic.mapper';

@Injectable()
export class SubsonicAlbumListService {
  constructor(private readonly libraryService: LibraryService) {}

  async getAlbumList(userId: number, query: SubsonicAlbumListQueryDto) {
    // favorite list
    if (query.type === SubsonicAlbumListType.STARRED) {
      const favorites = await this.libraryService.listFavorites(userId, query.offset || 0, query.size || 100_000);
      const albums = favorites.items.filter((item) => item.album) as LibraryAlbumDto[];
      return albums.map(libraryAlbumToRow);
    }
    // sorted list
    let sort: AlbumSortFieldEnum | undefined;
    let direction: SortDirectionEnum | undefined;
    if (query.type === SubsonicAlbumListType.ALPHABETICALLY_BY_ARTIST) {
      sort = AlbumSortFieldEnum.ARTIST;
    } else if (query.type === SubsonicAlbumListType.ALPHABETICALLY_BY_NAME) {
      sort = AlbumSortFieldEnum.ALBUM;
    } else if (query.type === SubsonicAlbumListType.NEWEST) {
      sort = AlbumSortFieldEnum.YEAR;
      direction = SortDirectionEnum.DESC;
    } else if (query.type === SubsonicAlbumListType.HIGHEST_RATING) {
      sort = AlbumSortFieldEnum.RATING;
      direction = SortDirectionEnum.DESC;
    } else if (query.type === SubsonicAlbumListType.RANDOM) {
      sort = AlbumSortFieldEnum.RANDOM;
    }
    // TODO: "frequent" for most-played is not implemented (play counting is not available yet)
    const albums = await this.libraryService.listAlbums(
      userId,
      {
        year: query.fromYear || query.toYear || undefined,
        genre: query.genre ? [query.genre] : undefined,
        rootPathId: query.musicFolderId || undefined,
      },
      query.offset || 0,
      query.size || 100_000,
      sort,
      direction,
    );
    if (!albums.items || albums.items.length === 0) {
      return [];
    }
    return albums.items.map(libraryAlbumToRow);
  }

  async getAlbumList2(userId: number, query: SubsonicAlbumList2QueryDto) {
    // favorite list
    if (query.type === SubsonicAlbumListType.STARRED) {
      const favorites = await this.libraryService.listFavorites(userId, query.offset || 0, query.size || 100_000);
      const albums = favorites.items.filter((item) => item.album) as LibraryAlbumDto[];
      return albums.map(libraryAlbumToRow);
    }
    // sorted list
    let sort: AlbumSortFieldEnum | undefined;
    let direction: SortDirectionEnum | undefined;
    if (query.type === SubsonicAlbumListType.ALPHABETICALLY_BY_ARTIST) {
      sort = AlbumSortFieldEnum.ARTIST;
    } else if (query.type === SubsonicAlbumListType.ALPHABETICALLY_BY_NAME) {
      sort = AlbumSortFieldEnum.ALBUM;
    } else if (query.type === SubsonicAlbumListType.NEWEST) {
      sort = AlbumSortFieldEnum.YEAR;
      direction = SortDirectionEnum.DESC;
    } else if (query.type === SubsonicAlbumListType.HIGHEST_RATING) {
      sort = AlbumSortFieldEnum.RATING;
      direction = SortDirectionEnum.DESC;
    } else if (query.type === SubsonicAlbumListType.RANDOM) {
      sort = AlbumSortFieldEnum.RANDOM;
    }
    // TODO: "frequent" for most-played is not implemented (play counting is not available yet)
    const albums = await this.libraryService.listAlbums(
      userId,
      {
        year: query.fromYear || query.toYear || undefined,
        genre: query.genre ? [query.genre] : undefined,
      },
      query.offset || 0,
      query.size || 100_000,
      sort,
      direction,
    );
    if (!albums.items || albums.items.length === 0) {
      return [];
    }
    const albumIds = albums.items.map((album) => album.id);
    const trackList = await this.libraryService.listTracks(userId, { albumIds }, 0, 100_000);
    const trackIndex: Record<number, LibraryTrackDto[]> = {};
    for (let i = 0, len = trackList.items.length; i < len; i += 1) {
      const track = trackList.items[i];
      if (track) {
        const array = trackIndex[track.albumId];
        if (array) {
          array.push(track);
        } else {
          trackIndex[track.albumId] = [track];
        }
      }
    }
    return albums.items.map((album) => {
      const tracks = trackIndex[album.id] || [];
      return {
        ...libraryAlbumToRow(album),
        songCount: tracks.length,
      };
    });
  }
}
