import {
  AlbumSortFieldEnum,
  AssociationSortFieldEnum,
  AssociationTypeEnum,
  SortDirectionEnum,
  TrackSortFieldEnum,
} from 'src/types/enums';
import { Injectable } from '@nestjs/common';
import { LibraryAlbumDto, LibraryAssociationDto, LibraryFolderDto, LibraryTrackDto } from 'src/library/dtos';
import { LibraryService } from 'src/library/library.service';
import { sep } from 'path';

function songToRow(track: LibraryTrackDto) {
  return {
    Album: track.albumTitle,
    AlbumArtist: track.albumArtists.map((artist) => artist.name).join(', '),
    Artist: track.artists.map((artist) => artist.name).join(', '),
    audio_playtime: track.duration * 1000,
    did: '',
    Disc: track.discNumber,
    Extension: track.filePath.split('.').pop(),
    favorite: 0,
    FileName: track.filePath,
    FilePath: track.filePath,
    FileSize: track.fileSize,
    FileType: 'music',
    Formatid: 3, // TODO: may refer to MP3, FLAC etc not sure
    Genre: track.genres.map((item) => item.name).join(', '),
    ImagePath: `api/mediacover_api.php?albumId=${track.albumId}`,
    iOrderNr: '',
    LinkID: `music_${track.id}`,
    MediaType: 0, // TODO: may refer to MP3, FLAC etc not sure
    Order: '',
    Rating: track.rating,
    SongID: track.id,
    Title: track.title,
    Tracknumber: track.trackNumber,
    UseCount: 0,
    Year: track.year,
  };
}

function albumToRow(album: LibraryAlbumDto) {
  return {
    Albumartist: album.artists.map((artist) => artist.name).join(', '),
    Artist: album.artists.map((artist) => artist.name).join(', '),
    FileName: album.title,
    FileType: 'album',
    Genre: album.genres.map((genre) => genre.name).join(', '),
    ImagePath: `api/mediacover_api.php?albumId=${album.id}`,
    Is_VA: false,
    LinkID: album.id,
    Title: album.title,
  };
}

function artistToRow(artist: LibraryAssociationDto) {
  return {
    FileName: artist.name,
    FileType: 'artist',
    ImagePath: `api/mediacover_api.php?artistId=${artist.id}`,
    LinkID: artist.id,
    Title: artist.name,
  };
}

function folderToRow(folder: LibraryFolderDto) {
  return {
    Title: folder.folder?.split(sep).pop() || folder.folder || '',
    FileName: folder.folder?.split(sep).pop() || folder.folder || '',
    FilePath: folder.folder,
    FileType: 'folder',
    LinkID: folder.id,
    ImagePath: `api/mediacover_api.php?folderId=${folder.id}`,
    prefix: folder.folder,
  };
}

@Injectable()
export class QnapMediaListService {
  constructor(private readonly libraryService: LibraryService) {}

  async listRandomArtists(accountId: number, limit: number) {
    const artists = await this.libraryService.listAlbumAssociations(
      accountId,
      {
        isArtist: true,
      },
      0,
      limit,
      AssociationSortFieldEnum.RANDOM,
    );
    return {
      datas: {
        data: artists.items.map(artistToRow),
      },
    };
  }

  async listRandomAlbums(accountId: number, limit: number) {
    const albums = await this.libraryService.listAlbums(accountId, {}, 0, limit, AlbumSortFieldEnum.RANDOM);
    return {
      datas: {
        data: albums.items.map(albumToRow),
      },
    };
  }

  async listArtists(
    accountId: number,
    pageSize: number,
    currentPage: number,
    sortBy: string,
    sortDirection: SortDirectionEnum,
  ) {
    const offset = (currentPage - 1) * pageSize;
    const artists = await this.libraryService.listAlbumAssociations(
      accountId,
      {
        isArtist: true,
      },
      offset,
      pageSize,
      sortBy.toLowerCase() as AssociationSortFieldEnum,
      sortDirection,
    );
    return {
      datas: {
        TotalCounts: artists.total,
        CurrPage: currentPage,
        PageSize: pageSize,
        data: artists.items.map(artistToRow),
      },
    };
  }

  async listAlbums(
    accountId: number,
    pageSize: number,
    currentPage: number,
    sortBy: string,
    sortDirection: SortDirectionEnum,
  ) {
    const offset = (currentPage - 1) * pageSize;
    const albums = await this.libraryService.listAlbums(
      accountId,
      {},
      offset,
      pageSize,
      sortBy.toLowerCase() as AlbumSortFieldEnum,
      sortDirection,
    );
    return {
      datas: {
        TotalCounts: albums.total,
        CurrPage: currentPage,
        PageSize: pageSize,
        data: albums.items.map(albumToRow),
      },
    };
  }

