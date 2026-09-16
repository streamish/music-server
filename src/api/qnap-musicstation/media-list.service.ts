import {
  AlbumArtistEntity,
  AlbumEntity,
  ArtistEntity,
  FileEntity,
  GenreEntity,
  LinkedGenreEntity,
} from 'src/database/entities';
import {
  AlbumSortFieldEnum,
  ArtistSortFieldEnum,
  GenreSortFieldEnum,
  SortDirectionEnum,
  TrackSortFieldEnum,
} from 'src/types/enums';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, NotFoundException } from '@nestjs/common';
import { LibraryAlbumDto, LibraryArtistDto, LibraryTrackDto } from 'src/library/dtos';
import { LibraryService } from 'src/library/library.service';
import { UserTreeItemDto } from '../user/folder-structure/folder-structure.dto';
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

function artistToRow(artist: LibraryArtistDto) {
  return {
    FileName: artist.name,
    FileType: 'artist',
    ImagePath: `api/mediacover_api.php?artistId=${artist.id}`,
    LinkID: artist.id,
    Title: artist.name,
  };
}

function folderToRow(folder: UserTreeItemDto) {
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
  constructor(
    @InjectModel(AlbumEntity)
    private readonly albumEntity: typeof AlbumEntity,
    @InjectModel(ArtistEntity)
    private readonly artistEntity: typeof ArtistEntity,
    @InjectModel(GenreEntity)
    private readonly genreEntity: typeof GenreEntity,
    private readonly libraryService: LibraryService,
  ) {}

  private async getAlbum(accountId: number, albumId: number) {
    const album = await this.albumEntity.findOne({
      attributes: ['id', 'title'],
      include: [
        {
          attributes: ['albumId'],
          model: AlbumArtistEntity,
          required: true,
          separate: true,
          include: [
            {
              attributes: ['name'],
              model: ArtistEntity,

              required: true,
            },
          ],
        },
      ],
      where: {
        accountId,
        id: albumId,
      },
    });
    if (!album) {
      throw new NotFoundException(`Album not found for id: ${albumId}`);
    }
    return album;
  }

  private async getArtist(accountId: number, artistId: number) {
    const artist = await this.artistEntity.findOne({
      attributes: ['id', 'name'],
      where: {
        id: artistId,
      },
      include: [
        {
          attributes: ['albumId'],
          model: AlbumArtistEntity,
          include: [
            {
              attributes: ['title'],
              model: AlbumEntity,
              where: {
                accountId,
              },
            },
          ],
        },
      ],
    });
    if (!artist) {
      throw new NotFoundException(`Artist not found for id: ${artistId}`);
    }
    return artist;
  }

  private async getGenre(accountId: number, genreId: number) {
    const genre = await this.genreEntity.findOne({
      attributes: ['id', 'name'],
      where: {
        id: genreId,
      },
      include: [
        {
          attributes: ['fileId'],
          model: LinkedGenreEntity,
          include: [
            {
              model: FileEntity,
              where: {
                accountId,
              },
            },
          ],
          separate: true,
        },
      ],
    });
    if (!genre) {
      throw new NotFoundException(`Genre not found for id: ${genreId}`);
    }
    return genre;
  }

  async listRandomArtists(accountId: number, limit: number) {
    const artists = await this.libraryService.listAlbumArtists(accountId, {}, 0, limit, ArtistSortFieldEnum.RANDOM);
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
    const artists = await this.libraryService.listAlbumArtists(
      accountId,
      {},
      offset,
      pageSize,
      sortBy.toLowerCase() as ArtistSortFieldEnum,
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
    const artist = await this.getArtist(accountId, artistId);
    const offset = (currentPage - 1) * pageSize;
    const albums = await this.libraryService.listAlbums(
      accountId,
      {
        artist: [artist.name],
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
        data: albums.items.filter((album) => album.artists.find((a) => a.name === artist.name)).map(albumToRow),
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
    function findItem(treeItem: UserTreeItemDto) {
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
    const genres = await this.libraryService.listTrackGenres(
      accountId,
      {},
      offset,
      pageSize,
      sortBy.toLowerCase() as GenreSortFieldEnum,
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
    const album = await this.getAlbum(accountId, albumId);
    const tracks = await this.libraryService.listTracks(
      accountId,
      {
        album: album.title,
        albumArtist: album.albumArtists?.map((linkedArtist) => linkedArtist?.artist?.name || '') || [],
      },
      0,
      100_000,
    );
    return {
      datas: {
        data: tracks.items.map(songToRow),
      },
    };
  }

  async listTracksByGenre(accountId: number, genreId: number) {
    const genre = await this.getGenre(accountId, genreId);
    const tracks = await this.libraryService.listTracks(
      accountId,
      {
        genre: [genre.name],
      },
      0,
      100_000,
    );
    return {
      datas: {
        data: tracks.items.map(songToRow),
      },
    };
  }

  async listTracksById(accountId: number, fileIds: number[]) {
    const tracks = await this.libraryService.listTracks(
      accountId,
      {
        fileIds,
      },
      0,
      100_000,
    );
    return {
      datas: {
        data: tracks.items.map(songToRow),
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
