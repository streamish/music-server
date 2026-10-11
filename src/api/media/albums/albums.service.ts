import { ErrorCodes } from 'src/constants/error-codes';
import { Injectable, NotFoundException } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { ListAlbumsQueryDto, ListAlbumsResponseDto, ListAlbumsWithTracksResponseDto } from './dtos';

@Injectable()
export class ApiAlbumsService {
  constructor(private readonly libraryService: LibraryService) {}

  /**
   * Returns paginated list of albums for the account, matching the specified filters.
   * @param userId The authenticated user ID
   * @param query Optional query filters
   * @returns Paginated dataset of albums
   */
  async listAlbums(userId: number, query: ListAlbumsQueryDto) {
    const albums = await this.libraryService.listAlbums(
      userId,
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
    } as unknown as ListAlbumsResponseDto;
  }

  /**
   * Returns paginated list of albums including their tracks for the account, matching the specified filters.
   * @param userId The authenticated user ID
   * @param query Optional query filters
   * @returns Paginated dataset of albums including track lists
   */
  async listAlbumsWithTracks(userId: number, query: ListAlbumsQueryDto) {
    const data = await this.libraryService.listAlbums(
      userId,
      query,
      query.offset || 0,
      query.limit || 100_000,
      query.sortField,
      query.sortDirection,
    );
    const albums = await this.libraryService.retrieveAlbum(
      userId,
      data.items.map((album) => album.id),
    );
    return {
      albums,
      limit: query.limit || 100_000,
      offset: query.offset || 0,
      total: data.total,
    } as unknown as ListAlbumsWithTracksResponseDto;
  }

  /**
   * Retrieves the specified album.
   * @param userId The authenticated user ID
   * @param albumId The album to retrieve
   * @throws If the specified album is not found
   * @returns The album including tracklists
   */
  async retrieveAlbum(userId: number, albumId: number) {
    const albums = await this.libraryService.retrieveAlbum(userId, albumId);
    const album = albums[0];
    if (!album) {
      throw new NotFoundException(ErrorCodes.ALBUM_NOT_FOUND_ERROR);
    }
    return album;
  }
}
