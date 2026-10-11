import { ErrorCodes } from 'src/constants/error-codes';
import { Injectable, NotFoundException } from '@nestjs/common';
import { LibraryAlbumWithTracksDto } from 'src/library/dtos';
import { LibraryService } from 'src/library/library.service';
import { ListAlbumsQueryDto, ListAlbumsResponseDto, ListAlbumsWithTracksResponseDto } from './dtos';

@Injectable()
export class ApiAlbumsService {
  constructor(private readonly libraryService: LibraryService) {}

  /**
   * Returns paginated list of albums for the account, matching the specified filters.
   * @param {number} accountId The authenticated user
   * @param {ListAlbumsQueryDto} query Optional query filters
   * @returns {ListAlbumsResponseDto} Paginated dataset of albums
   */
  async listAlbums(accountId: number, query: ListAlbumsQueryDto): Promise<ListAlbumsResponseDto> {
    const albums = await this.libraryService.listAlbums(
      accountId,
      query,
      query.offset || 0,
      query.limit || 100_000,
      query.sortField,
      query.sortDirection,
    );
    return {
      albums: albums.items,
      limit: query.limit || 100_000,
      offset: query.offset || 0,
      total: albums.total,
    } as ListAlbumsResponseDto;
  }

  /**
   * Returns paginated list of albums including their tracks for the account, matching the specified filters.
   * @param {number} accountId The authenticated user
   * @param {ListAlbumsQueryDto} query Optional query filters
   * @returns {ListAlbumsWithTracksResponseDto} Paginated dataset of albums including track lists
   */
  async listAlbumsWithTracks(accountId: number, query: ListAlbumsQueryDto): Promise<ListAlbumsWithTracksResponseDto> {
    const data = await this.libraryService.listAlbums(
      accountId,
      query,
      query.offset || 0,
      query.limit || 100_000,
      query.sortField,
      query.sortDirection,
    );
    const albums = await this.libraryService.retrieveAlbum(
      accountId,
      data.items.map((album) => album.id),
    );
    return {
      albums,
      limit: query.limit || 100_000,
      offset: query.offset || 0,
      total: data.total,
    } as ListAlbumsWithTracksResponseDto;
  }

  /**
   * Retrieves the specified album.
   * @param {number} accountId The authenticated user
   * @param {number} albumId The album to retrieve
   * @returns {LibraryAlbumWithTracksDto} The album including tracklists
   */
  async retrieveAlbum(accountId: number, albumId: number): Promise<LibraryAlbumWithTracksDto> {
    const albums = await this.libraryService.retrieveAlbum(accountId, albumId);
    const album = albums[0];
    if (!album) {
      throw new NotFoundException(ErrorCodes.ALBUM_NOT_FOUND_ERROR);
    }
    return album;
  }
}
