import { Injectable } from '@nestjs/common';

@Injectable()
export class SubsonicNowPlayingService {
  // Playback sessions are not tracked yet, so nothing is ever playing.
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  async getNowPlaying(userId: number) {
    return { entry: [] };
  }
}