  async listAlbumsByArtist(
    accountId: number,
    artistId: number,
    pageSize: number,
    currentPage: number,
    sortBy: string,
    sortDirection: SortDirectionEnum,
  ) {
    const offset = (currentPage - 1) * pageSize;
    const albums = await this.libraryService.listAlbums(
      accountId,
      {
        artistIds: [artistId],
      },
      offset,
      pageSize,
      sortBy.toLowerCase() as AlbumSortFieldEnum,
      sortDirection,
    );
    return {
      datas: {
        TotalCounts: albums.total,
        CurrPage: currentPage,
        PageSize: pageSize,
        data: albums.items.filter((album) => album.artists.find((a) => a.id === artistId)).map(albumToRow),
      },
    };
  }

  async listRootFolders(accountId: number) {
    const folderTree = await this.libraryService.listFolders(accountId);
    return {
      datas: {
        data: folderTree.map(folderToRow),
      },
    };
  }

  async listFolders(accountId: number, folderId: number) {
    function findItem(treeItem: LibraryFolderDto) {
      const result = treeItem.id === folderId ? treeItem : null;
      if (result) {
        return result;
      }
      if (treeItem.children) {
        for (let i = 0, len = treeItem.children.length; i < len; i += 1) {
          const child = treeItem.children[i];
          if (child?.folder) {
            const found = findItem(child);
            if (found) {
              return found;
            }
          }
        }
      }
      return null;
    }
    const folderTree = await this.libraryService.listFolders(accountId);
    const startingFolder = folderTree.map(findItem).find((item) => item !== null);
    if (!startingFolder) {
      throw new Error(`Folder with id ${folderId} not found`);
    }
    const pathContents = startingFolder.children || [];
    const files = await this.libraryService.listTracks(
      accountId,
      {
        filePath: startingFolder.folder,
      },
      0,
      100_000,
      TrackSortFieldEnum.TITLE,
    );
    const fileItems = files.items
      .filter((track) => {
        return (
          track.filePath.startsWith(startingFolder.folder) &&
          track.filePath.lastIndexOf('/') === startingFolder.folder.length
        );
      })
      .map(songToRow);
    const folderItems = pathContents.map(folderToRow);
    return {
      datas: {
        data: [...folderItems, ...fileItems],
      },
    };
  }

  async listGenres(
    accountId: number,
    pageSize: number,
    currentPage: number,
    sortBy: string,
    sortDirection: SortDirectionEnum,
  ) {
    const offset = (currentPage - 1) * pageSize;
    const genres = await this.libraryService.listAlbumAssociationsViaTracks(
      accountId,
      {
        isGenre: true,
      },
      offset,
      pageSize,
      sortBy.toLowerCase() as AssociationSortFieldEnum,
      sortDirection,
    );
    return {
      datas: {
        TotalCounts: genres.total,
        CurrPage: currentPage,
        PageSize: pageSize,
        data: genres.items.map((genre) => {
          return {
            FileName: genre.name,
            FileType: 'genre',
            Title: genre.name,
            LinkID: genre.id.toString(),
          };
        }),
      },
    };
  }

  async listTracks(
    accountId: number,
    pageSize: number,
    currentPage: number,
    sortBy: string,
    sortDirection: SortDirectionEnum,
  ) {
    const offset = (currentPage - 1) * pageSize;
    const tracks = await this.libraryService.listTracks(
      accountId,
      {},
      offset,
      pageSize,
      sortBy.toLowerCase() as TrackSortFieldEnum,
      sortDirection,
    );
    return {
      datas: {
        TotalCounts: tracks.total,
        CurrPage: currentPage,
        PageSize: pageSize,
        data: tracks.items.map(songToRow),
      },
    };
  }

  async listTracksByAlbum(accountId: number, albumId: number) {
    const albums = await this.libraryService.retrieveAlbum(accountId, albumId);
    const album = albums[0];
    if (!album) {
      throw new Error(`Album with id ${albumId} not found`);
    }
    return {
      datas: {
        data: album.tracks.map(songToRow),
      },
    };
  }

  async listTracksByGenre(accountId: number, genreId: number, pageSize: number, currentPage: number) {
    const genres = await this.libraryService.retrieveTrackAssociation(accountId, genreId, AssociationTypeEnum.GENRE);
    const genre = genres[0];
    if (!genre) {
      throw new Error(`Genre with id ${genreId} not found`);
    }
    const offset = (currentPage - 1) * pageSize;
    const tracks = genre.albums.map((album) => album.tracks).flat();
    const paginatedTracks = tracks.slice(offset, offset + pageSize);
    return {
      datas: {
        data: paginatedTracks.map(songToRow),
        TotalCounts: tracks.length,
        CurrPage: currentPage,
        PageSize: pageSize,
      },
    };
  }

  async listTracksById(accountId: number, trackIds: number[]) {
    const tracks = await this.libraryService.retrieveTrack(accountId, trackIds);
    return {
      datas: {
        data: tracks.map(songToRow),
      },
    };
  }

  async listTracksRecentlyAdded(accountId: number) {
    const tracks = await this.libraryService.listTracks(
      accountId,
      {},
      0,
      250,
      TrackSortFieldEnum.DATE_ADDED,
      SortDirectionEnum.DESC,
    );
    return {
      datas: {
        data: tracks.items.map(songToRow),
      },
    };
  }
}
