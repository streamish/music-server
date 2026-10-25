import { Injectable } from '@nestjs/common';
import { SubsonicSimilarSongsQueryDto } from './dtos';

@Injectable()
export class SubsonicSimilarSongsService {
  // Similarity data is not available in the library yet.
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  async getSimilarSongs(userId: number, _query: SubsonicSimilarSongsQueryDto) {
    return { song: [] };
  }
}
