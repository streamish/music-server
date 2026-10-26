import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { ListTracksQueryDto } from './dtos';
import { TrackSortFieldEnum } from 'src/types/enums';

@Injectable()
export class ApiTracksService {
  constructor(private readonly libraryService: LibraryService) {}

  /**
   * Returns paginated list of tracks for the account, matching the specified filters.
   * @param userId The authenticated user ID
   * @param query Optional query filters
   * @returns Paginated dataset of tracks
   */
  async listTracks(userId: number, query: ListTracksQueryDto) {
    const data = await this.libraryService.listTracks(
      userId,
      query,
      query.offset || 0,
      query.limit || 100_000,
      query.sortField || TrackSortFieldEnum.TITLE,
      query.sortDirection,
    );
    return {
      tracks: data.items,
      limit: query.limit || 100_000,
      offset: query.offset || 0,
      total: data.total,
    };
  }
}
