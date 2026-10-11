import { AlbumEntity, RootPathEntity, TrackEntity } from 'src/database/entities';
import { ErrorCodes } from 'src/constants/error-codes';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, NotFoundException } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { ListTracksQueryDto } from './dtos';
import { TrackSortFieldEnum } from 'src/types/enums';
import { join } from 'path';

@Injectable()
export class ApiTracksService {
  constructor(
    private readonly libraryService: LibraryService,
    @InjectModel(TrackEntity)
    private readonly trackEntity: typeof TrackEntity,
  ) {}

  /**
   * Returns paginated list of tracks for the account, matching the specified filters.
   * @param {number} accountId The authenticated user
   * @param {ListTracksQueryDto} query Optional query filters
   * @returns {ListTracksResponseDto} Paginated dataset of albums
   */
  async listTracks(accountId: number, query: ListTracksQueryDto) {
    const data = await this.libraryService.listTracks(
      accountId,
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

  /**
   * Returns a track's file data and information for streaming.
   * @param {number} trackId The ID of the track to retrieve.
   * @throws {NotFoundException} If the specified track is not found
   * @returns {Promise<StreamDto>} The absolute file path, codec and size for streaming the file.
   */
  async getStream(trackId: number) {
    const file = await this.trackEntity.findOne({
      attributes: ['createdAt', 'filePath', 'fileSize', 'fileType', 'updatedAt'],
      where: {
        id: trackId,
      },
      include: [
        {
          attributes: ['rootPathId'],
          model: AlbumEntity,
          include: [
            {
              attributes: ['rootPath'],
              model: RootPathEntity,
            },
          ],
        },
      ],
    });
    if (!file?.album?.rootPath?.rootPath) {
      throw new NotFoundException(ErrorCodes.TRACK_NOT_FOUND_ERROR);
    }
    return {
      codec: file.fileType,
      fileSize: file.fileSize || 0,
      path: join(file.album.rootPath.rootPath, file.filePath),
      updatedAt: file.updatedAt || file.createdAt,
    };
  }
}
