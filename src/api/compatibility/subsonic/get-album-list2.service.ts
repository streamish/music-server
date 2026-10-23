import { AlbumSortFieldEnum, SortDirectionEnum } from 'src/types/enums';
import { Injectable } from '@nestjs/common';
import { LibraryAlbumDto } from 'src/library/dtos';
import { LibraryService } from 'src/library/library.service';
import { SubsonicAlbumListType } from './subsonic.enums';
import { SubsonicGetAlbumList2QueryDto } from './dtos';

function albumToRow(album: LibraryAlbumDto) {
  return {
    id: `album-${album.id}`,
    album: album.title,
    artist: album.artists.map((artist) => artist.name).join(', '),
    year: album.year,
  };
}

@Injectable()
export class SubsonicGetAlbumList2Service {
  constructor(private readonly library: LibraryService) {}

  async getAlbumList2(accountId: number, query: SubsonicGetAlbumList2QueryDto) {
    // favorite list
    if (query.type === SubsonicAlbumListType.STARRED) {
      const favorites = await this.library.listFavorites(accountId, query.offset || 0, query.size || 100_000);
      const albums = favorites.items.filter((item) => item.album) as LibraryAlbumDto[];
      return albums.map(albumToRow);
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
    const albums = await this.library.listAlbums(
      accountId,
      {
        year: query.fromYear || query.toYear || undefined,
        genre: query.genre ? [query.genre] : undefined,
      },
      query.offset || 0,
      query.size || 100_000,
      sort,
      direction,
    );
    return albums.items.map(albumToRow);
  }
}
