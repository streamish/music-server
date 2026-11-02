/* eslint-disable max-classes-per-file */
import { PaginationQueryDto } from 'src/api/request.dto';
import { PlaylistDto } from 'src/playlists/dtos';
import { createPaginatedArrayResponseDto } from 'src/api/response.dto';

export class ListPlaylistsQueryDto extends PaginationQueryDto {}

export class ListPlaylistsResponseDto extends createPaginatedArrayResponseDto('playlists', PlaylistDto) {}
